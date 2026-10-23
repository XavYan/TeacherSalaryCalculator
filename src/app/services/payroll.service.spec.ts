import { PayrollService } from './payroll.service';
import { PayrollInput } from '../models/payroll.model';
import complementos from '../../assets/data/complementos.json';

const base: PayrollInput = {
  cuerpo: 'Secundaria', isla: 'Tenerife', mes: 10, anio: 2026,
  diasTrabajados: 30, horasSemanales: 18, porcentajeJornada: 100,
  fechaInicioContrato: '2025-12-01', fechaFinContrato: '2026-11-30', cargoDirectivo: '', tipoCentro: 'D',
  familiaCentro: 'Secundaria, Medias, Artísticas, A distancia y EEOOII',
  complementos: [], irpf: 15, trienios: 0, sexenios: 0,
  compatibilidadPrivada: false, diasCompatibilidad: 0, regimen: 'general'
};
const calc = (changes: Partial<PayrollInput> = {}) => new PayrollService().calculatePayroll({ ...base, ...changes });

describe('Auditoría de la guía STEC-IC febrero 2026', () => {
  const filas = [
    ['Maestras/os', 2765, 3106.94, 2113.51, 43.54, 34.35, 31.74],
    ['Maestras/os de 1 ciclo ESO', 2856.50, 3198.44, 2184.89, 43.54, 34.35, 31.74],
    ['Profesorado sectores singulares de FP', 2856.47, 3198.41, 2215.46, 43.54, 34.35, 31.74],
    ['Secundaria', 3058.22, 3438.13, 2194.88, 53.39, 38.19, 32.96],
    ['Catedráticos', 3285.10, 3712.52, 2388.13, 53.39, 42.87, 32.96]
  ] as const;
  for (const [cuerpo, cap, noCap, extra, trienio, suplemento, trExtra] of filas) {
    it(`coincide al céntimo con la fila ${cuerpo}`, () => {
      expect(calc({ cuerpo }).totalDevengado).toBe(cap);
      expect(calc({ cuerpo, isla: 'La Palma' }).totalDevengado).toBe(noCap);
      expect(calc({ cuerpo }).pagasExtra[0].pagaExtraBruta).toBe(extra);
      expect(calc({ cuerpo, trienios: 2 }).detalleDevengos.trienios).toBeCloseTo(trienio * 2, 2);
      expect(calc({ cuerpo, trienios: 2, isla: 'La Palma' }).detalleDevengos.trienios).toBeCloseTo((trienio + suplemento) * 2, 2);
      expect(calc({ cuerpo, trienios: 2 }).pagasExtra[0].pagaExtraDetalle.trienios).toBeCloseTo(trExtra * 2, 2);
    });
  }
  for (const [i, mensual] of [0,55,119,239,419,489].entries()) {
    it(`sexenios ${i}: importe acumulado y extra del 78%`, () => {
      expect(calc({ sexenios: i }).detalleDevengos.sexenios).toBe(mensual);
      expect(calc({ sexenios: i }).pagasExtra[0].pagaExtraDetalle.sexenios).toBeCloseTo(mensual * .78, 2);
    });
  }
  const roles = ['Dirección','Jefatura de Estudios','Secretaría','Vicedirección','Jefatura Adjunta'];
  const matrices = [
    { familiaCentro: 'CER, CEIP, EE y Adultos', rows: [[552.36,226.08,226.08,226.08],[503.98,217.21,217.21,217.21],[380.05,203.03,203.03,203.03],[289.18,158.18,158.18,null],[195.97,null,106.25,null],[122.80,null,null,null]] },
    { familiaCentro: base.familiaCentro!, rows: [[694.24,341.28,341.28,341.28,170.65],[617.54,327.09,327.09,327.09,163.56],[556.13,253.88,253.88,253.88,126.98],[506.53,203.12,203.12,203.12,101.59]] }
  ];
  for (const { familiaCentro, rows } of matrices) rows.forEach((row, i) => row.forEach((amount, j) => {
    it(`${familiaCentro}, ${roles[j]}, tipo ${'ABCDEF'[i]}`, () => {
      const changes = { familiaCentro, cargoDirectivo: roles[j], tipoCentro: 'ABCDEF'[i] };
      if (amount === null) expect(() => calc(changes)).toThrow();
      else expect(calc(changes).detalleDevengos.cargoDirectivo).toBe(amount);
    });
  }));
  it('no admite cargos sin familia ni tipos inexistentes', () => {
    expect(() => calc({ cargoDirectivo: 'Dirección', familiaCentro: undefined })).toThrow();
    expect(() => calc({ cargoDirectivo: 'Dirección', tipoCentro: 'F' })).toThrow();
  });
  it('cuotas RG, prorrata, IRPF y neto: ejemplo Secundaria Tenerife', () => {
    const r = calc();
    expect(r.detalleDeducciones.basesCotizacion.contingenciasComunes).toBe(3424.03);
    expect(r.detalleDeducciones.seguridadSocialDetalle.contingenciasComunes).toBe(166.07);
    expect(r.detalleDeducciones.seguridadSocialDetalle.desempleo).toBe(53.07);
    expect(r.detalleDeducciones.seguridadSocialDetalle.formacionProfesional).toBe(3.42);
    expect(r.detalleDeducciones.irpf).toBe(458.73);
    expect(r.salarioNeto).toBe(2376.93);
  });
  it('prorratea días y jornada sin confundirlos con el semestre de la extra', () => {
    const r = calc({ diasTrabajados: 15, porcentajeJornada: 50 });
    expect(r.detalleDevengos.sueldoBase).toBe(346.81);
    expect(r.pagasExtra[0].pagaExtraBruta).toBe(1097.45);
    expect(calc({ diasTrabajados: 15 }).pagasExtra[0].pagaExtraBruta).toBe(2194.88);
    expect(calc({ fechaInicioContrato: '2026-03-01' }).pagasExtra[0].pagaExtraBruta).toBe(1097.45);
  });
  it('separa junio sin devengo y diciembre parcial sin alterar la prorrata mensual', () => {
    const r = calc({ fechaInicioContrato:'2026-09-15', fechaFinContrato:'2027-08-31', irpf:20 });
    expect(r.pagasExtra).toHaveLength(2);
    expect(r.pagasExtra[0].pagaExtraNeta).toBe(0);
    expect(r.pagasExtra[1].porcentajeDevengo).toBeCloseTo(42.222222,5);
    expect(r.pagasExtra[1].pagaExtraBruta).toBe(926.72);
    expect(r.pagasExtra[1].pagaExtraIrpf).toBe(185.34);
    expect(r.pagasExtra[1].pagaExtraNeta).toBe(741.38);
    expect(r.detalleDeducciones.basesCotizacion).toEqual(calc().detalleDeducciones.basesCotizacion);
  });
  it('calcula kilómetros y horas realizados, sin doble proporcionalidad ni duplicados', () => {
    const km = 'Itinerancia (€/km)', hora = 'Hora lectiva complementaria Grupo A1';
    const r = calc({ diasTrabajados: 15, complementos: [km, hora, km], cantidadesComplementos: { [km]:100, [hora]:3 } });
    expect(r.detalleDevengos.otrosCargos).toBe(88.52);
    expect(r.detalleDeducciones.baseIRPF).toBe(1591.63);
    expect(() => calc({ complementos:[km] })).toThrow();
  });
  it('aplica límites de cotización y solidaridad a retribuciones elevadas', () => {
    const r = calc({ cuerpo: 'Catedráticos', isla: 'La Palma', trienios: 15, sexenios: 5, cargoDirectivo:'Dirección', tipoCentro:'A' });
    expect(r.detalleDeducciones.basesCotizacion.contingenciasComunes).toBe(5101.20);
    expect(r.detalleDeducciones.seguridadSocialDetalle.solidaridad).toBeGreaterThan(0);
  });
  it.each(['Maestras/os', 'Secundaria'])('MUFACE/Clases Pasivas %s y doble cuota en extra', cuerpo => {
    const r = calc({ cuerpo, regimen: 'pasivos' });
    expect(r.detalleDeducciones.seguridadSocial).toBe(cuerpo === 'Secundaria' ? 169.72 : 133.58);
    expect(r.pagasExtra[0].pagaExtraCuotas).toBe(cuerpo === 'Secundaria' ? 169.72 : 133.58);
    expect(r.detalleDeducciones.seguridadSocialDetalle.desempleo).toBe(0);
  });
  it('usa la reducción individual autorizada y limita los días al periodo trabajado', () => {
    expect(calc({ compatibilidadPrivada:true, diasCompatibilidad:15, importeReduccionCompatibilidad:300 }).detalleDevengos.reduccionCompatibilidad).toBe(150);
    expect(() => calc({ diasTrabajados:10, compatibilidadPrivada:true, diasCompatibilidad:30 })).toThrow();
  });
  it('rechaza años sin tablas, antigüedad fraccionaria e importes inválidos', () => {
    for (const changes of [{ anio:2025 }, { sexenios:6 }, { trienios:1.5 }, { porcentajeJornada:101 }, { irpf:NaN }]) expect(() => calc(changes)).toThrow();
  });
  it('incluye conservatorio, rurales y comedores sin confundirlos con dirección CEIP', () => {
    const otros = complementos['otros cargos'];
    expect(otros['Conservatorio Superior de Música — Dirección']).toBe(541.67);
    expect(otros['Coordinación E. Rurales — Tipo A']).toBe(552.34);
    expect(otros['Comedor gestión directa — Hasta 99 comensales']).toBe(139.54);
    expect(otros['Comedor gestión contratada — Más de 300 comensales']).toBe(136.10);
  });
});
