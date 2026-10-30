import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Asistencia } from '../../../core/models/asistencia.model';
import { RespuestaPaginada } from '../../../core/models/api-response.model';
import { AsistenciasService } from '../../../core/services/asistencias.service';

@Component({
  selector: 'app-asistencia-historial-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Historial</p>
          <h2>Asistencias registradas</h2>
        </div>
      </div>

      <div class="panel filters">
        <div class="field-grid">
          <label><span>Fecha inicio</span><input type="date" [(ngModel)]="fechaInicio" /></label>
          <label><span>Fecha fin</span><input type="date" [(ngModel)]="fechaFin" /></label>
          <label><span>Código</span><input type="text" [(ngModel)]="codigo" /></label>
          <label><span>Persona</span><input type="text" [(ngModel)]="persona" /></label>
          <label><span>Tipo</span><select [(ngModel)]="tipo"><option value="">Todos</option><option value="ESTUDIANTE">Estudiante</option><option value="PROFESOR">Profesor</option></select></label>
          <label><span>Estado</span><select [(ngModel)]="estado"><option value="">Todos</option><option value="PUNTUAL">Puntual</option><option value="TARDANZA">Tardanza</option><option value="FALTA">Falta</option></select></label>
        </div>
        <div class="actions-row">
          <button type="button" class="primary-button" (click)="loadHistory()">Aplicar filtros</button>
        </div>
      </div>

      @if (loading()) {
        <div class="panel loader-panel">Cargando historial...</div>
      } @else if (items().length) {
        <div class="panel table-panel">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Código</th>
                <th>Persona</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr>
                  <td>{{ item.fechaEscolar }}</td>
                  <td>{{ item.fechaHora | date: 'HH:mm:ss' }}</td>
                  <td>{{ item.codigoLeido || '—' }}</td>
                  <td>{{ item.persona?.nombres || '—' }} {{ item.persona?.apellidos || '' }}</td>
                  <td>{{ item.persona?.tipo || '—' }}</td>
                  <td>
                    <span class="status status-{{ item.estado.toLowerCase() }}">{{ item.estado }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="panel empty-state">No existen registros para los filtros seleccionados.</div>
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
    .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.85rem; }
    label { display: flex; flex-direction: column; gap: 0.45rem; color: #334155; font-weight: 600; }
    input, select { border: 1px solid #cbd5e1; border-radius: 0.8rem; padding: 0.7rem 0.85rem; font-size: 0.92rem; }
    .actions-row { display: flex; justify-content: flex-end; margin-top: 1rem; }
    .primary-button { border: none; background: #2563eb; color: white; border-radius: 0.8rem; padding: 0.75rem 1rem; cursor: pointer; font-weight:700; }
    .loader-panel { min-height: 140px; display: grid; place-items: center; color: #64748b; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { border-bottom: 1px solid #e2e8f0; padding: 0.75rem 0.5rem; text-align: left; }
    .data-table th { color: #64748b; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .status { display: inline-block; padding: 0.32rem 0.6rem; border-radius: 999px; font-size: 0.74rem; font-weight: 700; }
    .status-puntual { background: #dcfce7; color: #166534; }
    .status-tardanza { background: #fef3c7; color: #92400e; }
    .status-falta { background: #fee2e2; color: #991b1b; }
    .empty-state { color: #64748b; }
  `
})
export class AsistenciaHistorialPage {
  private readonly asistenciasService = inject(AsistenciasService);

  readonly items = signal<Asistencia[]>([]);
  readonly loading = signal(true);

  fechaInicio = '';
  fechaFin = '';
  codigo = '';
  persona = '';
  tipo = '';
  estado = '';

  constructor() {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    const filters = {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      codigo: this.codigo,
      persona: this.persona,
      tipo: this.tipo,
      estado: this.estado
    };

    this.asistenciasService.historial(filters).subscribe({
      next: (response: RespuestaPaginada<Asistencia>) => {
        this.items.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.items.set([]);
        this.loading.set(false);
      }
    });
  }
}
