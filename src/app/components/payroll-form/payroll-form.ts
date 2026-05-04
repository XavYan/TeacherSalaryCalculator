import { Component, EventEmitter, Output, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PayrollInput } from '../../models/payroll.model';
import salariosData from '../../../assets/data/salarios.json';
import complementosData from '../../../assets/data/complementos.json';

interface SalaryData {
  cuerpo: string;
  sueldoBase: number;
  trienios: {
    base: number;
    suplementoNoCapit: number;
  };
  destino: number;
  especifico: number;
  residencia: {
    islaCapit: number;
    islaNoCapit: number;
  };
}

@Component({
  selector: 'app-payroll-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="payrollForm" (ngSubmit)="onSubmit()" class="row g-4">
      <!-- Datos Personales -->
      <div class="col-md-8">
        <label class="form-label fw-bold">Nombre completo y apellidos</label>
        <div class="input-group shadow-sm">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-person-fill text-primary"></i></span>
          <input type="text" formControlName="nombreCompleto" class="form-control border-start-0" placeholder="Ej: Juan Pérez García">
        </div>
      </div>
      
      <div class="col-md-4">
        <label class="form-label fw-bold">DNI</label>
        <div class="input-group shadow-sm">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-card-text text-primary"></i></span>
          <input type="text" formControlName="dni" class="form-control border-start-0" placeholder="12345678X">
        </div>
      </div>

      <!-- Cuerpo e Isla -->
      <div class="col-md-6">
        <label class="form-label fw-bold">Cuerpo</label>
        <select formControlName="cuerpo" (change)="onCuerpoChange()" class="form-select shadow-sm">
          <option value="" disabled>Seleccione un cuerpo...</option>
          <option *ngFor="let s of salarios" [value]="s.cuerpo">{{ s.cuerpo }}</option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label fw-bold">Isla</label>
        <select formControlName="isla" class="form-select shadow-sm">
          <option value="" disabled>Seleccione una isla...</option>
          <optgroup label="Islas Capitalinas">
            <option value="Gran Canaria">Gran Canaria</option>
            <option value="Tenerife">Tenerife</option>
          </optgroup>
          <optgroup label="Otras Islas">
            <option value="La Palma">La Palma</option>
            <option value="La Gomera">La Gomera</option>
            <option value="El Hierro">El Hierro</option>
            <option value="Lanzarote">Lanzarote</option>
            <option value="Fuerteventura">Fuerteventura</option>
          </optgroup>
        </select>
      </div>

      <!-- Tabla de información salarial -->
      <div class="col-12" *ngIf="selectedSalary()">
        <div class="mt-2 animate__animated animate__fadeIn">
          <div class="table-responsive rounded-3 shadow-sm border overflow-hidden">
            <table class="table table-sm table-hover bg-white mb-0">
              <thead class="table-primary text-white border-0">
                <tr class="small text-center">
                  <th class="py-2">Sueldo Base</th>
                  <th class="py-2">Trienios</th>
                  <th class="py-2">C. Destino</th>
                  <th class="py-2">C. Específico</th>
                  <th class="py-2" [class.bg-warning]="isCapitalinaSelected()">Residencia (Cap.)</th>
                  <th class="py-2" [class.bg-warning]="isNoCapitalinaSelected()">Residencia (No Cap.)</th>
                </tr>
              </thead>
              <tbody>
                <tr class="text-center fw-medium py-3">
                  <td class="py-3">{{ selectedSalary()?.sueldoBase | currency:'EUR' }}</td>
                  <td class="py-3">
                    {{ selectedSalary()?.trienios?.base | currency:'EUR' }}
                    <span *ngIf="isNoCapitalinaSelected()" class="text-success small d-block">
                      +{{ selectedSalary()?.trienios?.suplementoNoCapit | currency:'EUR' }} (Supl.)
                    </span>
                  </td>
                  <td class="py-3">{{ selectedSalary()?.destino | currency:'EUR' }}</td>
                  <td class="py-3">{{ selectedSalary()?.especifico | currency:'EUR' }}</td>
                  <td class="py-3" [class.table-warning]="isCapitalinaSelected()">
                    {{ selectedSalary()?.residencia?.islaCapit | currency:'EUR' }}
                  </td>
                  <td class="py-3" [class.table-warning]="isNoCapitalinaSelected()">
                    {{ selectedSalary()?.residencia?.islaNoCapit | currency:'EUR' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Fecha de la Nómina -->
      <div class="col-md-6">
        <label class="form-label fw-bold">Mes</label>
        <select formControlName="mes" class="form-select shadow-sm">
          <option *ngFor="let m of meses; let i = index" [value]="i + 1">{{ m }}</option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label fw-bold">Año</label>
        <input type="number" formControlName="anio" class="form-control shadow-sm" placeholder="Ej: 2024">
      </div>

      <!-- Parámetros de Trabajo -->
      <div class="col-md-6">
        <label class="form-label fw-bold">Días trabajados (máximo 30 días)</label>
        <input type="number" formControlName="diasTrabajados" class="form-control shadow-sm" placeholder="Ej: 30">
      </div>

      <div class="col-md-6">
        <label class="form-label fw-bold">Horas lectivas (máximo 18 horas)</label>
        <input type="number" formControlName="horasSemanales" class="form-control shadow-sm" placeholder="Ej: 18">
      </div>

      <!-- Cargos Directivos (Nuevo Bloque) -->
      <div class="col-12">
        <div class="card border-0 bg-light shadow-sm">
          <div class="card-body row g-3">
            <div class="col-md-8">
              <label class="form-label fw-bold">Cargo Directivo</label>
              <select formControlName="cargoDirectivo" (change)="onCargoChange()" class="form-select border-primary-subtle">
                <option value="">Ninguno / Sin cargo directivo</option>
                <option *ngFor="let c of cargosDirectivos" [value]="c">{{ c }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Tipo de Centro</label>
              <select formControlName="tipoCentro" (change)="onCargoChange()" class="form-select border-primary-subtle" [attr.disabled]="!payrollForm.get('cargoDirectivo')?.value ? true : null">
                <option value="" disabled>Seleccione...</option>
                <option *ngFor="let t of tiposCentro" [value]="t">Tipo {{ t }}</option>
              </select>
            </div>
            
            <!-- Tabla Informativa Cargo Directivo -->
            <div class="col-12 mt-2" *ngIf="selectedCargoAmount() !== null">
              <div class="animate__animated animate__fadeIn">
                <div class="table-responsive rounded-3 shadow-sm border overflow-hidden">
                  <table class="table table-sm table-hover bg-white mb-0">
                    <thead class="table-info text-dark border-0">
                      <tr class="small text-center">
                        <th class="py-2">Cargo</th>
                        <th class="py-2">Centro</th>
                        <th class="py-2">Suplemento Mensual</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="text-center fw-medium py-3">
                        <td class="py-3">{{ payrollForm.get('cargoDirectivo')?.value }}</td>
                        <td class="py-3">Tipo {{ payrollForm.get('tipoCentro')?.value }}</td>
                        <td class="py-3 text-primary fw-bold">{{ selectedCargoAmount() | currency:'EUR' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Otros Complementos (Diseño Stacked) -->
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label fw-bold mb-0">Otros Complementos y Cargos</label>
          <button *ngIf="selectedOtros().length > 0" 
                  type="button" 
                  class="btn btn-link btn-sm text-danger text-decoration-none p-0 animate__animated animate__fadeIn" 
                  (click)="clearAllComplementos()">
            <i class="bi bi-trash3 me-1"></i>Eliminar todos
          </button>
        </div>
        <div class="input-group shadow-sm mb-3">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-plus-circle text-primary"></i></span>
          <select class="form-select border-start-0" (change)="addComplemento($event)" #complementoSelect>
            <option value="" selected>Seleccione un complemento para añadirlo...</option>
            <option *ngFor="let c of otrosCargosKeys" [value]="c" [disabled]="selectedOtros().includes(c)">
              {{ c }} {{ selectedOtros().includes(c) ? '(seleccionado)' : '' }} ({{ complementosData['otros cargos'][c] | currency:'EUR' }})
            </option>
          </select>
        </div>

        <!-- Lista de complementos seleccionados -->
        <div class="selected-complements d-flex flex-column gap-2">
          <div *ngFor="let c of selectedOtros()" class="complement-badge d-flex justify-content-between align-items-center p-2 rounded-3 border bg-white animate__animated animate__fadeInLeft">
            <div class="d-flex align-items-center">
              <i class="bi bi-check-circle-fill text-success me-2"></i>
              <span class="fw-medium">{{ c }}</span>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="text-primary fw-bold">{{ complementosData['otros cargos'][c] | currency:'EUR' }}</span>
              <button type="button" class="btn btn-outline-danger btn-sm border-0 rounded-circle p-1 leading-none" (click)="removeComplemento(c)">
                <i class="bi bi-x-circle fs-5"></i>
              </button>
            </div>
          </div>
          
          <div *ngIf="selectedOtros().length === 0" class="text-center py-3 border border-dashed rounded-3 bg-light opacity-75">
            <p class="text-muted mb-0 small">No hay complementos adicionales seleccionados.</p>
          </div>
        </div>
      </div>

      <!-- Parámetros Económicos -->
      <div class="col-md-6">
        <label class="form-label fw-bold">IRPF (%)</label>
        <div class="input-group shadow-sm">
          <input type="number" formControlName="irpf" class="form-control" placeholder="Ej: 15">
          <span class="input-group-text bg-white">%</span>
        </div>
      </div>



      <div class="col-12 mt-5 text-center">
        <button type="submit" class="btn btn-primary btn-lg px-5 shadow-sm" [disabled]="payrollForm.invalid">
          <i class="bi bi-calculator me-2"></i>Calcular Nómina
        </button>
      </div>
    </form>
  `,
  styles: `
    .form-label { margin-bottom: 0.5rem; color: #495057; }
    .table-responsive { border-color: #dee2e6 !important; }
    .table th { font-weight: 600; font-size: 0.85rem; }
    .animate__fadeIn { animation: fadeIn 0.4s ease-in-out; }
    .animate__fadeInLeft { animation: fadeInLeft 0.3s ease-out; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .input-group-text { border-color: #dee2e6; }
    .form-control:focus, .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
    }
    
    .complement-badge {
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .complement-badge:hover {
      border-color: #0d6efd !important;
      background-color: #f8fbff !important;
    }
    .border-dashed {
      border-style: dashed !important;
    }
    .card.bg-light {
      background-color: #f8f9fa !important;
      border: 1px solid #e9ecef !important;
    }
  `
})
export class PayrollForm {
  private fb = inject(FormBuilder);
  
  @Output() calculate = new EventEmitter<PayrollInput>();

  salarios: SalaryData[] = salariosData as SalaryData[];
  complementosData: any = complementosData;
  
  cargosDirectivos: string[] = Object.keys(this.complementosData['cargos directivos']);
  tiposCentro: string[] = ['A', 'B', 'C', 'D', 'E', 'F'];
  otrosCargosKeys: string[] = Object.keys(this.complementosData['otros cargos']).sort();
  
  selectedSalary = signal<SalaryData | undefined>(undefined);
  selectedOtros = signal<string[]>([]);
  selectedCargoAmount = signal<number | null>(null);



  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  isCapitalinaSelected(): boolean {
    const isla = this.payrollForm.get('isla')?.value;
    return isla === 'Gran Canaria' || isla === 'Tenerife';
  }

  isNoCapitalinaSelected(): boolean {
    const isla = this.payrollForm.get('isla')?.value;
    return isla !== '' && !this.isCapitalinaSelected();
  }

  payrollForm: FormGroup = this.fb.group({
    nombreCompleto: [''],
    dni: [''],
    cuerpo: ['', [Validators.required]],
    isla: ['', [Validators.required]],
    mes: [new Date().getMonth() + 1, [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.required]],
    diasTrabajados: [30, [Validators.required, Validators.min(1), Validators.max(30)]],
    horasSemanales: [18, [Validators.required, Validators.min(1), Validators.max(18)]],
    cargoDirectivo: [''],
    tipoCentro: [''],
    complementos: [[]],
    irpf: [15, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  onCuerpoChange() {
    const cuerpoValue = this.payrollForm.get('cuerpo')?.value;
    const found = this.salarios.find(s => s.cuerpo === cuerpoValue);
    this.selectedSalary.set(found);
  }

  onCargoChange() {
    const cargo = this.payrollForm.get('cargoDirectivo')?.value;
    const tipo = this.payrollForm.get('tipoCentro')?.value;
    if (cargo && tipo) {
      const amount = this.complementosData['cargos directivos'][cargo]?.[`Tipo ${tipo}`] || 0;
      this.selectedCargoAmount.set(amount);
    } else {
      this.selectedCargoAmount.set(null);
    }
  }

  addComplemento(event: any) {
    const value = event.target.value;
    if (!value) return;

    const current = this.selectedOtros();
    if (!current.includes(value)) {
      const updated = [...current, value].sort((a, b) => a.localeCompare(b));
      this.selectedOtros.set(updated);
      this.payrollForm.patchValue({ complementos: updated });
    }
    
    event.target.value = "";
  }

  removeComplemento(name: string) {
    const current = this.selectedOtros();
    const updated = current.filter(c => c !== name);
    this.selectedOtros.set(updated);
    this.payrollForm.patchValue({ complementos: updated });
  }

  clearAllComplementos() {
    this.selectedOtros.set([]);
    this.payrollForm.patchValue({ complementos: [] });
  }

  onSubmit() {
    if (this.payrollForm.valid) {
      this.calculate.emit(this.payrollForm.value);
    }
  }
}
