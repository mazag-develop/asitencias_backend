import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Persona } from '../../../core/models/persona.model';
import { PersonasService } from '../../../core/services/personas.service';

@Component({
  selector: 'app-persona-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Personas</p>
          <h2>Detalle</h2>
        </div>
        <div class="actions">
          <a class="secondary-button" [routerLink]="['/personas', persona()?.id, 'editar']">Editar</a>
          <a class="secondary-button" routerLink="/personas">Volver</a>
        </div>
      </div>

      @if (persona()) {
        <div class="card">
          <div class="row"><span>Código</span><strong>{{ persona()?.codigo }}</strong></div>
          <div class="row"><span>DNI</span><strong>{{ persona()?.dni || persona()?.documento || 'Sin DNI' }}</strong></div>
          <div class="row"><span>Nombres</span><strong>{{ persona()?.nombres }}</strong></div>
          <div class="row"><span>Apellidos</span><strong>{{ persona()?.apellidos }}</strong></div>
          <div class="row"><span>Tipo</span><strong>{{ persona()?.tipo }}</strong></div>
          @if (persona()?.tipo === 'ESTUDIANTE') {
            <div class="row"><span>Grado</span><strong>{{ persona()?.grado || '—' }}</strong></div>
            <div class="row"><span>Sección</span><strong>{{ persona()?.seccion || '—' }}</strong></div>
          } @else {
            <div class="row"><span>Cargo</span><strong>{{ persona()?.cargo || '—' }}</strong></div>
          }
          <div class="row"><span>Estado</span><strong>{{ persona()?.activo ? 'Habilitado' : 'Deshabilitado' }}</strong></div>
          <div class="row"><span>Registro</span><strong>{{ persona()?.createdAt | date: 'dd/MM/yyyy' }}</strong></div>
        </div>
      } @else if (loadError()) {
        <div class="card empty">No se pudo cargar la información de la persona.</div>
      } @else {
        <div class="card empty">Cargando información de la persona...</div>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2 { margin: 0; }
    .actions { display: flex; gap: 0.75rem; }
    .secondary-button { text-decoration: none; background: #f1f5f9; color: #0f172a; border-radius: 0.8rem; padding: 0.75rem 1rem; font-weight: 700; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem; display: grid; gap: 0.8rem; }
    .row { display: flex; justify-content: space-between; gap: 1rem; border-bottom: 1px solid #eef2f7; padding-bottom: 0.65rem; }
    .row span { color: #64748b; }
    .empty { color: #64748b; }
    @media (max-width: 640px) { .page-header { flex-direction: column; align-items: flex-start; } .row { flex-direction: column; } }
  `
})
export class PersonaDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly personasService = inject(PersonasService);

  readonly persona = signal<Persona | null>(null);
  readonly loadError = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.personasService.getById(id).subscribe({
        next: (value) => this.persona.set(value),
        error: () => this.loadError.set(true)
      });
    } else {
      this.loadError.set(true);
    }
  }
}
