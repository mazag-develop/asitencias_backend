import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  GuardarPersona,
  Persona,
  ResultadoImportacionCarga,
  ResultadoValidacionCarga
} from '../models/persona.model';
import { RespuestaPaginada } from '../models/api-response.model';
import { ApiService, QueryParams } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private readonly api = inject(ApiService);

  list(filters?: QueryParams): Observable<RespuestaPaginada<Persona>> {
    return this.api.get<RespuestaPaginada<Persona>>('/personas', filters);
  }

  getById(id: number): Observable<Persona> {
    return this.api.get<Persona>(`/personas/${id}`);
  }

  getByCode(codigo: string): Observable<Persona> {
    return this.api.get<Persona>(`/personas/codigo/${codigo}`);
  }

  create(payload: GuardarPersona): Observable<Persona> {
    return this.api.post<Persona>('/personas', payload);
  }

  update(id: number, payload: Partial<GuardarPersona>): Observable<Persona> {
    return this.api.patch<Persona>(`/personas/${id}`, payload);
  }

  updateStatus(id: number, activo: boolean): Observable<Persona> {
    return this.api.patch<Persona>(`/personas/${id}/estado`, { activo });
  }

  downloadTemplate(): Observable<Blob> {
    return this.api.downloadBlob('/personas/carga-masiva/plantilla');
  }

  validateBulkUpload(file: File): Observable<ResultadoValidacionCarga> {
    return this.api.post<ResultadoValidacionCarga>(
      '/personas/carga-masiva/validar',
      this.createFileFormData(file)
    );
  }

  importBulkUpload(file: File): Observable<ResultadoImportacionCarga> {
    return this.api.post<ResultadoImportacionCarga>(
      '/personas/carga-masiva/importar',
      this.createFileFormData(file)
    );
  }

  private createFileFormData(file: File): FormData {
    const formData = new FormData();
    formData.append('archivo', file);
    return formData;
  }
}
