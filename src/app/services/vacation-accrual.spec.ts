import { contractMonths } from './extra-accrual';
import { contractVacationAccrual } from './vacation-accrual';
const calc = (start:string,end:string) => contractVacationAccrual(contractMonths(start,end));

describe('Vacaciones automáticas y disfrute en agosto por curso', () => {
  it('genera 2,5 días por mes completo y los liquida si no alcanza agosto', () => {
    expect(calc('2026-02-01','2026-07-31').diasPendientes).toBe(15);
    expect(calc('2026-09-01','2027-06-30').diasPendientes).toBe(25);
  });
  it('un curso completo disfruta todas las vacaciones en agosto', () => {
    const r = calc('2026-09-01','2027-08-31');
    expect(r.diasGenerados).toBe(30); expect(r.diasDisfrutados).toBe(30); expect(r.diasPendientes).toBe(0);
  });
  it('descuenta solo el agosto incluido en el contrato y prorratea el mes parcial', () => {
    const r = calc('2026-09-01','2027-08-15');
    expect(r.diasGenerados).toBe(28.75); expect(r.diasDisfrutados).toBe(15); expect(r.diasPendientes).toBe(13.75);
  });
  it('no descuenta vacaciones de cursos futuros ni produce saldos negativos', () => {
    const r = calc('2026-07-01','2026-09-30');
    expect(r.porCurso).toEqual([
      {curso:'2025-2026',diasGenerados:5,diasDisfrutados:5,diasPendientes:0},
      {curso:'2026-2027',diasGenerados:2.5,diasDisfrutados:0,diasPendientes:2.5}
    ]);
    expect(r.diasPendientes).toBe(2.5);
  });
  it('separa varios cursos completos de un último curso incompleto', () => {
    const r = calc('2024-09-01','2027-06-30');
    expect(r.diasGenerados).toBe(85); expect(r.diasDisfrutados).toBe(60); expect(r.diasPendientes).toBe(25);
  });
  it('un día y febrero bisiesto conservan su proporción exacta', () => {
    expect(calc('2026-01-01','2026-01-01').diasPendientes).toBeCloseTo(1/12,10);
    expect(calc('2024-02-01','2024-02-29').diasPendientes).toBe(2.5);
    expect(calc('2024-02-02','2024-02-29').diasPendientes).toBeCloseTo(28/12,10);
    expect(calc('2026-08-31','2026-08-31').diasPendientes).toBe(0);
  });
});
