import { contractExtraAccrual, contractMonths } from './extra-accrual';

describe('Devengo por semestres naturales de todo el contrato', () => {
  it('recorre todos los años y excluye semestres sin solapamiento', () => {
    const extras = contractExtraAccrual('2025-09-01','2027-08-31');
    expect(extras.map(e=>[e.anio,e.mesPago,e.diasEquivalentes])).toEqual([[2025,12,120],[2026,6,180],[2026,12,180],[2027,6,180],[2027,12,60]]);
    expect(extras[0].periodoInicio).toBe('2025-07-01');
    expect(extras[0].periodoFin).toBe('2025-12-31');
    expect(extras.filter(e=>e.seLiquidaAlCese)).toEqual([extras[4]]);
  });
  it('incluye solo junio al terminar el 30 de junio y solo diciembre desde el 1 de julio', () => {
    expect(contractExtraAccrual('2026-01-01','2026-06-30').map(e=>[e.mesPago,e.diasEquivalentes,e.seLiquidaAlCese])).toEqual([[6,180,false]]);
    expect(contractExtraAccrual('2026-07-01','2026-12-31').map(e=>[e.mesPago,e.diasEquivalentes,e.seLiquidaAlCese])).toEqual([[12,180,false]]);
  });
  it('cuenta los extremos inclusivos y liquida el último semestre incompleto', () => {
    expect(contractExtraAccrual('2026-06-30','2026-07-01').map(e=>[e.diasEquivalentes,e.seLiquidaAlCese])).toEqual([[1,false],[1,true]]);
    expect(contractExtraAccrual('2026-12-31','2027-01-01').map(e=>[e.anio,e.diasEquivalentes])).toEqual([[2026,1],[2027,1]]);
  });
  it('mantiene meses completos de 30 y días reales de meses parciales, incluso en febrero bisiesto', () => {
    expect(contractExtraAccrual('2026-02-01','2026-02-28')[0].diasEquivalentes).toBe(30);
    expect(contractExtraAccrual('2024-02-01','2024-02-29')[0].diasEquivalentes).toBe(30);
    expect(contractExtraAccrual('2024-02-02','2024-02-29')[0].diasEquivalentes).toBe(28);
    expect(contractExtraAccrual('2026-09-15','2027-08-31').map(e=>e.diasEquivalentes)).toEqual([106,180,60]);
  });
  it('un solo día produce una única extra parcial', () => {
    expect(contractExtraAccrual('2026-12-31','2026-12-31')[0].diasEquivalentes).toBe(1);
  });
  it('rechaza fechas inexistentes, vacías y contratos invertidos', () => {
    for (const [from,to] of [['',''],['2026-02-29','2026-03-01'],['2026-04-31','2026-05-01'],['2026-09-01','2026-08-31']]) expect(()=>contractExtraAccrual(from,to)).toThrow();
  });
  it('divide los meses ordinarios usando 30 días para meses completos', () => {
    expect(contractMonths('2026-01-16','2026-03-15')).toEqual([{anio:2026,mes:1,dias:16},{anio:2026,mes:2,dias:30},{anio:2026,mes:3,dias:15}]);
    expect(contractMonths('2026-12-31','2027-01-01')).toEqual([{anio:2026,mes:12,dias:1},{anio:2027,mes:1,dias:1}]);
  });
});
