import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSignal = signal<AppNotification[]>([]);
  readonly notifications = this.notificationsSignal.asReadonly();

  showSuccess(message: string): void {
    this.push('success', message);
  }

  showError(message: string): void {
    this.push('error', message);
  }

  showWarning(message: string): void {
    this.push('warning', message);
  }

  showInfo(message: string): void {
    this.push('info', message);
  }

  private push(type: NotificationType, message: string): void {
    const notification: AppNotification = {
      id: Date.now() + Math.random(),
      type,
      message
    };

    this.notificationsSignal.update((current) => [...current, notification]);

    setTimeout(() => {
      this.notificationsSignal.update((current) => current.filter((item) => item.id !== notification.id));
    }, 4000);
  }
}
