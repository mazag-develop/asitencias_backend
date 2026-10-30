import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ResumenAsistenciaDiaria } from '../../../core/models/asistencia.model';
import { AsistenciasService } from '../../../core/services/asistencias.service';

@Component({
  selector: 'app-asistencia-diaria-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Jornada</p>
          <h2>Resumen diario</h2>
        </div>
      </div>

      <div class="panel filters">
        <label>
          <span>Filtrar por tipo</span>
          <select [(ngModel)]="tipoPersona" (change)="loadSummary()">
            <option value="">Todos</option>
            <option value="ESTUDIANTE">Estudiantes</option>
            <option value="PROFESOR">Profesores</option>
          </select>
        </label>
      </div>

      <div class="stats-grid">
        <article class="stat-card">
          <p>Estudiantes</p>
          <h3>{{ summary().totalEstudiantes }}</h3>
        </article>
        <article class="stat-card">
          <p>Profesores</p>
          <h3>{{ summary().totalProfesores }}</h3>
        </article>
        <article class="stat-card">
          <p>Puntualidades</p>
          <h3>{{ summary().puntualidades }}</h3>
        </article>
        <article class="stat-card">
          <p>Tardanzas</p>
          <h3>{{ summary().tardanzas }}</h3>
        </article>
        <article class="stat-card">
          <p>Faltas</p>
          <h3>{{ summary().faltas }}</h3>
        </article>
        <article class="stat-card">
          <p>Pendientes</p>
          <h3>{{ summary().pendientes }}</h3>
        </article>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2 { margin: 0; }
    .panel { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem 1.1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04); }
    label { display: flex; flex-direction: column; gap: 0.45rem; font-weight: 700; }
    select { border: 1px solid #cbd5e1; border-radius: 0.8rem; padding: 0.7rem 0.8rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; }
    .stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem 1.1rem; }
    .stat-card p { margin: 0 0 0.4rem; color: #64748b; }
    .stat-card h3 { margin: 0; font-size: 1.8rem; }
  `
})
export class AsistenciaDiariaPage {
  private readonly asistenciasService = inject(AsistenciasService);

  readonly summary = signal<ResumenAsistenciaDiaria>({
    totalEstudiantes: 0,
    totalProfesores: 0,
    puntualidades: 0,
    tardanzas: 0,
    faltas: 0,
    pendientes: 0
  });

  tipoPersona = '';

  constructor() {
    this.loadSummary();
  }

  loadSummary(): void {
    const filters = this.tipoPersona ? { tipo: this.tipoPersona } : {};
    this.asistenciasService.resumenDiario(filters).subscribe((value) => this.summary.set(value));
  }
}
