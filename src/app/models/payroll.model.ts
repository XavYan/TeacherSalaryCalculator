export interface PayrollInput {
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
  trienios: number;
  sexenios: number;
  compatibilidadPrivada: boolean;
  diasCompatibilidad: number;
  seguridadSocial?: number;
}

export interface PayrollResult {
  input: PayrollInput;
  totalDevengado: number;
  totalDeducciones: number;
  salarioNeto: number;
  pagaExtraBruta: number;
  pagaExtraIrpf: number;
  pagaExtraNeta: number;
  pagaExtraDetalle: {
    sueldoBase: number;
    trienios: number;
    sexenios: number;
    destino: number;
    especifico: number;
  };
  detalleDevengos: {
    sueldoBase: number;
    trienios: number;
    sexenios: number;
    complementoDestino: number;
    complementoEspecifico: number;
    residencia: number;
    cargoDirectivo: number;
    otrosCargos: number;
    reduccionCompatibilidad: number;
    otrosCargosList: { nombre: string; importe: number }[];
  };
  detalleDeducciones: {
    irpf: number;
    seguridadSocial: number;
    baseIRPF: number;
    basesCotizacion: {
      contingenciasComunes: number;
      contingenciasProfesionales: number;
    };
    seguridadSocialDetalle: {
      contingenciasComunes: number;
      desempleo: number;
      formacionProfesional: number;
    };
  };
}
