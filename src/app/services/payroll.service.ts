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

    // 2.5 Trienios y Sexenios
    const trieniosConfig = salaryConfig?.trienios;
    const baseTrienio = trieniosConfig?.base || 0;
    const suplementoTrienio = isCapitalina ? 0 : (trieniosConfig?.suplementoNoCapit || 0);
    const importeTrienioMensual = baseTrienio + suplementoTrienio;
    const totalTrieniosBase = (input.trienios || 0) * importeTrienioMensual;

    const sexeniosConfig = salaryConfig?.sexenios;
    const numSexenios = Math.min(input.sexenios || 0, 5);
    const totalSexeniosBase = numSexenios > 0 ? (sexeniosConfig?.[numSexenios] || 0) : 0;

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
    const trienios = totalTrieniosBase * multiplier;
    const sexenios = totalSexeniosBase * multiplier;
    const complementoDestino = baseDestino * multiplier;
    const complementoEspecifico = baseEspecifico * multiplier;
    const residencia = baseResidencia * multiplier;
    const cargoDirectivo = amountCargoDirectivo * multiplier;
    const otrosCargos = amountOtrosCargos; // Ya tiene el multiplicador aplicado en el bucle anterior

    // 6.5 Reducción por Compatibilidad Privada
    let reduccionCompatibilidad = 0;
    if (input.compatibilidadPrivada && input.diasCompatibilidad > 0) {
      // Regla: CE <= 30% de (Sueldo Base + Trienios)
      const retribucionesBasicasBase = baseSueldo + totalTrieniosBase;
      const limiteCE = retribucionesBasicasBase * 0.3;
      
      // La reducción se aplica sobre el Complemento Específico base
      const excesoCE = Math.max(0, baseEspecifico - limiteCE);
      
      // Aplicamos la proporcionalidad de los días de compatibilidad y horas lectivas
      const factorDiasCompat = input.diasCompatibilidad / 30;
      reduccionCompatibilidad = excesoCE * factorDiasCompat * factorHoras;
    }

    const totalDevengado = sueldoBase + trienios + sexenios + complementoDestino + complementoEspecifico + residencia + cargoDirectivo + otrosCargos - reduccionCompatibilidad;

    // 6. Cálculo de Bases de Cotización (incluyendo prorrateo de paga extra)
    const pagaExtraConfig = salaryConfig?.pagaExtra;
    const importeTrienioExtra = pagaExtraConfig?.trienios || 0;
    const totalTrieniosExtra = (input.trienios || 0) * importeTrienioExtra;

    const sexeniosExtraConfig = pagaExtraConfig?.sexenios;
    const totalSexeniosExtraBase = numSexenios > 0 ? (sexeniosExtraConfig?.[numSexenios] || 0) : 0;

    const basePagaExtra = pagaExtraConfig 
      ? (pagaExtraConfig.base + totalTrieniosExtra + totalSexeniosExtraBase + pagaExtraConfig.destino + pagaExtraConfig.especifico) 
      : 0;
    const prorrateoPagaExtra = (basePagaExtra * multiplier) / 6;

    const baseCotizacionCC = totalDevengado + prorrateoPagaExtra;
    const baseCotizacionCP = totalDevengado + prorrateoPagaExtra; // En este caso coinciden

    // 7. Deducciones
    const deduccionIrpf = totalDevengado * (input.irpf / 100);
    
    // Seguridad Social Detallada (aplicada sobre las bases de cotización)
    const ssConfig = (ssData as any).regimenGeneral;
    const deduccionCC = baseCotizacionCC * (ssConfig.contingenciasComunes.trabajador / 100);
    const deduccionDesempleo = baseCotizacionCP * (ssConfig.desempleo.trabajador / 100);
    const deduccionFP = baseCotizacionCP * (ssConfig.formacionProfesional.trabajador / 100);
    
    const deduccionSS = deduccionCC + deduccionDesempleo + deduccionFP;
    const totalDeducciones = deduccionIrpf + deduccionSS;

    const peSueldo = (pagaExtraConfig?.base || 0) * multiplier;
    const peTrienios = totalTrieniosExtra * multiplier;
    const peSexenios = totalSexeniosExtraBase * multiplier;
    const peDestino = (pagaExtraConfig?.destino || 0) * multiplier;
    const peEspecifico = (pagaExtraConfig?.especifico || 0) * multiplier;

    const pagaExtraBruta = peSueldo + peTrienios + peSexenios + peDestino + peEspecifico;
    const pagaExtraIrpf = pagaExtraBruta * (input.irpf / 100);
    const pagaExtraNeta = pagaExtraBruta - pagaExtraIrpf;

    return {
      input,
      totalDevengado,
      totalDeducciones,
      salarioNeto: totalDevengado - totalDeducciones,
      pagaExtraBruta,
      pagaExtraIrpf,
      pagaExtraNeta,
      pagaExtraDetalle: {
        sueldoBase: peSueldo,
        trienios: peTrienios,
        sexenios: peSexenios,
        destino: peDestino,
        especifico: peEspecifico
      },
      detalleDevengos: {
        sueldoBase,
        trienios,
        sexenios,
        complementoDestino,
        complementoEspecifico,
        residencia,
        cargoDirectivo,
        otrosCargos,
        reduccionCompatibilidad,
        otrosCargosList
      },
      detalleDeducciones: {
        irpf: deduccionIrpf,
        seguridadSocial: deduccionSS,
        baseIRPF: totalDevengado,
        basesCotizacion: {
          contingenciasComunes: baseCotizacionCC,
          contingenciasProfesionales: baseCotizacionCP
        },
        seguridadSocialDetalle: {
          contingenciasComunes: deduccionCC,
          desempleo: deduccionDesempleo,
          formacionProfesional: deduccionFP
        }
      }
    };
  }
}
