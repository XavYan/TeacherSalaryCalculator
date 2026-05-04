import { Injectable } from '@angular/core';
import { PayrollInput, PayrollResult } from '../models/payroll.model';
import salariosData from '../../assets/data/salarios.json';
import complementosData from '../../assets/data/complementos.json';
import ssData from '../../assets/data/seguridad_social.json';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  constructor() { }

  calculatePayroll(input: PayrollInput): PayrollResult {
    // 1. Obtener datos base del cuerpo
    const salaryConfig = (salariosData as any[]).find(s => s.cuerpo === input.cuerpo);
    const baseSueldo = salaryConfig?.sueldoBase || 0;
    const baseDestino = salaryConfig?.destino || 0;
    const baseEspecifico = salaryConfig?.especifico || 0;
    
    // 2. Residencia
    const isCapitalina = input.isla === 'Gran Canaria' || input.isla === 'Tenerife';
    const baseResidencia = isCapitalina 
      ? (salaryConfig?.residencia?.islaCapit || 0)
      : (salaryConfig?.residencia?.islaNoCapit || 0);

    // 3. Cargos Directivos
    let amountCargoDirectivo = 0;
    if (input.cargoDirectivo && input.tipoCentro) {
      amountCargoDirectivo = (complementosData as any)['cargos directivos'][input.cargoDirectivo]?.[`Tipo ${input.tipoCentro}`] || 0;
    }

    // 4. Proporcionalidad
    const factorDias = input.diasTrabajados / 30;
    const factorHoras = input.horasSemanales / 18;
    const multiplier = factorDias * factorHoras;

    // 5. Otros Complementos
    let amountOtrosCargos = 0;
    const otrosCargosList: { nombre: string; importe: number }[] = [];
    
    input.complementos.forEach(c => {
      const baseAmount = (complementosData as any)['otros cargos'][c] || 0;
      const actualAmount = baseAmount * multiplier;
      amountOtrosCargos += actualAmount;
      otrosCargosList.push({ nombre: c, importe: actualAmount });
    });

    // 6. Cálculo de Devengos Proporcionales
    const sueldoBase = baseSueldo * multiplier;
    const complementoDestino = baseDestino * multiplier;
    const complementoEspecifico = baseEspecifico * multiplier;
    const residencia = baseResidencia * multiplier;
    const cargoDirectivo = amountCargoDirectivo * multiplier;
    const otrosCargos = amountOtrosCargos; // Ya tiene el multiplicador aplicado en el bucle anterior

    const totalDevengado = sueldoBase + complementoDestino + complementoEspecifico + residencia + cargoDirectivo + otrosCargos;

    // 6. Deducciones
    const deduccionIrpf = totalDevengado * (input.irpf / 100);
    
    // Seguridad Social Detallada
    const ssConfig = (ssData as any).regimenGeneral;
    const deduccionCC = totalDevengado * (ssConfig.contingenciasComunes.trabajador / 100);
    const deduccionDesempleo = totalDevengado * (ssConfig.desempleo.trabajador / 100);
    const deduccionFP = totalDevengado * (ssConfig.formacionProfesional.trabajador / 100);
    
    const deduccionSS = deduccionCC + deduccionDesempleo + deduccionFP;
    const totalDeducciones = deduccionIrpf + deduccionSS;

    return {
      input,
      totalDevengado,
      totalDeducciones,
      salarioNeto: totalDevengado - totalDeducciones,
      detalleDevengos: {
        sueldoBase,
        complementoDestino,
        complementoEspecifico,
        residencia,
        cargoDirectivo,
        otrosCargos,
        otrosCargosList
      },
      detalleDeducciones: {
        irpf: deduccionIrpf,
        seguridadSocial: deduccionSS,
        seguridadSocialDetalle: {
          contingenciasComunes: deduccionCC,
          desempleo: deduccionDesempleo,
          formacionProfesional: deduccionFP
        }
      }
    };
  }
}
