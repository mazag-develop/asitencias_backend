import { EstadoAsistencia } from './asistencia.model';
import { TipoPersona } from './persona.model';

export interface UltimaAsistenciaDashboard {
  id: string;
  persona: string;
  tipo: TipoPersona;
  estado: EstadoAsistencia;
  hora: string;
}

export interface DashboardSummary {
  totalPersonas: number;
  totalEstudiantes: number;
  totalProfesores: number;
  asistenciasHoy: number;
  puntuales: number;
  tardanzas: number;
  ausentes: number;
  porcentajePuntualidad: number;
  fechaConsulta: string;
  ultimasAsistencias: UltimaAsistenciaDashboard[];
}
