import { contractVacationAccrual } from './vacation-accrual';
import { contractExtraAccrual, contractMonths, ExtraAccrual } from './extra-accrual';
import { Injectable } from '@angular/core';
import { PayrollInput, PayrollResult, PayrollMonth, PayrollExtra, ContractTotals, AnnualTotals } from '../models/payroll.model';
import salariosData from '../../assets/data/salarios.json';
import complementosData from '../../assets/data/complementos.json';
import ssData from '../../assets/data/seguridad_social.json';

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const sum = (...values: number[]) => money(values.reduce((a, b) => a + b, 0));
const familias = complementosData['cargos directivos'] as Record<string, Record<string, Record<string, number | null>>>;

@Injectable({ providedIn: 'root' })
export class PayrollService {
  calculatePayroll(input: PayrollInput): PayrollResult {
    const devengos = contractExtraAccrual(input.fechaInicioContrato, input.fechaFinContrato);
    if (!Number.isFinite(input.diasTrabajados) || input.diasTrabajados < 1 || input.diasTrabajados > 30) throw new Error('Indique entre 1 y 30 días trabajados.');
    const result = this.calculateBase(input, devengos);
    const months = contractMonths(input.fechaInicioContrato, input.fechaFinContrato);
    const devengoVacaciones = contractVacationAccrual(months);
    const vacationDays = devengoVacaciones.diasPendientes;
    // Repetimos las condiciones del mes de referencia; las unidades variables
    // se proyectan por día retribuido, sin volver a aplicar el factor de jornada.
    const monthly = (days: number, year: number, month: number, vacaciones = false): PayrollMonth => {
      const cantidades = Object.fromEntries(Object.entries(input.cantidadesComplementos ?? {}).map(([key, value]) => [key, value * days / input.diasTrabajados]));
      const computed = this.calculateBase({ ...input, diasTrabajados: days,
        diasCompatibilidad: input.diasCompatibilidad / input.diasTrabajados * days,
        cantidadesComplementos: cantidades,
        complementos: vacaciones ? input.complementos.filter(c => c !== 'Itinerancia (€/km)' && !c.startsWith('Hora lectiva complementaria')) : input.complementos
      });
      return { ...computed, input: { ...computed.input, anio: year, mes: month } };
    };
    const totals = (p: PayrollMonth): ContractTotals => ({ bruto:p.totalDevengado, irpf:p.detalleDeducciones.irpf, seguridadSocial:p.detalleDeducciones.seguridadSocial, neto:p.salarioNeto });
    const add = (a: ContractTotals, b: ContractTotals): ContractTotals => ({ bruto:sum(a.bruto,b.bruto), irpf:sum(a.irpf,b.irpf), seguridadSocial:sum(a.seguridadSocial,b.seguridadSocial), neto:sum(a.neto,b.neto) });
    const empty = (): ContractTotals => ({ bruto:0, irpf:0, seguridadSocial:0, neto:0 });
    const annual = new Map<number, AnnualTotals>();
    let last!: PayrollMonth;
    for (const month of months) {
      const payroll = monthly(month.dias, month.anio, month.mes);
      const previous = annual.get(month.anio) ?? { ...empty(), anio:month.anio, brutoNominas:0, brutoExtras:0, brutoVacaciones:0 };
      annual.set(month.anio, { ...previous, ...add(previous, totals(payroll)), brutoNominas:sum(previous.brutoNominas,payroll.totalDevengado) });
      last = payroll;
    }
    for (const extra of result.pagasExtra) {
      const previous = annual.get(extra.anio)!;
      annual.set(extra.anio, { ...previous,
        ...add(previous, { bruto:extra.pagaExtraBruta, irpf:extra.pagaExtraIrpf, seguridadSocial:extra.pagaExtraCuotas, neto:extra.pagaExtraNeta }),
        brutoExtras:sum(previous.brutoExtras,extra.pagaExtraBruta) });
    }
    let vacaciones = empty();
    for (let remaining = vacationDays; remaining > 1e-8; remaining -= 30) {
      vacaciones = add(vacaciones, totals(monthly(Math.min(30,remaining),last.input.anio,last.input.mes,true)));
    }
    const lastYear = annual.get(last.input.anio)!;
    annual.set(lastYear.anio, { ...lastYear, ...add(lastYear,vacaciones), brutoVacaciones:vacaciones.bruto });
    const extraPendiente = result.pagasExtra.find(e => e.seLiquidaAlCese);
    const extraTotal = extraPendiente ? { bruto:extraPendiente.pagaExtraBruta, irpf:extraPendiente.pagaExtraIrpf, seguridadSocial:extraPendiente.pagaExtraCuotas, neto:extraPendiente.pagaExtraNeta } : empty();
    return { ...result,
      mesCompleto: input.mostrarMesCompleto ? monthly(30,input.anio,input.mes) : undefined,
      liquidacion: { fecha:input.fechaFinContrato, ultimaNomina:last, extraPendiente, vacaciones, diasVacaciones:vacationDays, devengoVacaciones, total:add(extraTotal,vacaciones) },
      totalesAnuales:[...annual.values()]
    };
  }

  private calculateBase(input: PayrollInput, devengos: ExtraAccrual[] = []): PayrollMonth & { pagasExtra: PayrollExtra[] } {
    const config = salariosData.find(s => s.cuerpo === input.cuerpo);
    if (!config) throw new Error('Seleccione un cuerpo válido.');
    const range = (n: number, min: number, max: number) => Number.isFinite(n) && n >= min && n <= max;
    if (input.anio !== 2026 || !range(input.mes, 1, 12) || !Number.isInteger(input.mes) ||
        !range(input.diasTrabajados, 0.0001, 30) || !range(input.irpf, 0, 100) ||
        !Number.isInteger(input.trienios) || input.trienios < 0 ||
        !Number.isInteger(input.sexenios) || !range(input.sexenios, 0, 5)) {
      throw new Error('Revise los datos: las tablas disponibles corresponden a 2026.');
    }
    const jornada = input.porcentajeJornada === undefined ? input.horasSemanales / 18 : input.porcentajeJornada / 100;
    if (!range(jornada, 0.0001, 1)) throw new Error('Porcentaje de jornada inválido.');
    const factorDias = input.diasTrabajados / 30;
    const multiplier = factorDias * jornada;
    const capitalina = ['Gran Canaria', 'Tenerife'].includes(input.isla);
    if (!['Gran Canaria', 'Tenerife', 'La Palma', 'La Gomera', 'El Hierro', 'Lanzarote', 'Fuerteventura'].includes(input.isla)) throw new Error('Isla inválida.');
    const grupoA1 = ['Secundaria', 'Catedráticos'].includes(input.cuerpo);
    const pasivos = input.regimen === 'pasivos';
    if (input.regimen && !['general', 'pasivos'].includes(input.regimen)) throw new Error('Régimen inválido.');
    const sexenio = (config.sexenios as Record<string, number>)[input.sexenios] ?? 0;
    const extraSexenio = (config.pagaExtra.sexenios as Record<string, number>)[input.sexenios] ?? 0;
    let baseCargo = 0;
    if (input.cargoDirectivo) {
      const amount = familias[input.familiaCentro ?? '']?.[input.cargoDirectivo]?.[`Tipo ${input.tipoCentro}`];
      if (amount == null) throw new Error('El cargo no está disponible en esa familia y tipo de centro.');
      baseCargo = amount;
    }
    let itinerancia = 0;
    const otrosCargosList = [...new Set(input.complementos)].map(nombre => {
      const tarifa = (complementosData['otros cargos'] as Record<string, number>)[nombre];
      if (tarifa === undefined) throw new Error('Complemento desconocido.');
      const variable = nombre === 'Itinerancia (€/km)' || nombre.startsWith('Hora lectiva complementaria');
      const cantidad = variable ? input.cantidadesComplementos?.[nombre] : 1;
      if (cantidad === undefined || !Number.isFinite(cantidad) || cantidad < 0) throw new Error('Indique los kilómetros u horas del mes.');
      // Las unidades efectivamente realizadas no se vuelven a prorratear por jornada/días.
      const importe = money(tarifa * cantidad * (variable ? 1 : multiplier));
      if (nombre === 'Itinerancia (€/km)') itinerancia = importe;
      return { nombre, importe };
    });
    const otrosCargos = sum(...otrosCargosList.map(c => c.importe));
    const sueldoBase = money(config.sueldoBase * multiplier);
    const trienios = money(input.trienios * (config.trienios.base + (capitalina ? 0 : config.trienios.suplementoNoCapit)) * multiplier);
    const sexenios = money(sexenio * multiplier);
    const complementoDestino = money(config.destino * multiplier);
    const complementoEspecifico = money(config.especifico * multiplier);
    const residencia = money((capitalina ? config.residencia.islaCapit : config.residencia.islaNoCapit) * multiplier);
    const cargoDirectivo = money(baseCargo * multiplier);
    // Importe mensual a jornada completa indicado en la resolución individual.
    const reduccionBase = input.importeReduccionCompatibilidad ?? 0;
    if (input.compatibilidadPrivada && (!range(input.diasCompatibilidad, 0, input.diasTrabajados) || !range(reduccionBase, 0, config.especifico))) throw new Error('Revise la reducción autorizada y sus días de aplicación.');
    const reduccionCompatibilidad = input.compatibilidadPrivada ? money(reduccionBase * input.diasCompatibilidad / 30 * jornada) : 0;
    const totalDevengado = sum(sueldoBase, trienios, sexenios, complementoDestino, complementoEspecifico, residencia, cargoDirectivo, otrosCargos, -reduccionCompatibilidad);

    const extra = config.pagaExtra;
    const pagasExtra = devengos.map(devengo => {
      // Calculamos con la fracción exacta de días; el porcentaje se redondea solo al mostrarlo.
      const factor = jornada * devengo.diasEquivalentes / 180;
      const detalle = {
        sueldoBase: money(extra.base * factor),
        trienios: money(input.trienios * extra.trienios * factor),
        sexenios: money(extraSexenio * factor),
        destino: money(extra.destino * factor),
        especifico: money(extra.especifico * factor)
      };
      const pagaExtraBruta = sum(...Object.values(detalle));
      const pagaExtraIrpf = money(pagaExtraBruta * input.irpf / 100);
      const pagaExtraCuotas = pasivos ? money((grupoA1 ? 51.68 + 118.04 : 40.68 + 92.90) * devengo.diasEquivalentes / 180) : 0;
      return { ...devengo, pagaExtraBruta, pagaExtraIrpf, pagaExtraCuotas,
        pagaExtraNeta: sum(pagaExtraBruta, -pagaExtraIrpf, -pagaExtraCuotas), pagaExtraDetalle: detalle };
    });
    const prorrata = money((extra.base + input.trienios * extra.trienios + extraSexenio + extra.destino + extra.especifico) * multiplier / 6);
    const baseSinTope = sum(totalDevengado, -itinerancia, prorrata);
    const maxBase = money(5101.20 * factorDias);
    const minBase = money((grupoA1 ? 1989.30 : 1649.70) * multiplier);
    const baseCotizacionCC = pasivos ? 0 : money(Math.min(maxBase, Math.max(minBase, baseSinTope)));
    const baseCotizacionCP = pasivos ? 0 : money(Math.min(maxBase, Math.max(1424.40 * multiplier, baseSinTope)));
    const ss = ssData.regimenGeneral;
    // El 4,85% de la guía agrupa el 4,70% CC y el 0,15% MEI.
    const deduccionCC = money(baseCotizacionCC * ss.contingenciasComunes.trabajador / 100);
    const deduccionDesempleo = money(baseCotizacionCP * ss.desempleo.trabajador / 100);
    const deduccionFP = money(baseCotizacionCP * ss.formacionProfesional.trabajador / 100);
    const exceso = Math.max(0, baseSinTope - maxBase);
    const solidaridad = pasivos ? 0 : money(Math.min(exceso, maxBase * .1) * .0019 + Math.min(Math.max(0, exceso - maxBase * .1), maxBase * .4) * .0021 + Math.max(0, exceso - maxBase * .5) * .0024);
    const muface = pasivos ? money((grupoA1 ? 51.68 : 40.68) * factorDias) : 0;
    const cuotaPasivos = pasivos ? money((grupoA1 ? 118.04 : 92.90) * factorDias) : 0;
    const deduccionSS = sum(deduccionCC, deduccionDesempleo, deduccionFP, solidaridad, muface, cuotaPasivos);
    const baseIRPF = sum(totalDevengado, -itinerancia);
    const deduccionIrpf = money(baseIRPF * input.irpf / 100);
    const totalDeducciones = sum(deduccionIrpf, deduccionSS);
    return {
      input, totalDevengado, totalDeducciones, salarioNeto: sum(totalDevengado, -totalDeducciones), pagasExtra,
      detalleDevengos: { sueldoBase, trienios, sexenios, complementoDestino, complementoEspecifico, residencia, cargoDirectivo, otrosCargos, reduccionCompatibilidad, otrosCargosList },
      detalleDeducciones: {
        irpf: deduccionIrpf, seguridadSocial: deduccionSS, baseIRPF,
        basesCotizacion: { contingenciasComunes: baseCotizacionCC, contingenciasProfesionales: baseCotizacionCP },
        seguridadSocialDetalle: { contingenciasComunes: deduccionCC, desempleo: deduccionDesempleo, formacionProfesional: deduccionFP, solidaridad, muface, pasivos: cuotaPasivos }
      }
    };
  }
}
