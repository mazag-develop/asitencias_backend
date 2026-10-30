import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar" [class.is-open]="menuOpen()">
        <div class="brand-block">
          <div class="brand-mark">A</div>
          <div>
            <p class="eyebrow">Sistema</p>
            <h2>Asistencias</h2>
          </div>
        </div>

        @for (group of menuGroups; track group.title) {
          <div class="nav-section">
            <p class="section-title">{{ group.title }}</p>
            @for (item of group.items; track item.id) {
              <a class="nav-item" [routerLink]="item.route" routerLinkActive="active" (click)="closeSidebar()">
                <span class="nav-icon">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </a>
            }
          </div>
        }
      </aside>

      <div class="main-panel">
        <header class="topbar">
          <div class="topbar-start">
            <button class="menu-toggle" type="button" (click)="toggleSidebar()" aria-label="Abrir menú">
              ☰
            </button>
            <div>
              <p class="eyebrow">Dashboard</p>
              <h1>Control escolar</h1>
            </div>
          </div>

          <div class="topbar-end">
            <div class="status-pill">
              <span class="status-dot"></span>
              Backend activo
            </div>
          </div>
        </header>

        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>

    @if (notifications().length) {
      <div class="toast-stack">
        @for (item of notifications(); track item.id) {
          <div class="toast toast-{{ item.type }}">
            <strong>{{ item.type === 'success' ? 'Éxito' : item.type === 'warning' ? 'Advertencia' : item.type === 'error' ? 'Error' : 'Información' }}</strong>
            <span>{{ item.message }}</span>
          </div>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: #f8fafc;
      color: #1e293b;
      font-family: 'Segoe UI', sans-serif;
    }

    .app-shell {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 280px;
      background: #0f172a;
      color: #e2e8f0;
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.2s ease;
    }

    .brand-block {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem 1rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .brand-mark {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #2563eb, #0ea5e9);
      display: grid;
      place-items: center;
      font-weight: 700;
      color: white;
    }

    .eyebrow {
      margin: 0;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      opacity: 0.72;
    }

    .brand-block h2,
    .topbar h1 {
      margin: 0;
      font-size: 1.1rem;
      color: white;
    }

    .section-title {
      margin: 0 0 0.4rem;
      padding: 0 0.75rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #94a3b8;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 0.9rem;
      border-radius: 0.8rem;
      color: #e2e8f0;
      text-decoration: none;
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .nav-item:hover,
    .nav-item.active {
      background: rgba(37, 99, 235, 0.16);
      color: white;
    }

    .nav-icon {
      display: inline-grid;
      place-items: center;
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 0.55rem;
      background: rgba(148, 163, 184, 0.12);
      font-size: 0.9rem;
    }

    .main-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.1rem 1.5rem;
      background: rgba(255, 255, 255, 0.75);
      border-bottom: 1px solid #e2e8f0;
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .topbar-start {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .menu-toggle {
      display: none;
      border: 1px solid #cbd5e1;
      background: white;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.7rem;
      font-size: 1.2rem;
      cursor: pointer;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.8rem;
      border-radius: 999px;
      background: #dcfce7;
      color: #166534;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .status-dot {
      width: 0.6rem;
      height: 0.6rem;
      border-radius: 50%;
      background: #22c55e;
      display: inline-block;
    }

    .page-content {
      flex: 1;
      padding: 1.5rem;
    }

    .toast-stack {
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 50;
    }

    .toast {
      min-width: 260px;
      max-width: 360px;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      padding: 0.8rem 1rem;
      border-radius: 0.9rem;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15);
      color: #0f172a;
      background: white;
      border-left: 5px solid #2563eb;
    }

    .toast-success {
      border-left-color: #16a34a;
      background: #f0fdf4;
    }

    .toast-error {
      border-left-color: #dc2626;
      background: #fef2f2;
    }

    .toast-warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .toast-info {
      border-left-color: #2563eb;
      background: #eff6ff;
    }

    @media (max-width: 900px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 30;
        transform: translateX(-100%);
        box-shadow: 0 0 30px rgba(15, 23, 42, 0.2);
      }

      .sidebar.is-open {
        transform: translateX(0);
      }

      .menu-toggle {
        display: inline-grid;
        place-items: center;
      }

      .page-content {
        padding: 1rem;
      }
    }
  `
})
export class MainLayout {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = this.notificationService.notifications;
  readonly menuGroups = [
    {
      title: 'GENERAL',
      items: [{ id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: '▣' }]
    },
    {
      title: 'GESTIÓN',
      items: [
        { id: 'personas', label: 'Personas', route: '/personas', icon: '👥' },
        { id: 'estudiantes', label: 'Estudiantes', route: '/personas', icon: '🧑‍🎓' },
        { id: 'profesores', label: 'Profesores', route: '/personas', icon: '👨‍🏫' }
      ]
    },
    {
      title: 'ASISTENCIA',
      items: [
        { id: 'registrar-asistencia', label: 'Registrar asistencia', route: '/asistencias', icon: '✓' },
        { id: 'historial', label: 'Historial', route: '/historial', icon: '🕒' },
        { id: 'asistencia-diaria', label: 'Resumen diario', route: '/asistencia-diaria', icon: '📊' }
      ]
    },
    {
      title: 'REPORTES',
      items: [
        { id: 'reportes', label: 'Reporte general', route: '/reportes', icon: '📈' },
        { id: 'tardanzas', label: 'Tardanzas', route: '/reportes', icon: '⚠️' },
        { id: 'faltas', label: 'Faltas', route: '/reportes', icon: '🚫' }
      ]
    }
  ];

  readonly menuOpen = signal(false);

  toggleSidebar(): void {
    this.menuOpen.update((current) => !current);
  }

  closeSidebar(): void {
    this.menuOpen.set(false);
  }
}
