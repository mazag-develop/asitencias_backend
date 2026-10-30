import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Asistencia, AsistenciaScanResponse, ResumenAsistenciaDiaria } from '../models/asistencia.model';
import { RespuestaPaginada } from '../models/api-response.model';
import { ApiService, QueryParams } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AsistenciasService {
  private readonly api = inject(ApiService);

  scan(codigo: string): Observable<AsistenciaScanResponse> {
    return this.api.post<AsistenciaScanResponse>('/asistencias/scan', { codigo }).pipe(
      catchError(() =>
        of({
          success: false,
          message: 'No se pudo contactar con el backend para registrar la asistencia.',
          data: {
            persona: 'Desconocido',
            tipo: 'ESTUDIANTE' as const,
            hora: new Date().toLocaleTimeString('es-ES', { hour12: false }),
            estado: 'FALTA' as const
          }
        })
      )
    );
  }

  historial(filters?: QueryParams): Observable<RespuestaPaginada<Asistencia>> {
    return this.api.get<RespuestaPaginada<Asistencia>>('/asistencias', filters).pipe(
      catchError(() =>
        of({
          data: [],
          paginacion: {
            total: 0,
            pagina: 1,
            limite: 10,
            totalPaginas: 0
          }
        })
      )
    );
  }

  resumenDiario(filters?: QueryParams): Observable<ResumenAsistenciaDiaria> {
    return this.api.get<ResumenAsistenciaDiaria>('/asistencias/diaria', filters).pipe(
      catchError(() =>
        of({
          totalEstudiantes: 0,
          totalProfesores: 0,
          puntualidades: 0,
          tardanzas: 0,
          faltas: 0,
          pendientes: 0
        })
      )
    );
  }
}
