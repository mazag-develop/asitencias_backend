import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ReporteAsistencia } from '../../core/models/asistencia.model';
import { ReportesService } from '../../core/services/reportes.service';

interface FechaReporte {
  key: string;
  encabezado: string;
}

interface FilaReporte {
  key: string;
  persona: string;
  tipo: string;
  asistencias: Map<string, ReporteAsistencia>;
  puntualidades: number;
  tardanzas: number;
  faltas: number;
}

type CodigoEstado = 'P' | 'T' | 'F';

@Component({
  selector: 'app-reportes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Reportes</p>
          <h2>Registro de asistencia</h2>
        </div>
        <button type="button" class="primary-button" (click)="downloadExcel()" [disabled]="downloading()">
          {{ downloading() ? 'Descargando...' : 'Exportar Excel' }}
        </button>
      </div>

      <div class="panel filters">
        <div class="field-grid">
          <label><span>Fecha inicio</span><input type="date" [(ngModel)]="fechaInicio" /></label>
          <label><span>Fecha fin</span><input type="date" [(ngModel)]="fechaFin" /></label>
          <label>
            <span>Tipo</span>
            <select [(ngModel)]="tipo">
              <option value="">Todos</option>
              <option value="ESTUDIANTE">Estudiante</option>
              <option value="PROFESOR">Profesor</option>
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select [(ngModel)]="estado">
              <option value="">Todos</option>
              <option value="PUNTUAL">Presente (P)</option>
              <option value="TARDANZA">Tardanza (T)</option>
              <option value="FALTA">Falta (F)</option>
            </select>
          </label>
          <label><span>Persona</span><input type="search" [(ngModel)]="persona" placeholder="Nombre de la persona" /></label>
        </div>
        <div class="actions-row">
          <button type="button" class="secondary-button" (click)="loadReports()" [disabled]="loading()">
            {{ loading() ? 'Consultando...' : 'Consultar' }}
          </button>
        </div>
      </div>

      <div class="legend" aria-label="Leyenda de asistencia">
        <span><i class="status-mark status-present">P</i> Presente</span>
        <span><i class="status-mark status-late">T</i> Tardanza</span>
        <span><i class="status-mark status-absent">F</i> Falta</span>
        <span class="legend-note">La hora de ingreso aparece debajo del estado.</span>
      </div>

      @if (loading()) {
        <div class="panel empty-state">Consultando asistencias...</div>
      } @else if (loadError()) {
        <div class="panel error-state">No se pudo consultar el reporte. Verifique la conexión e intente nuevamente.</div>
      } @else if (rows().length) {
        <div class="panel report-panel">
          <div class="report-heading">
            <div>
              <p class="eyebrow">Periodo</p>
              <h3>{{ periodLabel() }}</h3>
            </div>
            <span>{{ rows().length }} personas · {{ dates().length }} días</span>
          </div>

          <div class="table-scroll">
            <table class="attendance-table">
              <thead>
                <tr>
                  <th class="row-number-column name-heading" scope="col">N°</th>
                  <th class="name-column name-heading" scope="col">Nombre completo</th>
                  <th class="count-heading" scope="col">P</th>
                  <th class="count-heading" scope="col">T</th>
                  <th class="count-heading" scope="col">F</th>
                  @for (date of dates(); track date.key) {
                    <th class="date-heading" scope="col">{{ date.encabezado }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track row.key; let index = $index) {
                  <tr>
                    <td class="row-number-column row-number">{{ index + 1 }}</td>
                    <th class="name-column person-name" scope="row">
                      <span>{{ row.persona }}</span>
                      <small>{{ row.tipo }}</small>
                    </th>
                    <td class="count-cell">{{ row.puntualidades }}</td>
                    <td class="count-cell">{{ row.tardanzas }}</td>
                    <td class="count-cell">{{ row.faltas }}</td>
                    @for (date of dates(); track date.key) {
                      <td class="attendance-cell">
                        @if (row.asistencias.get(date.key); as attendance) {
                          <span
                            class="attendance-mark"
                            [class.status-present]="statusCode(attendance) === 'P'"
                            [class.status-late]="statusCode(attendance) === 'T'"
                            [class.status-absent]="statusCode(attendance) === 'F'"
                            [title]="attendanceTitle(attendance)"
                          >
                            <strong>{{ statusCode(attendance) }}</strong>
                            @if (attendance.hora) {
                              <small>{{ formatTime(attendance.hora) }}</small>
                            }
                          </span>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="report-note">Las celdas vacías indican que no hay un registro para esa fecha; no se generan faltas automáticamente.</p>
        </div>
      } @else {
        <div class="panel empty-state">No hay asistencias para el periodo y los filtros seleccionados.</div>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .page-shell { display: flex; flex-direction: column; gap: 0.55rem; min-width: 0; padding: 0.65rem; border: 1px solid #a0b0c0; background: #dbe4ee; color: #111827; font: 11px Arial, sans-serif; }
    .page-header, .report-heading { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
    .eyebrow { margin: 0; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
    h2, h3 { margin: 0; color: #111827; }
    h2 { font-size: 1rem; }
    h3 { font-size: 0.82rem; text-transform: capitalize; }
    .panel { border: 1px solid #a0b0c0; background: #dbe4ee; padding: 0.5rem; }
    .field-grid { display: flex; flex-wrap: wrap; align-items: end; gap: 0.55rem 0.8rem; }
    label { display: flex; flex-direction: column; gap: 0.2rem; color: #111827; font-weight: 700; }
    input, select { min-width: 0; border: 1px solid #7a94b0; border-radius: 0; background: #fff; padding: 0.25rem 0.35rem; color: #111827; font: inherit; }
    .actions-row { display: flex; justify-content: flex-end; margin-top: 0.45rem; }
    .secondary-button, .primary-button { border: 1px solid #061c42; border-radius: 3px; padding: 0.3rem 0.65rem; cursor: pointer; font: inherit; font-weight: 700; }
    .secondary-button { background: #fff; color: #0b2f6b; }
    .primary-button { background: #0b2f6b; color: #fff; }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
    .legend { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem 0.85rem; color: #334155; }
    .legend > span { display: inline-flex; align-items: center; gap: 0.25rem; }
    .status-mark { display: inline-grid; place-items: center; width: 1.25rem; height: 1.1rem; border: 1px solid #b0c0d0; font-style: normal; font-weight: 800; }
    .status-present { background: #eef4f8; color: #000; }
    .status-late { background: #e6e64c; color: #000; }
    .status-absent { background: #e61c24; color: #fff; }
    .report-panel { padding: 0.35rem; overflow: hidden; background: #fff; }
    .report-heading { padding: 0.15rem 0.15rem 0.35rem; color: #334155; }
    .table-scroll { max-height: min(68vh, 760px); overflow: auto; border: 1px solid #90a0b0; background: #fff; }
    .attendance-table { width: max-content; min-width: 100%; border-collapse: collapse; font-size: inherit; text-align: center; }
    .attendance-table th, .attendance-table td { min-width: 2.6rem; padding: 0.18rem 0.15rem; border: 1px solid #b0c0d0; white-space: nowrap; text-align: center; }
    .attendance-table thead th { position: sticky; top: 0; z-index: 3; height: 1.8rem; background: #d0dce8; color: #000; font-weight: 700; }
    .attendance-table .row-number-column { position: sticky; left: 0; z-index: 2; width: 1.9rem; min-width: 1.9rem; max-width: 1.9rem; }
    .attendance-table .name-column { position: sticky; left: 1.9rem; z-index: 2; min-width: 11.25rem; max-width: 17rem; text-align: left; }
    .attendance-table thead .name-column, .attendance-table thead .row-number-column { z-index: 5; background: #d0dce8; }
    .row-number { background: #fff; color: #475569; font-variant-numeric: tabular-nums; }
    .attendance-table .count-heading { width: 1.6rem; min-width: 1.6rem; }
    .attendance-table .date-heading { min-width: 3.85rem; white-space: nowrap; }
    .person-name { background: #fff; color: #111827; font-weight: 400; }
    .person-name span, .person-name small { display: block; overflow: hidden; text-overflow: ellipsis; }
    .person-name small { margin-top: 0.1rem; color: #64748b; font-size: 0.58rem; font-weight: 400; }
    .count-cell { width: 1.6rem; min-width: 1.6rem !important; background: #e8eff5; color: #334155; font-variant-numeric: tabular-nums; }
    .attendance-cell { background: #fff; }
    .attendance-mark { display: flex; min-height: 1.3rem; flex-direction: column; align-items: center; justify-content: center; gap: 0.05rem; line-height: 1; }
    .attendance-mark strong { font-size: inherit; font-weight: 400; }
    .attendance-mark small { font-size: 0.55rem; font-variant-numeric: tabular-nums; }
    .attendance-mark.status-present { background: #eef4f8; color: #000; }
    .attendance-mark.status-late { background: #e6e64c; color: #000; }
    .attendance-mark.status-absent { background: #e61c24; color: #fff; font-weight: 700; }
    .empty-state, .error-state { color: #475569; }
    .error-state { color: #b91c1c; }
    @media (max-width: 640px) {
      .page-header, .report-heading { align-items: flex-start; flex-direction: column; }
      .attendance-table .name-column { left: 1.9rem; min-width: 10.5rem; }
      .table-scroll { max-height: 70vh; }
    }
  `
})
export class ReportesPage {
  private readonly reportesService = inject(ReportesService);
  private readonly route = inject(ActivatedRoute);

  readonly rows = signal<FilaReporte[]>([]);
  readonly dates = signal<FechaReporte[]>([]);
  readonly periodLabel = signal('');
  readonly loading = signal(false);
  readonly downloading = signal(false);
  readonly loadError = signal(false);

  fechaInicio = '';
  fechaFin = '';
  tipo = '';
  estado = '';
  persona = '';

  constructor() {
    const now = new Date();
    this.fechaInicio = this.formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    this.fechaFin = this.formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    this.route.queryParamMap.subscribe((params) => {
      const estado = params.get('estado');
      this.estado = estado === 'TARDANZA' || estado === 'FALTA' ? estado : '';
      this.loadReports();
    });
  }

  loadReports(): void {
    const start = this.parseDateInput(this.fechaInicio);
    const end = this.parseDateInput(this.fechaFin);
    if (!start || !end || start.getTime() > end.getTime()) {
      this.rows.set([]);
      this.dates.set([]);
      this.loadError.set(true);
      return;
    }

    this.loading.set(true);
    this.loadError.set(false);
    this.dates.set(this.createDates(start, end));
    this.periodLabel.set(this.formatPeriod(start, end));

    this.reportesService.getReporte(this.getFilters()).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : [];
        this.rows.set(this.groupRows(data));
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
  }

  downloadExcel(): void {
    this.downloading.set(true);
    this.reportesService.downloadExcel(this.getFilters()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reporte-asistencias.xlsx';
        link.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => this.downloading.set(false)
    });
  }

  statusCode(attendance: ReporteAsistencia): CodigoEstado {
    if (attendance.estadoCodigo === 'P' || attendance.estadoCodigo === 'T' || attendance.estadoCodigo === 'F') {
      return attendance.estadoCodigo;
    }
    if (attendance.estado === 'TARDANZA') {
      return 'T';
    }
    if (attendance.estado === 'FALTA') {
      return 'F';
    }
    return 'P';
  }

  formatTime(time: string): string {
    return time.slice(0, 5);
  }

  attendanceTitle(attendance: ReporteAsistencia): string {
    const description = attendance.estadoDescripcion || attendance.estado;
    return attendance.hora ? `${description} · Ingreso: ${attendance.hora}` : description;
  }

  private getFilters(): Record<string, string> {
    return {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      tipo: this.tipo,
      estado: this.estado,
      persona: this.persona
    };
  }

  private groupRows(records: ReporteAsistencia[]): FilaReporte[] {
    const grouped = new Map<string, FilaReporte>();
    const reportDates = new Set(this.dates().map((date) => date.key));

    for (const record of records) {
      const date = record.fecha.slice(0, 10);
      if (!reportDates.has(date)) {
        continue;
      }

      const name = record.persona?.trim() || 'Persona sin nombre';
      const type = record.tipo || '';
      const key = `${name.toLocaleLowerCase()}|${type}`;
      let row = grouped.get(key);

      if (!row) {
        row = {
          key,
          persona: name,
          tipo: type,
          asistencias: new Map<string, ReporteAsistencia>(),
          puntualidades: 0,
          tardanzas: 0,
          faltas: 0
        };
        grouped.set(key, row);
      }

      row.asistencias.set(date, record);
    }

    for (const row of grouped.values()) {
      for (const attendance of row.asistencias.values()) {
        const code = this.statusCode(attendance);
        if (code === 'P') {
          row.puntualidades += 1;
        } else if (code === 'T') {
          row.tardanzas += 1;
        } else {
          row.faltas += 1;
        }
      }
    }

    return [...grouped.values()].sort((a, b) => a.persona.localeCompare(b.persona, 'es'));
  }

  private createDates(start: Date, end: Date): FechaReporte[] {
    const dates: FechaReporte[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const formatter = new Intl.DateTimeFormat('es-PE', { weekday: 'short' });

    while (current.getTime() <= last.getTime()) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const key = this.formatDateInput(current);
        const weekday = formatter.format(current).replace('.', '');
        const day = String(current.getDate()).padStart(2, '0');
        const month = String(current.getMonth() + 1).padStart(2, '0');
        dates.push({ key, encabezado: `${weekday} ${day}/${month}` });
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  private formatPeriod(start: Date, end: Date): string {
    const formatter = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' });
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return formatter.format(start);
    }
    return `${this.formatDateInput(start)} - ${this.formatDateInput(end)}`;
  }

  private formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDateInput(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const [, yearValue, monthValue, dayValue] = match;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    return date;
  }
}
