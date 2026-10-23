export interface ExtraAccrual {
  nombre: string;
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
/** Canarias: meses naturales completos / 6 + días de meses incompletos / 180.
 * Fuente: Intervención General, guía RRHH II.4.B, apartado 5.2.a.
 * Fechas inclusivas; UTC evita que el cambio horario altere los días.
 */
export function contractExtraAccrual(year: number, start: string, end: string): ExtraAccrual[] {
  const startMs = parseDate(start), endMs = parseDate(end);
  if (endMs < startMs) throw new Error('La fecha de fin del contrato debe ser igual o posterior a la de inicio.');
  return ([6, 12] as const).map(mesPago => {
    const first = mesPago === 6 ? Date.UTC(year - 1, 11, 1) : Date.UTC(year, 5, 1);
    const until = Date.UTC(year, mesPago - 1, 1); // primer día del mes de pago, excluido
    let equivalentDays = 0;
    for (let monthStart = first; monthStart < until;) {
      const date = new Date(monthStart);
      const nextMonth = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
      const monthEnd = nextMonth - dayMs;
      const from = Math.max(startMs, monthStart), to = Math.min(endMs, monthEnd);
      if (from <= to) equivalentDays += from === monthStart && to === monthEnd ? 30 : (to - from) / dayMs + 1;
      monthStart = nextMonth;
    }
    const diasEquivalentes = Math.min(180, equivalentDays);
    return {
      nombre: mesPago === 6 ? 'Junio' : 'Diciembre', mesPago,
      periodoInicio: new Date(first).toISOString().slice(0, 10),
      periodoFin: new Date(until - dayMs).toISOString().slice(0, 10),
      diasEquivalentes, porcentajeDevengo: diasEquivalentes / 180 * 100
    };
  });
}
