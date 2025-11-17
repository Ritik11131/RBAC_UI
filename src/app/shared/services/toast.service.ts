import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Toast, ToastConfig, ToastType, ToastPosition } from '../../core/interfaces/toast.interface';
import { extractErrorMessage } from '../utils/error.util';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new Subject<Toast>();
  private toastIdCounter = 0;

  /**
   * Observable to subscribe to toast notifications
   */
  getToasts(): Observable<Toast> {
    return this.toasts$.asObservable();
  }

  /**
   * Show a toast notification
   */
  show(config: ToastConfig): string {
    const toast: Toast = {
      id: config.id || `toast-${++this.toastIdCounter}-${Date.now()}`,
      type: config.type,
      message: config.message,
      title: config.title,
      duration: config.duration ?? 5000, // Default 5 seconds
      position: config.position ?? 'top-right',
      dismissible: config.dismissible ?? true,
      action: config.action,
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
      showCancel: config.showCancel ?? false,
      cancelLabel: config.cancelLabel ?? 'Cancel',
      confirmLabel: config.confirmLabel ?? 'Confirm',
      timestamp: Date.now(),
    };

    this.toasts$.next(toast);
    return toast.id;
  }

  /**
   * Show success toast
   */
  success(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'success', message, title, duration, position: 'bottom-center' });
  }

  /**
   * Show error toast
   * @param messageOrError Error message string or error object from API
   * @param title Optional title (if messageOrError is a string)
   * @param duration Optional duration
   */
  error(messageOrError: string | any, title?: string, duration?: number): string {
    // If it's an error object, extract the message
    if (typeof messageOrError !== 'string') {
      const errorInfo = extractErrorMessage(messageOrError);
      // If there's a title but no message, use title as message
      // If there's both, use title as title and message as subtext
      return this.show({
        type: 'error',
        message: errorInfo.message || errorInfo.title,
        title: errorInfo.message ? errorInfo.title : undefined,
        duration: duration ?? 7000, // Longer duration for errors
        position: 'bottom-center'
      });
    }
    
    // If it's a string, use it as message
    return this.show({
      type: 'error',
      message: messageOrError,
      title: title,
      duration: duration ?? 5000,
      position: 'bottom-center'
    });
  }

  /**
   * Show warning toast
   */
  warning(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'warning', message, title, duration });
  }

  /**
   * Show info toast
   */
  info(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'info', message, title, duration });
  }

  /**
   * Show centered confirmation toast (for delete operations)
   */
  confirm(
    message: string,
    title: string = 'Confirm Action',
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmLabel: string = 'Confirm',
    cancelLabel: string = 'Cancel'
  ): string {
    return this.show({
      type: 'warning',
      message,
      title,
      position: 'center',
      duration: 0, // No auto-dismiss for confirmation
      dismissible: false,
      showCancel: true,
      onConfirm,
      onCancel,
      confirmLabel,
      cancelLabel,
    });
  }

  /**
   * Show delete confirmation toast
   */
  confirmDelete(
    itemName: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ): string {
    return this.confirm(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      'Delete Confirmation',
      onConfirm,
      onCancel,
      'Delete',
      'Cancel'
    );
  }
}

