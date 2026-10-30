import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardSummary } from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h2>Resumen general</h2>
        </div>
        <span class="date-badge">{{ summary().fechaConsulta || 'Sin fecha' }}</span>
      </div>

      @if (loading()) {
        <div class="panel loader-panel">Cargando indicadores del backend...</div>
      } @else {
        <div class="stats-grid">
          @for (item of totalCards(); track item.label) {
            <article class="stat-card stat-{{ item.tone }}">
              <p>{{ item.label }}</p>
              <h3>{{ item.value }}</h3>
            </article>
          }
        </div>

        <div class="content-grid">
          <div class="panel">
            <div class="panel-header">
              <h3>Asistencia del día</h3>
              <span>{{ summary().porcentajePuntualidad }}% puntualidad</span>
            </div>
            <div class="bar-chart" aria-label="Gráfico de asistencia">
              <div class="bar-bar bar-green" [style.width.%]="calculateSegment(summary().puntuales)"></div>
              <div class="bar-bar bar-yellow" [style.width.%]="calculateSegment(summary().tardanzas)"></div>
              <div class="bar-bar bar-red" [style.width.%]="calculateSegment(summary().ausentes)"></div>
            </div>
            <div class="legend">
              <span><i class="dot green"></i> Puntuales</span>
              <span><i class="dot yellow"></i> Tardanzas</span>
              <span><i class="dot red"></i> Ausentes</span>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <h3>Accesos rápidos</h3>
            </div>
            <div class="quick-links">
              <a routerLink="/personas">Personas</a>
              <a routerLink="/asistencias">Asistencia</a>
              <a routerLink="/historial">Historial</a>
              <a routerLink="/reportes">Reportes</a>
            </div>
          </div>
        </div>

        <div class="panel table-panel">
          <div class="panel-header">
            <h3>Últimas asistencias</h3>
          </div>

          @if (summary().ultimasAsistencias.length) {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of summary().ultimasAsistencias; track entry.id) {
                  <tr>
                    <td>{{ entry.persona }}</td>
                    <td>{{ entry.tipo }}</td>
                    <td>
                      <span class="status status-{{ entry.estado.toLowerCase() }}">{{ entry.estado }}</span>
                    </td>
                    <td>{{ entry.hora }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="empty-text">Aún no existen asistencias registradas para esta fecha.</p>
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-shell {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .page-header,
    .panel-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
    }

    .eyebrow {
      margin: 0;
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
    }

    h2,
    h3,
    p {
      margin: 0;
    }

    .date-badge {
      background: #eff6ff;
      color: #1d4ed8;
      border-radius: 999px;
      padding: 0.5rem 0.8rem;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1rem 1.1rem;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
    }

    .stat-card p {
      color: #64748b;
      font-size: 0.82rem;
      margin-bottom: 0.5rem;
    }

    .stat-card h3 {
      font-size: 1.8rem;
      color: #0f172a;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .panel {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1rem 1.1rem;
      box-shadow: 0 12px 25px rgba(15, 23, 42, 0.04);
    }

    .loader-panel {
      display: grid;
      place-items: center;
      min-height: 180px;
      color: #64748b;
      font-weight: 600;
    }

    .bar-chart {
      display: flex;
      align-items: stretch;
      gap: 0.25rem;
      height: 14px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: hidden;
      margin: 1rem 0 0.75rem;
    }

    .bar-bar {
      display: block;
      height: 100%;
      border-radius: 999px;
    }

    .bar-green { background: #16a34a; }
    .bar-yellow { background: #f59e0b; }
    .bar-red { background: #dc2626; }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      color: #475569;
      font-size: 0.82rem;
    }

    .dot {
      display: inline-block;
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 50%;
      margin-right: 0.45rem;
    }

    .dot.green { background: #16a34a; }
    .dot.yellow { background: #f59e0b; }
    .dot.red { background: #dc2626; }

    .quick-links {
      display: grid;
      gap: 0.7rem;
      margin-top: 1rem;
    }

    .quick-links a {
      display: block;
      padding: 0.8rem 0.9rem;
      text-decoration: none;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.8rem;
      color: #1e293b;
      font-weight: 600;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.92rem;
    }

    .data-table th,
    .data-table td {
      padding: 0.8rem 0.6rem;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }

    .data-table th {
      color: #64748b;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .status {
      display: inline-block;
      padding: 0.32rem 0.6rem;
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 700;
    }

    .status-puntual { background: #dcfce7; color: #166534; }
    .status-tardanza { background: #fef3c7; color: #92400e; }
    .status-falta { background: #fee2e2; color: #991b1b; }

    .empty-text {
      margin-top: 1rem;
      color: #64748b;
    }

    @media (max-width: 700px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class DashboardPage {
  private readonly dashboardService = inject(DashboardService);

  readonly summary = signal<DashboardSummary>(this.emptySummary());
  readonly loading = signal(true);

  readonly totalCards = computed(() => [
    { label: 'Total de personas', value: this.summary().totalPersonas, tone: 'primary' },
    { label: 'Estudiantes', value: this.summary().totalEstudiantes, tone: 'blue' },
    { label: 'Profesores', value: this.summary().totalProfesores, tone: 'slate' },
    { label: 'Asistencias hoy', value: this.summary().asistenciasHoy, tone: 'green' },
    { label: 'Puntuales', value: this.summary().puntuales, tone: 'success' },
    { label: 'Tardanzas', value: this.summary().tardanzas, tone: 'warning' },
    { label: 'Ausentes', value: this.summary().ausentes, tone: 'danger' }
  ]);

  constructor() {
    this.loadSummary();
  }

  private loadSummary(): void {
    this.dashboardService.getSummary().subscribe({
      next: (value) => {
        this.summary.set(value);
        this.loading.set(false);
      },
      error: () => {
        this.summary.set(this.emptySummary());
        this.loading.set(false);
      }
    });
  }

  calculateSegment(value: number): number {
    const total = Math.max(this.summary().asistenciasHoy, 1);
    return value ? (value / total) * 100 : 0;
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
