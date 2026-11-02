import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
        <div class="header-actions">
          <a class="secondary-button" routerLink="/personas/carga-masiva">Carga masiva</a>
          <button type="button" class="primary-button" [routerLink]="'/personas/nuevo'">+ Nueva persona</button>
        </div>
      </div>

      <div class="filters-card">
        <input type="search" placeholder="Buscar por código" [(ngModel)]="query" (ngModelChange)="onFilterChange()" />
      </div>

      @if (loading()) {
        <div class="panel loader-panel">Cargando personas...</div>
      } @else {
        @if (loadError()) {
          <div class="panel error-state">No se pudo cargar el listado. Intente actualizar la búsqueda.</div>
        }
        <div class="panel">
          @if (personas().length) {
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>DNI</th>
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
                      <td>{{ persona.dni || persona.documento || '—' }}</td>
                      <td>{{ persona.nombres }}</td>
                      <td>{{ persona.apellidos }}</td>
                      <td>{{ persona.tipo }}</td>
                      <td>
                        <span class="status status-{{ persona.activo ? 'active' : 'inactive' }}">
                          {{ persona.activo ? 'Habilitado' : 'Deshabilitado' }}
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
            @if (!loadError()) {
              <div class="empty-state">No se encontraron personas con los filtros actuales.</div>
            }
          }
        </div>
        @if (totalPages() > 1) {
          <div class="pagination">
            <button type="button" class="link-button" (click)="loadPage(currentPage() - 1)" [disabled]="currentPage() <= 1">
              Anterior
            </button>
            <span>Página {{ currentPage() }} de {{ totalPages() }} · {{ totalRecords() }} personas</span>
            <button type="button" class="link-button" (click)="loadPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()">
              Siguiente
            </button>
          </div>
        }
      }
    </section>
  `,
  styles: `
    :host { display: block; }

    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .header-actions { display: flex; align-items: center; gap: 0.6rem; }
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
    .secondary-button { text-decoration: none; background: #f1f5f9; color: #0f172a; border-radius: 0.75rem; padding: 0.75rem 1rem; font-weight: 700; }
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
    .error-state { color: #b91c1c; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; color: #475569; }
    .link-button:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 650px) { .page-header { align-items: flex-start; flex-direction: column; } .header-actions { flex-wrap: wrap; } .pagination { flex-wrap: wrap; } }
  `
})
export class PersonasListPage {
  private readonly personasService = inject(PersonasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly personas = signal<Persona[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly totalRecords = signal(0);

  query = '';
  tipo = '';

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const tipo = params.get('tipo');
      this.tipo = tipo === 'ESTUDIANTE' || tipo === 'PROFESOR' ? tipo : '';
      this.loadInitialPage();
    });
  }

  onFilterChange(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.currentPage.set(page);
    this.loadError.set(false);
    this.loading.set(true);
    const filters = {
      ...(this.query.trim() ? { codigo: this.query.trim() } : {}),
      ...(this.tipo ? { tipo: this.tipo } : {}),
      pagina: page,
      limite: 10
    };

    this.personasService.list(filters).subscribe({
      next: (response) => {
        this.personas.set(response.data);
        this.currentPage.set(response.paginacion.pagina);
        this.totalPages.set(response.paginacion.totalPaginas);
        this.totalRecords.set(response.paginacion.total);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
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

  private loadInitialPage(): void {
    this.loadPage(1);
  }
}
