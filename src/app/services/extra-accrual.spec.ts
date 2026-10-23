import { contractExtraAccrual } from './extra-accrual';

describe('Devengo canario por fechas de contrato', () => {
  it('cubre ambos semestres completos con fechas en años distintos', () => {
    const extras = contractExtraAccrual(2026, '2025-09-01', '2027-08-31');
    expect(extras.map(e=>e.porcentajeDevengo)).toEqual([100,100]);
    expect(extras.map(e=>[e.periodoInicio,e.periodoFin])).toEqual([['2025-12-01','2026-05-31'],['2026-06-01','2026-11-30']]);
  });
  it('un contrato del curso iniciado en septiembre solo devenga la extra de diciembre de ese año', () => {
    const extras = contractExtraAccrual(2026, '2026-09-15', '2027-08-31');
    expect(extras[0].porcentajeDevengo).toBe(0);
    expect(extras[1].diasEquivalentes).toBe(76); // septiembre 16 días + octubre/noviembre 60
    expect(extras[1].porcentajeDevengo).toBeCloseTo(42.222222, 5);
  });
  it('cuenta febrero completo como un mes, incluso en año bisiesto', () => {
    expect(contractExtraAccrual(2026, '2026-02-01', '2026-02-28')[0].diasEquivalentes).toBe(30);
    expect(contractExtraAccrual(2024, '2024-02-01', '2024-02-29')[0].diasEquivalentes).toBe(30);
    expect(contractExtraAccrual(2024, '2024-02-02', '2024-02-29')[0].diasEquivalentes).toBe(28);
  });
  it('calcula diferentes porcentajes para cada extra (sin depender del mes de simulación)', () => {
    expect(contractExtraAccrual(2026, '2026-03-01', '2026-08-31').map(e=>e.porcentajeDevengo)).toEqual([50,50]);
    expect(contractExtraAccrual(2026, '2026-01-01', '2026-06-30').map(e=>e.diasEquivalentes)).toEqual([150,30]);
  });
  it('cuenta las fechas de inicio y fin de forma inclusiva en los límites de semestre', () => {
    expect(contractExtraAccrual(2026, '2026-05-31', '2026-06-01').map(e=>e.diasEquivalentes)).toEqual([1,1]);
    expect(contractExtraAccrual(2026, '2026-11-30', '2026-12-01').map(e=>e.diasEquivalentes)).toEqual([0,1]);
    expect(contractExtraAccrual(2026, '2025-12-01', '2025-12-01').map(e=>e.diasEquivalentes)).toEqual([1,0]);
  });
  it('no cuenta contratos fuera de los periodos del año seleccionado', () => {
    expect(contractExtraAccrual(2026, '2026-12-01', '2027-08-31').map(e=>e.diasEquivalentes)).toEqual([0,0]);
    expect(contractExtraAccrual(2026, '2025-01-01', '2025-11-30').map(e=>e.diasEquivalentes)).toEqual([0,0]);
  });
  it('rechaza fechas inexistentes, vacías y contratos invertidos', () => {
    for (const [from,to] of [['',''],['2026-02-29','2026-03-01'],['2026-04-31','2026-05-01'],['2026-09-01','2026-08-31']]) expect(()=>contractExtraAccrual(2026,from,to)).toThrow();
  });
});
