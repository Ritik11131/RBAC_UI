export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';

export interface ToastConfig {
  id?: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  position?: ToastPosition;
  dismissible?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
}

export interface Toast extends ToastConfig {
  id: string;
  timestamp: number;
}

