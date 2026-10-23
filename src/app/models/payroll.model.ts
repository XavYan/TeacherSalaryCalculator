export interface PayrollInput {
  porcentajeJornada?: number;
  fechaInicioContrato: string;
  fechaFinContrato: string;
  familiaCentro?: string;
  cantidadesComplementos?: Record<string, number>;
  regimen?: "general" | "pasivos";
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
  importeReduccionCompatibilidad?: number;
  compatibilidadPrivada: boolean;
  diasCompatibilidad: number;
  seguridadSocial?: number;
}

export interface PayrollResult {
  input: PayrollInput;
  totalDevengado: number;
  totalDeducciones: number;
  salarioNeto: number;
  pagasExtra: PayrollExtra[];
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
      solidaridad: number;
      muface: number;
      pasivos: number;
    };
  };
}

export interface PayrollExtra {
  nombre: string;
  mesPago: 6 | 12;
  periodoInicio: string;
  periodoFin: string;
  diasEquivalentes: number;
  porcentajeDevengo: number;
  pagaExtraBruta: number;
  pagaExtraIrpf: number;
  pagaExtraNeta: number;
  pagaExtraCuotas: number;
  pagaExtraDetalle: {
    sueldoBase: number;
    trienios: number;
    sexenios: number;
    destino: number;
    especifico: number;
  };
}
