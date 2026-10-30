import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DashboardSummary } from '../models/dashboard.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly api = inject(ApiService);

  getSummary(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('/dashboard').pipe(
      catchError(() => of(this.emptySummary()))
    );
  }

  private emptySummary(): DashboardSummary {
    return {
      totalPersonas: 0,
      totalEstudiantes: 0,
      totalProfesores: 0,
      asistenciasHoy: 0,
      puntuales: 0,
      tardanzas: 0,
      ausentes: 0,
      porcentajePuntualidad: 0,
      fechaConsulta: new Date().toISOString().slice(0, 10),
      ultimasAsistencias: []
    };
  }
}
