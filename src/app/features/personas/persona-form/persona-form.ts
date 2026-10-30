import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CrearPersona, Persona } from '../../../core/models/persona.model';
import { PersonasService } from '../../../core/services/personas.service';

@Component({
  selector: 'app-persona-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Personas</p>
          <h2>{{ isEditing() ? 'Editar persona' : 'Registrar persona' }}</h2>
        </div>
        <a class="secondary-button" routerLink="/personas">Volver</a>
      </div>

      <form class="form-card" [formGroup]="form" (ngSubmit)="save()">
        <div class="field-grid">
          <label>
            <span>Código</span>
            <input formControlName="codigo" type="text" placeholder="EST-00001" />
          </label>

          <label>
            <span>Documento</span>
            <input formControlName="documento" type="text" placeholder="Opcional" />
          </label>

          <label>
            <span>Nombres</span>
            <input formControlName="nombres" type="text" placeholder="Ingrese nombres" />
          </label>

          <label>
            <span>Apellidos</span>
            <input formControlName="apellidos" type="text" placeholder="Ingrese apellidos" />
          </label>

          <label>
            <span>Tipo de persona</span>
            <select formControlName="tipo">
              <option value="ESTUDIANTE">Estudiante</option>
              <option value="PROFESOR">Profesor</option>
            </select>
          </label>
        </div>

        @if (form.touched && form.invalid) {
          <div class="error-box">Complete los campos obligatorios antes de continuar.</div>
        }

        <div class="actions-row">
          <button type="submit" class="primary-button" [disabled]="submitting()">
            {{ submitting() ? 'Guardando...' : (isEditing() ? 'Actualizar persona' : 'Guardar persona') }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: `
    :host { display: block; }
    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2 { margin: 0; }
    .secondary-button,
    .primary-button { text-decoration: none; border-radius: 0.8rem; padding: 0.75rem 1rem; font-weight: 700; border: none; cursor: pointer; }
    .secondary-button { background: #f1f5f9; color: #0f172a; }
    .primary-button { background: #2563eb; color: white; }
    .form-card { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04); }
    .field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    label { display: flex; flex-direction: column; gap: 0.45rem; color: #334155; font-weight: 600; }
    input, select { width: 100%; border: 1px solid #cbd5e1; border-radius: 0.75rem; padding: 0.75rem 0.8rem; font-size: 0.95rem; }
    .error-box { margin-top: 1rem; color: #b91c1c; background: #fee2e2; border-radius: 0.8rem; padding: 0.75rem 1rem; }
    .actions-row { margin-top: 1rem; display: flex; justify-content: flex-end; }
    @media (max-width: 640px) { .page-header { flex-direction: column; align-items: flex-start; } }
  `
})
export class PersonaFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly personasService = inject(PersonasService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly isEditing = signal(false);

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.minLength(3)]],
    documento: [''],
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    tipo: ['ESTUDIANTE' as 'ESTUDIANTE' | 'PROFESOR', [Validators.required]]
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.loadPersona(Number(id));
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CrearPersona = {
      codigo: this.form.value.codigo?.trim() ?? '',
      documento: this.form.value.documento?.trim() || undefined,
      nombres: this.form.value.nombres?.trim() ?? '',
      apellidos: this.form.value.apellidos?.trim() ?? '',
      tipo: this.form.value.tipo ?? 'ESTUDIANTE'
    };

    this.submitting.set(true);
    const id = this.route.snapshot.paramMap.get('id');

    const request = id
      ? this.personasService.update(Number(id), payload)
      : this.personasService.create(payload);

    request.subscribe({
      next: (response) => {
        this.submitting.set(false);
        if (response) {
          this.router.navigateByUrl('/personas');
        }
      },
      error: () => {
        this.submitting.set(false);
      }
    });
  }

  private loadPersona(id: number): void {
    this.personasService.getById(id).subscribe((persona) => {
      if (!persona) {
        this.router.navigateByUrl('/personas');
        return;
      }

      this.form.patchValue({
        codigo: persona.codigo,
        documento: persona.documento ?? '',
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        tipo: persona.tipo
      });
    });
  }
}
