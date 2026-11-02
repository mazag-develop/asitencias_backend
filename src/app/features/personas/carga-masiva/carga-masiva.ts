import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ResultadoImportacionCarga,
  ResultadoValidacionCarga
} from '../../../core/models/persona.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PersonasService } from '../../../core/services/personas.service';

@Component({
  selector: 'app-carga-masiva-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Personas</p>
          <h2>Carga masiva</h2>
        </div>
        <a class="secondary-button" routerLink="/personas">Volver a personas</a>
      </div>

      <div class="panel instructions">
        <h3>Importa personas desde Excel</h3>
        <p>Descarga la plantilla, completa sus columnas y valida el archivo antes de importar.</p>
        <p>Se admite .xlsx hasta 5 MB y 1.000 filas de datos. Las filas rechazadas no se guardarán.</p>
        <button type="button" class="secondary-button" (click)="downloadTemplate()" [disabled]="downloading()">
          {{ downloading() ? 'Descargando...' : 'Descargar plantilla' }}
        </button>
      </div>

      <div class="panel">
        <label class="file-label" for="people-file">Archivo .xlsx</label>
        <input
          id="people-file"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          (change)="onFileChange($event)"
          [disabled]="validating() || importing()"
        />
        @if (selectedFile(); as file) {
          <p class="file-details">{{ file.name }} · {{ formatFileSize(file.size) }}</p>
        }
        <button
          type="button"
          class="primary-button"
          (click)="validateFile()"
          [disabled]="!selectedFile() || validating() || importing()"
        >
          {{ validating() ? 'Validando...' : 'Validar archivo' }}
        </button>
      </div>

      @if (validation(); as result) {
        <div class="panel results">
          <h3>Resultado de validación</h3>
          <p>{{ result.totalFilas }} filas · {{ result.validas }} válidas · {{ result.rechazadas }} rechazadas</p>
          @if (result.errores.length) {
            <div class="table-wrap">
              <table>
                <thead><tr><th>Fila</th><th>Campo</th><th>Error</th></tr></thead>
                <tbody>
                  @for (error of result.errores; track $index) {
                    <tr><td>{{ error.fila }}</td><td>{{ error.campo }}</td><td>{{ error.mensaje }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
          @if (result.registros.length) {
            <h4>Filas válidas para importar</h4>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Fila</th><th>Código</th><th>DNI</th><th>Persona</th><th>Tipo</th></tr></thead>
                <tbody>
                  @for (registro of result.registros; track registro.fila) {
                    <tr>
                      <td>{{ registro.fila }}</td>
                      <td>{{ registro.codigo }}</td>
                      <td>{{ registro.dni }}</td>
                      <td>{{ registro.nombres }} {{ registro.apellidos }}</td>
                      <td>{{ registro.tipo }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <label class="confirmation">
              <input type="checkbox" [checked]="confirmed()" (change)="onConfirmationChange($event)" />
              Confirmo importar {{ result.validas }} filas válidas. Las filas rechazadas no se guardarán.
            </label>
            <button
              type="button"
              class="primary-button"
              (click)="importFile()"
              [disabled]="!confirmed() || importing() || validating()"
            >
              {{ importing() ? 'Importando...' : 'Confirmar e importar' }}
            </button>
          }
        </div>
      }

      @if (importResult(); as result) {
        <div class="panel results">
          <h3>Resultado de importación</h3>
          <p>{{ result.totalFilas }} filas · {{ result.creadas }} creadas · {{ result.rechazadas }} rechazadas</p>
          @if (result.errores.length) {
            <div class="table-wrap">
              <table>
                <thead><tr><th>Fila</th><th>Campo</th><th>Error</th></tr></thead>
                <tbody>
                  @for (error of result.errores; track $index) {
                    <tr><td>{{ error.fila }}</td><td>{{ error.campo }}</td><td>{{ error.mensaje }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2, h3, h4, p { margin-top: 0; }
    .panel { display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem 1.1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04); }
    .instructions p, .file-details { margin: 0; color: #475569; }
    .file-label { font-weight: 700; }
    input[type='file'] { max-width: 100%; }
    .primary-button, .secondary-button { text-decoration: none; border: 0; border-radius: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; font-weight: 700; }
    .primary-button { background: #2563eb; color: white; }
    .secondary-button { display: inline-block; background: #f1f5f9; color: #0f172a; }
    button:disabled { opacity: 0.55; cursor: not-allowed; }
    .table-wrap { width: 100%; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 520px; }
    th, td { padding: 0.7rem 0.55rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { color: #64748b; font-size: 0.72rem; text-transform: uppercase; }
    .confirmation { display: flex; align-items: flex-start; gap: 0.6rem; color: #334155; }
    @media (max-width: 640px) { .page-header { flex-direction: column; align-items: flex-start; } }
  `
})
export class CargaMasivaPage {
  private readonly personasService = inject(PersonasService);
  private readonly notifications = inject(NotificationService);

  readonly selectedFile = signal<File | null>(null);
  readonly validation = signal<ResultadoValidacionCarga | null>(null);
  readonly importResult = signal<ResultadoImportacionCarga | null>(null);
  readonly confirmed = signal(false);
  readonly validating = signal(false);
  readonly importing = signal(false);
  readonly downloading = signal(false);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    input.value = '';

    if (!file) {
      return;
    }

    this.validation.set(null);
    this.importResult.set(null);
    this.confirmed.set(false);

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.clearSelection();
      this.notifications.showError('Seleccione un archivo con formato .xlsx.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.clearSelection();
      this.notifications.showError('El archivo supera el límite de 5 MB.');
      return;
    }

    this.selectedFile.set(file);
  }

  onConfirmationChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.confirmed.set(event.target.checked);
    }
  }

  validateFile(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.validation.set(null);
    this.importResult.set(null);
    this.confirmed.set(false);
    this.validating.set(true);
    this.personasService.validateBulkUpload(file).subscribe({
      next: (result) => {
        this.validation.set(result);
        this.importResult.set(null);
        this.confirmed.set(false);
        this.validating.set(false);
      },
      error: () => this.validating.set(false)
    });
  }

  importFile(): void {
    const file = this.selectedFile();
    const result = this.validation();
    if (!file || !result?.validas || !this.confirmed()) {
      return;
    }

    this.importing.set(true);
    this.personasService.importBulkUpload(file).subscribe({
      next: (importResult) => {
        this.importResult.set(importResult);
        this.importing.set(false);
        this.notifications.showSuccess(
          `Importación finalizada: ${importResult.creadas} personas creadas.`
        );
      },
      error: () => this.importing.set(false)
    });
  }

  downloadTemplate(): void {
    this.downloading.set(true);
    this.personasService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'plantilla-personas.xlsx';
        link.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => this.downloading.set(false)
    });
  }

  formatFileSize(size: number): string {
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }

  private clearSelection(): void {
    this.selectedFile.set(null);
    this.validation.set(null);
    this.importResult.set(null);
    this.confirmed.set(false);
  }
}
