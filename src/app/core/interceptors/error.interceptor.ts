import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';

const resolveMessage = (error: HttpErrorResponse): string => {
  const payload = error.error;
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    if (Array.isArray(message) && message.length) {
      return message.map((item) => String(item)).join('; ');
    }
  }

  if (error.status === 0) {
    return 'No se pudo establecer conexión con el backend.';
  }

  if (error.status === 400) {
    return 'La solicitud enviada no es válida.';
  }

  if (error.status === 401) {
    return 'La sesión ha caducado o no tiene autorización.';
  }

  if (error.status === 403) {
    return 'No tiene permisos para acceder a este recurso.';
  }

  if (error.status === 404) {
    return 'El recurso solicitado no fue encontrado.';
  }

  if (error.status === 409) {
    return 'El recurso ya existe o presenta un conflicto.';
  }

  if (error.status === 413) {
    return 'El archivo excede el límite permitido.';
  }

  if (error.status === 422) {
    return 'Los datos enviados no cumplen las validaciones del sistema.';
  }

  if (error.status >= 500) {
    return 'El servidor ha presentado un error interno. Inténtelo nuevamente.';
  }

  return error.message || 'Se produjo un error inesperado.';
};

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notificationService = inject(NotificationService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = resolveMessage(error);
      notificationService.showError(message);
      return throwError(() => error);
    })
  );
};
