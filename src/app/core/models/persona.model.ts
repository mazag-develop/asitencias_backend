export type TipoPersona = 'ESTUDIANTE' | 'PROFESOR';

export interface Persona {
  id: number;
  codigo: string;
  documento?: string | null;
  nombres: string;
  apellidos: string;
  tipo: TipoPersona;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearPersona {
  codigo: string;
  documento?: string;
  nombres: string;
  apellidos: string;
  tipo: TipoPersona;
}
