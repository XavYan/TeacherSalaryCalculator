export interface ExtraAccrual {
  nombre: string;
  anio: number;
  seLiquidaAlCese: boolean;
  mesPago: 6 | 12;
  periodoInicio: string;
  periodoFin: string;
  diasEquivalentes: number;
  porcentajeDevengo: number;
}
const dayMs = 86400000;
function parseDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Introduce las fechas de inicio y fin del contrato.');
  const [year, month, day] = value.split('-').map(Number);
  const date = Date.UTC(year, month - 1, day);
  if (year < 1000 || new Date(date).toISOString().slice(0, 10) !== value) throw new Error('Fecha de contrato inválida.');
  return date;
}
/** Semestres naturales solicitados para la simulación. Fechas inclusivas en UTC.
 * Cada mes completo cuenta 30 días equivalentes y los parciales, días reales.
 */
export function contractExtraAccrual(start: string, end: string): ExtraAccrual[] {
  const startMs = parseDate(start), endMs = parseDate(end);
  if (endMs < startMs) throw new Error('La fecha de fin del contrato debe ser igual o posterior a la de inicio.');
  const extras: ExtraAccrual[] = [];
  for (let year = new Date(startMs).getUTCFullYear(); year <= new Date(endMs).getUTCFullYear(); year++) {
    for (const mesPago of [6, 12] as const) {
      const first = Date.UTC(year, mesPago - 6, 1);
      const until = Date.UTC(year, mesPago, 1);
      if (endMs < first || startMs >= until) continue;
      let equivalentDays = 0;
      for (let monthStart = first; monthStart < until;) {
        const date = new Date(monthStart);
        const nextMonth = Date.UTC(year, date.getUTCMonth() + 1, 1);
        const monthEnd = nextMonth - dayMs;
        const from = Math.max(startMs, monthStart), to = Math.min(endMs, monthEnd);
        if (from <= to) equivalentDays += from === monthStart && to === monthEnd ? 30 : (to - from) / dayMs + 1;
        monthStart = nextMonth;
      }
      const diasEquivalentes = Math.min(180, equivalentDays);
      extras.push({
        nombre: mesPago === 6 ? 'Junio' : 'Diciembre', anio: year, mesPago,
        periodoInicio: new Date(first).toISOString().slice(0, 10),
        periodoFin: new Date(until - dayMs).toISOString().slice(0, 10),
        seLiquidaAlCese: endMs < until - dayMs,
        diasEquivalentes, porcentajeDevengo: diasEquivalentes / 180 * 100
      });
    }
  }
  return extras;
}

export interface ContractMonth { anio: number; mes: number; dias: number; }
export function contractMonths(start: string, end: string): ContractMonth[] {
  const startMs = parseDate(start), endMs = parseDate(end);
  if (endMs < startMs) throw new Error('Fechas del contrato invertidas.');
  const months: ContractMonth[] = [];
  const date = new Date(startMs);
  for (let first = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1); first <= endMs;) {
    const current = new Date(first);
    const next = Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1);
    const from = Math.max(first, startMs), to = Math.min(next - dayMs, endMs);
    const dias = from === first && to === next - dayMs ? 30 : Math.min(30, (to - from) / dayMs + 1);
    months.push({ anio: current.getUTCFullYear(), mes: current.getUTCMonth() + 1, dias });
    first = next;
  }
  return months;
}
