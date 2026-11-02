export type TipoPersona = 'ESTUDIANTE' | 'PROFESOR';
export type CargoPersona =
  | 'DOCENTE'
  | 'DIRECTOR(A)'
  | 'ADMINISTRATIVO'
  | 'SECRETARIA(O)'
  | 'AUXILIAR';

export interface Persona {
  id: number;
  codigo: string;
  dni?: string | null;
  documento?: string | null;
  nombres: string;
  apellidos: string;
  tipo: TipoPersona;
  activo: boolean;
  grado?: string | null;
  seccion?: string | null;
  cargo?: CargoPersona | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuardarPersona {
  codigo: string;
  dni: string;
  nombres: string;
  apellidos: string;
  tipo: TipoPersona;
  grado?: string;
  seccion?: string;
  cargo?: CargoPersona;
}

export interface ErrorCargaPersona {
  fila: number;
  campo: string;
  mensaje: string;
}

export interface RegistroCargaPersona {
  fila: number;
  codigo: string;
  dni: string;
  nombres: string;
  apellidos: string;
  tipo: TipoPersona;
  grado: string | null;
  seccion: string | null;
  cargo: CargoPersona | null;
  activo: boolean;
}

export interface ResultadoValidacionCarga {
  totalFilas: number;
  validas: number;
  rechazadas: number;
  errores: ErrorCargaPersona[];
  registros: RegistroCargaPersona[];
}

export interface ResultadoImportacionCarga {
  totalFilas: number;
  creadas: number;
  rechazadas: number;
  errores: ErrorCargaPersona[];
}

export interface EventoAuditoria {
  entidad: string;
  id: number;
  personaId: number | null;
  accion: string;
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown> | null;
  actorId: number | null;
  fechaHora: string;
  persona?: Pick<Persona, 'id' | 'codigo' | 'nombres' | 'apellidos'> | null;
}

export interface RespuestaAuditoria {
  success: boolean;
  data: EventoAuditoria[];
}
