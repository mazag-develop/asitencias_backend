import { Persona, TipoPersona } from './persona.model';

export type EstadoAsistencia = 'PUNTUAL' | 'TARDANZA' | 'FALTA';

export interface Asistencia {
  id: string;
  personaId: number;
  fechaEscolar: string;
  fechaHora: string;
  estado: EstadoAsistencia;
  codigoLeido?: string;
  persona?: Persona;
}

export interface AsistenciaScanPayload {
  codigo: string;
}

export interface AsistenciaScanResponse {
  success: boolean;
  message: string;
  data: {
    persona: string;
    tipo: TipoPersona;
    hora: string;
    estado: EstadoAsistencia;
  };
}

export interface ResumenAsistenciaDiaria {
  totalEstudiantes: number;
  totalProfesores: number;
  puntualidades: number;
  tardanzas: number;
  faltas: number;
  pendientes: number;
}
