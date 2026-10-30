import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CrearPersona, Persona } from '../models/persona.model';
import { RespuestaPaginada } from '../models/api-response.model';
import { ApiService, QueryParams } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private readonly api = inject(ApiService);

  list(filters?: QueryParams): Observable<RespuestaPaginada<Persona>> {
    return this.api.get<RespuestaPaginada<Persona>>('/personas', filters).pipe(
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

  getById(id: number): Observable<Persona | null> {
    return this.api.get<Persona>(`/personas/${id}`).pipe(catchError(() => of(null)));
  }

  getByCode(codigo: string): Observable<Persona | null> {
    return this.api.get<Persona>(`/personas/codigo/${codigo}`).pipe(catchError(() => of(null)));
  }

  create(payload: CrearPersona): Observable<Persona | null> {
    return this.api.post<Persona>('/personas', payload).pipe(catchError(() => of(null)));
  }

  update(id: number, payload: Partial<CrearPersona>): Observable<Persona | null> {
    return this.api.patch<Persona>(`/personas/${id}`, payload).pipe(catchError(() => of(null)));
  }

  updateStatus(id: number, activo: boolean): Observable<Persona | null> {
    return this.api.patch<Persona>(`/personas/${id}/estado`, { activo }).pipe(catchError(() => of(null)));
  }
}
