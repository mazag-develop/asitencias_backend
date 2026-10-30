import { Routes } from '@angular/router';

import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'asistencias',
    loadComponent: () =>
      import('./features/asistencias/asistencia-scan/asistencia-scan').then((m) => m.AsistenciaScanPage)
  },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardPage)
      },
      {
        path: 'personas',
        loadComponent: () => import('./features/personas/personas-list/personas-list').then((m) => m.PersonasListPage)
      },
      {
        path: 'personas/nuevo',
        loadComponent: () => import('./features/personas/persona-form/persona-form').then((m) => m.PersonaFormPage)
      },
      {
        path: 'personas/:id',
        loadComponent: () => import('./features/personas/persona-detail/persona-detail').then((m) => m.PersonaDetailPage)
      },
      {
        path: 'personas/:id/editar',
        loadComponent: () => import('./features/personas/persona-form/persona-form').then((m) => m.PersonaFormPage)
      },
      {
        path: 'historial',
        loadComponent: () => import('./features/asistencias/asistencia-historial/asistencia-historial').then((m) => m.AsistenciaHistorialPage)
      },
      {
        path: 'asistencia-diaria',
        loadComponent: () => import('./features/asistencias/asistencia-diaria/asistencia-diaria').then((m) => m.AsistenciaDiariaPage)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes').then((m) => m.ReportesPage)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/configuracion/configuracion').then((m) => m.ConfiguracionPage)
      },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
