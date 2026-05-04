import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollResult } from '../../models/payroll.model';

@Component({
  selector: 'app-payroll-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="result" class="mt-5 animate__animated animate__fadeIn">
      <div class="card border-0 bg-light rounded-4 overflow-hidden">
        <div class="card-header bg-dark text-white p-3 text-center border-0">
          <h4 class="mb-0">Resumen de la Nómina</h4>
        </div>
        <div class="card-body p-4">
          <div class="row text-center mb-4">
            <div class="col-12">
              <span class="text-muted text-uppercase small fw-bold">Salario Neto Mensual</span>
              <h2 class="display-4 text-success fw-bold mb-0">{{ result.salarioNeto | currency:'EUR' }}</h2>
              <div class="mt-2 text-muted animate__animated animate__fadeIn">
                <span class="x-small text-uppercase fw-bold">Paga Extra Neta:</span>
                <span class="ms-2 fw-medium text-primary">{{ result.pagaExtraNeta | currency:'EUR' }}</span>
              </div>
            </div>
          </div>

          <!-- Resumen de Opciones -->
          <div class="card border-0 bg-white shadow-sm mb-4">
            <div class="card-body p-3">
              <h6 class="text-primary small fw-bold text-uppercase mb-3 border-bottom pb-2">Información de la Nómina</h6>
              <div class="row g-2 small">
                <div class="col-md-6">
                  <span class="text-muted text-uppercase x-small">Cuerpo:</span> &nbsp;<span class="fw-medium">{{ result.input.cuerpo }}</span>
                </div>
                <div class="col-md-6">
                  <span class="text-muted text-uppercase x-small">Isla:</span> &nbsp;<span class="fw-medium">{{ result.input.isla }}</span>
                </div>
                <div class="col-md-6">
                  <span class="text-muted text-uppercase x-small">Periodo:</span> &nbsp;<span class="fw-medium">{{ meses[result.input.mes - 1] }} / {{ result.input.anio }}</span>
                </div>
                <div class="col-md-6">
                  <span class="text-muted text-uppercase x-small">Trabajado:</span> &nbsp;<span class="fw-medium">{{ result.input.diasTrabajados }} días / {{ result.input.horasSemanales }}h lectivas</span>
                </div>
                <div class="col-md-6" *ngIf="result.input.cargoDirectivo">
                  <span class="text-muted text-uppercase x-small">Cargo:</span> &nbsp;<span class="fw-medium">{{ result.input.cargoDirectivo }} (Tipo {{ result.input.tipoCentro }})</span>
                </div>
                <div class="col-md-6" *ngIf="result.input.complementos.length > 0">
                  <span class="text-muted text-uppercase x-small d-block mb-1">Otros cargos:</span>
                  <ul class="list-unstyled ps-2 mb-0">
                    <li *ngFor="let c of result.input.complementos" class="fw-medium text-dark x-small">
                      <i class="bi bi-chevron-right me-1 x-small"></i>{{ c }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="list-group list-group-flush rounded-3 shadow-sm border mb-4">
            <div class="list-group-item bg-light-subtle py-2 px-3">
              <span class="text-muted small fw-bold text-uppercase">Desglose de Devengos</span>
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span>Sueldo Base</span>
              <span>{{ result.detalleDevengos.sueldoBase | currency:'EUR' }}</span>
            </div>
            <div *ngIf="result.detalleDevengos.trienios > 0" class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span>Trienios ({{ result.input.trienios }})</span>
              <span>{{ result.detalleDevengos.trienios | currency:'EUR' }}</span>
            </div>
            <div *ngIf="result.detalleDevengos.sexenios > 0" class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span>Sexenios ({{ result.input.sexenios }})</span>
              <span>{{ result.detalleDevengos.sexenios | currency:'EUR' }}</span>
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span>C. Destino</span>
              <span>{{ result.detalleDevengos.complementoDestino | currency:'EUR' }}</span>
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span>C. Específico</span>
              <span>{{ result.detalleDevengos.complementoEspecifico | currency:'EUR' }}</span>
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span>Residencia</span>
              <span>{{ result.detalleDevengos.residencia | currency:'EUR' }}</span>
            </div>
            <div *ngIf="result.detalleDevengos.cargoDirectivo > 0" class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span>Cargo Directivo</span>
              <span>{{ result.detalleDevengos.cargoDirectivo | currency:'EUR' }}</span>
            </div>
            <div *ngIf="result.detalleDevengos.otrosCargos > 0">
              <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small bg-light-subtle">
                <span class="fw-medium text-muted">Otros Complementos (Total)</span>
                <span class="fw-medium">{{ result.detalleDevengos.otrosCargos | currency:'EUR' }}</span>
              </div>
              <div *ngFor="let item of result.detalleDevengos.otrosCargosList" class="list-group-item d-flex justify-content-between align-items-center py-1 px-4 border-0 small opacity-75">
                <span class="fst-italic">- {{ item.nombre }}</span>
                <span>{{ item.importe | currency:'EUR' }}</span>
              </div>
            </div>
            <div *ngIf="result.detalleDevengos.reduccionCompatibilidad > 0" class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span class="text-danger fw-medium">Reducción por Compatibilidad</span>
              <span class="text-danger">-{{ result.detalleDevengos.reduccionCompatibilidad | currency:'EUR' }}</span>
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center bg-success-subtle p-3">
              <span class="fw-bold">Total Devengado (Bruto)</span>
              <span class="fw-bold text-success">{{ result.totalDevengado | currency:'EUR' }}</span>
            </div>
          </div>

          <div class="list-group list-group-flush rounded-3 shadow-sm border">
            <div class="list-group-item bg-light-subtle py-2 px-3">
              <span class="text-muted small fw-bold text-uppercase">Deducciones</span>
            </div>
            <!-- Bases de Cotización -->
            <div class="list-group-item bg-white py-2 px-3 border-bottom-0">
              <div class="row g-2 x-small text-muted fst-italic">
                <div class="col-6">Base IRPF: {{ result.detalleDeducciones.baseIRPF | currency:'EUR' }}</div>
                <div class="col-6 text-end">Base CC: {{ result.detalleDeducciones.basesCotizacion.contingenciasComunes | currency:'EUR' }}</div>
                <div class="col-12">Base CP/Desempleo/FP: {{ result.detalleDeducciones.basesCotizacion.contingenciasProfesionales | currency:'EUR' }}</div>
              </div>
            </div>
            
            <div class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
              <span>Retención IRPF ({{ result.input.irpf }}%)</span>
              <span class="text-danger">-{{ result.detalleDeducciones.irpf | currency:'EUR' }}</span>
            </div>
            <div class="list-group-item p-0 border-0">
              <div class="d-flex justify-content-between align-items-center py-2 px-3 small bg-light-subtle">
                <span class="fw-medium text-muted">Seguridad Social (6,50%)</span>
                <span class="fw-medium text-danger">-{{ result.detalleDeducciones.seguridadSocial | currency:'EUR' }}</span>
              </div>
              <div class="px-4 py-1 small opacity-75">
                <div class="d-flex justify-content-between mb-1">
                  <span class="fst-italic">- Contingencias Comunes (4,85%)</span>
                  <span>{{ result.detalleDeducciones.seguridadSocialDetalle.contingenciasComunes | currency:'EUR' }}</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span class="fst-italic">- Desempleo (1,55%)</span>
                  <span>{{ result.detalleDeducciones.seguridadSocialDetalle.desempleo | currency:'EUR' }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="fst-italic">- Formación Prof. (0,10%)</span>
                  <span>{{ result.detalleDeducciones.seguridadSocialDetalle.formacionProfesional | currency:'EUR' }}</span>
                </div>
              </div>
            </div>
            <div class="list-group-item d-flex justify-content-between align-items-center bg-danger-subtle p-3">
              <span class="fw-bold">Total Deducciones</span>
              <span class="fw-bold text-danger">{{ result.totalDeducciones | currency:'EUR' }}</span>
            </div>
          </div>

          <!-- Información Paga Extra -->
          <div class="mt-4 card border-0 bg-white shadow-sm overflow-hidden">
            <div class="card-header bg-primary text-white py-2 px-3 border-0">
              <span class="small fw-bold text-uppercase">Desglose Paga Extra (Estimada)</span>
            </div>
            <div class="card-body p-0">
              <ul class="list-group list-group-flush">
                <li class="list-group-item bg-light py-1 px-3">
                  <span class="x-small text-muted fw-bold text-uppercase">Desglose del Bruto (Extra)</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center py-1 px-4 border-0 small opacity-75">
                  <span class="fst-italic">Sueldo Base Extra</span>
                  <span>{{ result.pagaExtraDetalle.sueldoBase | currency:'EUR' }}</span>
                </li>
                <li *ngIf="result.pagaExtraDetalle.trienios > 0" class="list-group-item d-flex justify-content-between align-items-center py-1 px-4 border-0 small opacity-75">
                  <span class="fst-italic">Trienios Extra</span>
                  <span>{{ result.pagaExtraDetalle.trienios | currency:'EUR' }}</span>
                </li>
                <li *ngIf="result.pagaExtraDetalle.sexenios > 0" class="list-group-item d-flex justify-content-between align-items-center py-1 px-4 border-0 small opacity-75">
                  <span class="fst-italic">Sexenios Extra</span>
                  <span>{{ result.pagaExtraDetalle.sexenios | currency:'EUR' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center py-1 px-4 border-0 small opacity-75">
                  <span class="fst-italic">C. Destino Extra</span>
                  <span>{{ result.pagaExtraDetalle.destino | currency:'EUR' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center py-1 px-4 border-0 small opacity-75">
                  <span class="fst-italic">C. Específico Extra</span>
                  <span>{{ result.pagaExtraDetalle.especifico | currency:'EUR' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small bg-white border-top">
                  <span class="fw-bold">Total Bruto Extra</span>
                  <span class="fw-bold">{{ result.pagaExtraBruta | currency:'EUR' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-3 small">
                  <span>Deducción IRPF ({{ result.input.irpf }}%)</span>
                  <span class="text-danger">-{{ result.pagaExtraIrpf | currency:'EUR' }}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center py-3 px-3 bg-primary-subtle">
                  <span class="fw-bold">Importe Neto Final</span>
                  <span class="h5 mb-0 text-primary fw-bold">{{ result.pagaExtraNeta | currency:'EUR' }}</span>
                </li>
              </ul>
              <div class="p-2 bg-light border-top">
                <p class="x-small text-muted mb-0 fst-italic">
                  <i class="bi bi-info-circle me-1"></i>
                  El importe bruto de la paga extra incluye la parte proporcional de trienios y sexenios reconocidos.
                </p>
                <p class="x-small text-muted mb-0 fst-italic mt-1">
                  <i class="bi bi-info-circle me-1"></i>
                  La paga extra no está sujeta a descuentos de Seguridad Social en el momento del cobro, ya que estos se prorratean mensualmente en las bases de cotización.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-white rounded-3 border border-info-subtle">
            <p class="mb-0 small text-muted">
              <i class="bi bi-info-circle-fill text-info me-2"></i>
              Este es un cálculo estimado basado en los datos introducidos. Los valores reales pueden variar según la comunidad autónoma y circunstancias personales.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .animate__fadeIn {
      animation: fadeIn 0.6s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .x-small { font-size: 0.75rem; }
  `
})
export class PayrollResultComponent {
  @Input() result?: PayrollResult;

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
}
