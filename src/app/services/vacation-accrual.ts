import type { ContractMonth } from './extra-accrual';

export interface VacationAccrual {
  diasGenerados: number;
  diasDisfrutados: number;
  diasPendientes: number;
  porCurso: { curso: string; diasGenerados: number; diasDisfrutados: number; diasPendientes: number }[];
}

/** 2,5 días por mes completo, proporción días/30 para meses incompletos.
 * Agosto se disfruta dentro del contrato, hasta el saldo de su propio curso.
 * Cada curso va de septiembre a agosto; no se consumen vacaciones futuras.
 * Se conserva la fracción exacta para calcular importes; se redondea al mostrar.
 */
export function contractVacationAccrual(months: ContractMonth[]): VacationAccrual {
  const courses = new Map<number, { generados: number; agosto: number }>();
  for (const month of months) {
    const course = month.mes >= 9 ? month.anio : month.anio - 1;
    const previous = courses.get(course) ?? { generados:0, agosto:0 };
    previous.generados += month.dias / 30 * 2.5;
    if (month.mes === 8) previous.agosto += month.dias;
    courses.set(course,previous);
  }
  const porCurso = [...courses].map(([year, value]) => {
    const diasDisfrutados = Math.min(value.generados,value.agosto);
    return { curso:`${year}-${year+1}`, diasGenerados:value.generados, diasDisfrutados, diasPendientes:Math.max(0,value.generados-diasDisfrutados) };
  });
  return {
    porCurso,
    diasGenerados:porCurso.reduce((total,c)=>total+c.diasGenerados,0),
    diasDisfrutados:porCurso.reduce((total,c)=>total+c.diasDisfrutados,0),
    diasPendientes:porCurso.reduce((total,c)=>total+c.diasPendientes,0)
  };
}
