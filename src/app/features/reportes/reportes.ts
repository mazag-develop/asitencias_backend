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
          <h2>Asistencia por día</h2>
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
    .page-shell { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
    .page-header, .report-heading { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2, h3 { margin: 0; color: #0f172a; }
    .panel { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem 1.1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04); }
    .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.9rem; }
    label { display: flex; flex-direction: column; gap: 0.45rem; color: #334155; font-weight: 700; }
    input, select { min-width: 0; border: 1px solid #cbd5e1; border-radius: 0.8rem; padding: 0.7rem 0.85rem; font-size: 0.92rem; }
    .actions-row { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
    .secondary-button, .primary-button { border: none; border-radius: 0.8rem; padding: 0.75rem 1rem; cursor: pointer; font-weight: 700; }
    .secondary-button { background: #f1f5f9; color: #0f172a; }
    .primary-button { background: #2563eb; color: white; }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
    .legend { display: flex; align-items: center; flex-wrap: wrap; gap: 0.8rem 1.2rem; color: #334155; font-size: 0.85rem; }
    .legend > span { display: inline-flex; align-items: center; gap: 0.4rem; }
    .status-mark { display: inline-grid; place-items: center; width: 1.6rem; height: 1.45rem; border: 1px solid #cbd5e1; border-radius: 0.35rem; font-style: normal; font-size: 0.75rem; font-weight: 800; }
    .status-present { background: #fff; color: #0f172a; }
    .status-late { background: #facc15; color: #422006; }
    .status-absent { background: #dc2626; color: #fff; }
    .report-panel { padding: 0.75rem; overflow: hidden; }
    .report-heading { padding: 0.35rem 0.35rem 0.8rem; color: #64748b; font-size: 0.82rem; }
    .report-heading h3 { margin-top: 0.15rem; font-size: 1.05rem; text-transform: capitalize; }
    .table-scroll { max-height: min(68vh, 760px); overflow: auto; border: 1px solid #dbe3ec; border-radius: 0.65rem; }
    .attendance-table { width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.78rem; }
    .attendance-table th, .attendance-table td { min-width: 3.65rem; padding: 0.35rem; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; text-align: center; }
    .attendance-table thead th { position: sticky; top: 0; z-index: 3; height: 3rem; background: #f1f5f9; color: #334155; font-weight: 800; }
    .attendance-table .row-number-column { position: sticky; left: 0; z-index: 2; min-width: 2.6rem; width: 2.6rem; max-width: 2.6rem; }
    .attendance-table .name-column { position: sticky; left: 3.3rem; z-index: 2; min-width: 13rem; max-width: 17rem; text-align: left; }
    .attendance-table thead .name-column { z-index: 5; }
    .attendance-table thead .row-number-column { z-index: 5; background: #eaf1f8; }
    .attendance-table .name-heading { background: #eaf1f8; }
    .row-number { background: #fff; color: #64748b; font-variant-numeric: tabular-nums; }
    .attendance-table .count-heading { min-width: 2.6rem; }
    .attendance-table .date-heading { min-width: 4.2rem; white-space: nowrap; }
    .person-name { background: #fff; color: #1e293b; }
    .person-name span, .person-name small { display: block; overflow: hidden; text-overflow: ellipsis; }
    .person-name small { margin-top: 0.18rem; color: #64748b; font-size: 0.65rem; font-weight: 500; }
    .count-cell { min-width: 2.6rem !important; background: #f8fafc; color: #475569; font-variant-numeric: tabular-nums; }
    .attendance-cell { background: #fff; }
    .attendance-mark { display: flex; min-height: 2.1rem; flex-direction: column; align-items: center; justify-content: center; gap: 0.12rem; border: 1px solid #d5dce5; border-radius: 0.25rem; line-height: 1.1; }
    .attendance-mark strong { font-size: 0.78rem; }
    .attendance-mark small { font-size: 0.62rem; font-variant-numeric: tabular-nums; }
    .attendance-mark.status-present { background: #fff; color: #0f172a; }
    .attendance-mark.status-late { border-color: #eab308; background: #facc15; color: #422006; }
    .attendance-mark.status-absent { border-color: #dc2626; background: #dc2626; color: #fff; }
    .empty-state, .error-state { color: #64748b; }
    .error-state { color: #b91c1c; }
    @media (max-width: 640px) {
      .page-header, .report-heading { align-items: flex-start; flex-direction: column; }
      .report-heading { gap: 0.3rem; }
      .attendance-table .name-column { left: 3.3rem; min-width: 10.5rem; }
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
