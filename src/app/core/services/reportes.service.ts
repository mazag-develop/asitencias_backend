import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService, QueryParams } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly api = inject(ApiService);

  getReporte(filters?: QueryParams): Observable<unknown[]> {
    return this.api.get<unknown[]>('/reportes/asistencias', filters).pipe(catchError(() => of([])));
  }

  downloadExcel(filters?: QueryParams): Observable<Blob> {
    return this.api.downloadBlob('/reportes/asistencias/excel', filters).pipe(
      catchError(() => of(new Blob([], { type: 'application/vnd.ms-excel' })))
    );
  }
}
