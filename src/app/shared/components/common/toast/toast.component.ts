import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button.component';
import { Toast, ToastType } from '../../../../core/interfaces/toast.interface';

@Component({
  selector: 'app-toast',
  imports: [CommonModule, ButtonComponent],
  template: `
    <div
      [id]="toast.id"
      class="w-full max-w-xs p-4 mb-4 text-sm rounded-lg border animate-slide-up"
      [ngClass]="getToastClasses()"
      role="alert"
    >
      <h3 [ngClass]="getTitleClasses()" class="font-semibold">
        {{ toast.title || getDefaultTitle() }}
      </h3>
      
      <div [ngClass]="getMessageClasses()" class="mt-2 mb-4">
        {{ toast.message }}
      </div>

      @if (toast.dismissible) {
        <div class="flex items-center space-x-3">
          <app-button
            size="xs"
            variant="primary"
            [className]="getActionButtonClasses()"
            (btnClick)="onDismiss()"
            [startIcon]="getActionIcon()"
          >
            Close
          </app-button>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ToastComponent {
  @Input() toast!: Toast;
  @Output() dismiss = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<() => void>();

  getToastClasses(): string {
    const classes = {
      success: 'bg-success-50 border-success-200 dark:bg-success-500/15 dark:border-success-500/30',
      error: 'bg-error-50 border-error-200 dark:bg-error-500/15 dark:border-error-500/30',
      warning: 'bg-warning-50 border-warning-200 dark:bg-warning-500/15 dark:border-warning-500/30',
      info: 'bg-blue-light-50 border-blue-light-200 dark:bg-blue-light-500/15 dark:border-blue-light-500/30',
    };
    return classes[this.toast.type] || classes.info;
  }

  getTitleClasses(): string {
    const classes = {
      success: 'text-success-700 dark:text-success-400',
      error: 'text-error-700 dark:text-error-400',
      warning: 'text-warning-700 dark:text-warning-400',
      info: 'text-blue-light-700 dark:text-blue-light-400',
    };
    return classes[this.toast.type] || classes.info;
  }

  getMessageClasses(): string {
    const classes = {
      success: 'text-success-600 dark:text-success-300',
      error: 'text-error-600 dark:text-error-300',
      warning: 'text-warning-600 dark:text-warning-300',
      info: 'text-blue-light-600 dark:text-blue-light-300',
    };
    return classes[this.toast.type] || classes.info;
  }

  getActionButtonClasses(): string {
    const classes = {
      success: 'bg-success-500 hover:bg-success-600 text-white dark:bg-success-600 dark:hover:bg-success-700',
      error: 'bg-error-500 hover:bg-error-600 text-white dark:bg-error-600 dark:hover:bg-error-700',
      warning: 'bg-warning-500 hover:bg-warning-600 text-white dark:bg-warning-600 dark:hover:bg-warning-700',
      info: 'bg-blue-light-500 hover:bg-blue-light-600 text-white dark:bg-blue-light-600 dark:hover:bg-blue-light-700',
    };
    return classes[this.toast.type] || classes.info;
  }

  getDefaultTitle(): string {
    const titles = {
      success: 'Success!',
      error: 'Whoops! Something went wrong',
      warning: 'Warning',
      info: 'Information',
    };
    return titles[this.toast.type] || titles.info;
  }

  getActionIcon(): string {
    // Close icon SVG
    return `<svg class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
    </svg>`;
  }

  onDismiss(): void {
    this.dismiss.emit(this.toast.id);
  }
}
