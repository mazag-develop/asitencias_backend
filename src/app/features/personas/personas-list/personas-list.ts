import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Persona } from '../../../core/models/persona.model';
import { PersonasService } from '../../../core/services/personas.service';

@Component({
  selector: 'app-personas-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Gestión</p>
          <h2>Personas</h2>
        </div>
        <button type="button" class="primary-button" [routerLink]="'/personas/nuevo'">+ Nueva persona</button>
      </div>

      <div class="filters-card">
        <input type="search" placeholder="Buscar por código, documento o nombre" [(ngModel)]="query" (ngModelChange)="onFilterChange()" />
      </div>

      @if (loading()) {
        <div class="panel loader-panel">Cargando personas...</div>
      } @else {
        <div class="panel">
          @if (personas().length) {
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Documento</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (persona of personas(); track persona.id) {
                    <tr>
                      <td>{{ persona.codigo }}</td>
                      <td>{{ persona.documento || '—' }}</td>
                      <td>{{ persona.nombres }}</td>
                      <td>{{ persona.apellidos }}</td>
                      <td>{{ persona.tipo }}</td>
                      <td>
                        <span class="status status-{{ persona.activo ? 'active' : 'inactive' }}">
                          {{ persona.activo ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td>{{ persona.createdAt | date: 'dd/MM/yyyy' }}</td>
                      <td class="actions">
                        <button type="button" class="link-button" [routerLink]="['/personas', persona.id]">Ver</button>
                        <button type="button" class="link-button" [routerLink]="['/personas', persona.id, 'editar']">Editar</button>
                        <button type="button" class="link-button" (click)="toggleStatus(persona)">
                          {{ persona.activo ? 'Desactivar' : 'Activar' }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="empty-state">No se encontraron personas con los filtros actuales.</div>
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host { display: block; }

    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2 { margin: 0; }
    .filters-card,
    .panel {
      background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem 1.1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04);
    }
    input {
      width: 100%; border: 1px solid #cbd5e1; border-radius: 0.75rem; padding: 0.75rem 0.9rem; font-size: 0.95rem;
    }
    .primary-button {
      border: none; background: #2563eb; color: white; border-radius: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; font-weight: 700;
    }
    .loader-panel { display: grid; place-items: center; min-height: 140px; color: #64748b; font-weight: 600; }
    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 760px; }
    .data-table th, .data-table td { border-bottom: 1px solid #e2e8f0; padding: 0.78rem 0.6rem; text-align: left; }
    .data-table th { color: #64748b; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .status { display: inline-block; border-radius: 999px; padding: 0.32rem 0.6rem; font-size: 0.74rem; font-weight: 700; }
    .status-active { background: #dcfce7; color: #166534; }
    .status-inactive { background: #f1f5f9; color: #475569; }
    .actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .link-button { border: 1px solid #cbd5e1; background: white; color: #0f172a; border-radius: 0.6rem; padding: 0.35rem 0.6rem; cursor: pointer; }
    .empty-state { color: #64748b; padding: 1rem 0; font-weight: 600; }
    @media (max-width: 650px) { .page-header { align-items: flex-start; flex-direction: column; } }
  `
})
export class PersonasListPage {
  private readonly personasService = inject(PersonasService);
  private readonly router = inject(Router);

  readonly personas = signal<Persona[]>([]);
  readonly loading = signal(true);

  query = '';

  constructor() {
    this.loadPage();
  }

  onFilterChange(): void {
    this.loadPage();
  }

  toggleStatus(persona: Persona): void {
    this.personasService.updateStatus(persona.id, !persona.activo).subscribe({
      next: (updated) => {
        if (updated) {
          this.personas.update((items) => items.map((item) => (item.id === updated.id ? updated : item)));
        }
      }
    });
  }

  private loadPage(): void {
    this.loading.set(true);
    const filters = this.query.trim()
      ? { codigo: this.query.trim() }
      : {};

    this.personasService.list(filters).subscribe({
      next: (response) => {
        this.personas.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.personas.set([]);
        this.loading.set(false);
      }
    });
  }
}
