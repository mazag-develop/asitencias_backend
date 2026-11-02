import { Component } from '@angular/core';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-configuracion-page',
  standalone: true,
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="eyebrow">Configuración</p>
          <h2>Información del sistema</h2>
        </div>
      </div>

      <div class="grid">
        <div class="panel">
          <h3>Backend</h3>
          <p>URL base: {{ apiUrl }}</p>
          <p>Modo: {{ environment.production ? 'Producción' : 'Desarrollo' }}</p>
        </div>

        <div class="panel">
          <h3>Integraciones disponibles</h3>
          <ul>
            <li>Gestión de personas, estado y carga masiva</li>
            <li>Asistencias, resumen y reportes</li>
            <li>Auditoría de eventos</li>
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .page-shell { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .eyebrow { margin: 0; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    h2, h3, p { margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .panel { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1rem 1.1rem; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04); display: flex; flex-direction: column; gap: 0.6rem; }
    ul { margin: 0; padding-left: 1.2rem; color: #475569; }
  `
})
export class ConfiguracionPage {
  readonly apiUrl = environment.apiUrl;
  readonly environment = environment;
}
