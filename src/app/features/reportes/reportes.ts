import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ReportesService } from '../../core/services/reportes.service';

@Component({
  selector: 'app-reportes-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Reportes</p>
          <h2>Generación de reportes</h2>
        </div>
      </div>

      <div class="panel filters">
        <div class="field-grid">
          <label><span>Fecha inicio</span><input type="date" [(ngModel)]="fechaInicio" /></label>
          <label><span>Fecha fin</span><input type="date" [(ngModel)]="fechaFin" /></label>
          <label><span>Tipo</span><select [(ngModel)]="tipo"><option value="">Todos</option><option value="ESTUDIANTE">Estudiante</option><option value="PROFESOR">Profesor</option></select></label>
          <label><span>Estado</span><select [(ngModel)]="estado"><option value="">Todos</option><option value="PUNTUAL">Puntual</option><option value="TARDANZA">Tardanza</option><option value="FALTA">Falta</option></select></label>
          <label><span>Persona</span><input type="text" [(ngModel)]="persona" /></label>
        </div>
        <div class="actions-row">
          <button type="button" class="secondary-button" (click)="loadReports()">Consultar</button>
          <button type="button" class="primary-button" (click)="downloadExcel()">Exportar Excel</button>
        </div>
      </div>

      @if (rows().length) {
        <div class="panel table-panel">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Persona</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.id) {
                <tr>
                  <td>{{ row.fecha || '—' }}</td>
                  <td>{{ row.persona || '—' }}</td>
                  <td>{{ row.tipo || '—' }}</td>
                  <td>{{ row.estado || '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="panel empty-state">No hay reportes para los filtros actuales.</div>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2 { margin: 0; }
    .panel { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem 1.1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04); }
    .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.9rem; }
    label { display: flex; flex-direction: column; gap: 0.45rem; font-weight: 700; }
    input, select { border: 1px solid #cbd5e1; border-radius: 0.8rem; padding: 0.7rem 0.85rem; font-size: 0.92rem; }
    .actions-row { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
    .secondary-button, .primary-button { border: none; border-radius: 0.8rem; padding: 0.75rem 1rem; cursor: pointer; font-weight: 700; }
    .secondary-button { background: #f1f5f9; color: #0f172a; }
    .primary-button { background: #2563eb; color: white; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { border-bottom: 1px solid #e2e8f0; padding: 0.75rem 0.5rem; text-align: left; }
    .data-table th { color: #64748b; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .empty-state { color: #64748b; }
  `
})
export class ReportesPage {
  private readonly reportesService = inject(ReportesService);

  readonly rows = signal<Array<{ id: string; fecha: string; persona: string; tipo: string; estado: string }>>([]);

  fechaInicio = '';
  fechaFin = '';
  tipo = '';
  estado = '';
  persona = '';

  constructor() {
    this.loadReports();
  }

  loadReports(): void {
    this.reportesService.getReporte({
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      tipo: this.tipo,
      estado: this.estado,
      persona: this.persona
    }).subscribe((response) => {
      const data = Array.isArray(response) ? response : [];
      this.rows.set(
        data.map((item, index) => {
          const row = item as Record<string, unknown>;
          return {
            id: `report-${index}`,
            fecha: String(row['fecha'] ?? ''),
            persona: String(row['persona'] ?? ''),
            tipo: String(row['tipo'] ?? ''),
            estado: String(row['estado'] ?? '')
          };
        })
      );
    });
  }

  downloadExcel(): void {
    this.reportesService.downloadExcel({
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      tipo: this.tipo,
      estado: this.estado,
      persona: this.persona
    }).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reporte-asistencias.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}
