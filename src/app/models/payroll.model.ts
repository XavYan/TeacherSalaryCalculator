export interface PayrollInput {
  nombreCompleto: string;
  dni: string;
  cuerpo: string;
  isla: string;
  mes: number;
  anio: number;
  diasTrabajados: number;
  horasSemanales: number;
  cargoDirectivo: string;
  tipoCentro: string;
  complementos: string[]; // Otros cargos/complementos seleccionados
  irpf: number;
  seguridadSocial?: number;
}

export interface PayrollResult {
  input: PayrollInput;
  totalDevengado: number;
  totalDeducciones: number;
  salarioNeto: number;
  detalleDevengos: {
    sueldoBase: number;
    complementoDestino: number;
    complementoEspecifico: number;
    residencia: number;
    cargoDirectivo: number;
    otrosCargos: number;
    otrosCargosList: { nombre: string; importe: number }[];
  };
  detalleDeducciones: {
    irpf: number;
    seguridadSocial: number;
    seguridadSocialDetalle: {
      contingenciasComunes: number;
      desempleo: number;
      formacionProfesional: number;
    };
  };
}
