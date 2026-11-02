import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { EventoAuditoria } from '../../core/models/persona.model';
import { AuditoriaService } from '../../core/services/auditoria.service';

@Component({
  selector: 'app-auditoria-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Sistema</p>
          <h2>Auditoría</h2>
        </div>
        <button type="button" class="secondary-button" (click)="loadEvents()" [disabled]="loading()">
          Actualizar
        </button>
      </div>

      @if (loading()) {
        <div class="panel empty-state">Cargando eventos...</div>
      } @else if (events().length) {
        <div class="panel table-wrap">
          <table>
            <thead>
              <tr><th>Fecha y hora</th><th>Entidad</th><th>Acción</th><th>Persona</th><th>Actor</th></tr>
            </thead>
            <tbody>
              @for (event of events(); track event.entidad + '-' + event.id) {
                <tr>
                  <td>{{ event.fechaHora | date: 'dd/MM/yyyy HH:mm:ss' }}</td>
                  <td>{{ event.entidad }}</td>
                  <td>{{ event.accion }}</td>
                  <td>
                    @if (event.persona) {
                      {{ event.persona.codigo }} · {{ event.persona.nombres }} {{ event.persona.apellidos }}
                    } @else {
                      {{ event.personaId ?? '—' }}
                    }
                  </td>
                  <td>{{ event.actorId ?? 'Sin identificar' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="panel empty-state">No hay eventos de auditoría registrados.</div>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2 { margin: 0; }
    .panel { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem 1.1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04); }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 700px; }
    th, td { padding: 0.78rem 0.6rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { color: #64748b; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .secondary-button { border: 0; background: #f1f5f9; color: #0f172a; border-radius: 0.75rem; padding: 0.75rem 1rem; font-weight: 700; cursor: pointer; }
    .secondary-button:disabled { opacity: 0.55; cursor: not-allowed; }
    .empty-state { color: #64748b; }
    @media (max-width: 640px) { .page-header { align-items: flex-start; flex-direction: column; } }
  `
})
export class AuditoriaPage {
  private readonly auditoriaService = inject(AuditoriaService);

  readonly events = signal<EventoAuditoria[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.auditoriaService.getRecentEvents().subscribe({
      next: (response) => {
        this.events.set(response.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
