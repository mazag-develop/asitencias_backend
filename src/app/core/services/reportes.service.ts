import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService, QueryParams } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly api = inject(ApiService);

  getReporte(filters?: QueryParams): Observable<unknown[]> {
    return this.api.get<unknown[]>('/reportes/asistencias', filters);
  }

  downloadExcel(filters?: QueryParams): Observable<Blob> {
    return this.api.downloadBlob('/reportes/asistencias/excel', filters);
  }
}
