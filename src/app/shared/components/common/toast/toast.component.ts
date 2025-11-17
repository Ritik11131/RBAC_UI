import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastType } from '../../../../core/interfaces/toast.interface';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    <div
      [id]="toast.id"
      class="flex items-center w-full max-w-md p-4 mb-4 text-sm bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 animate-slide-up"
      [ngClass]="getToastClasses()"
      role="alert"
    >
      <div [ngClass]="getIconClasses()" class="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg">
        @if (toast.type === 'success') {
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
          </svg>
          <span class="sr-only">Check icon</span>
        }
        @if (toast.type === 'error') {
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
          </svg>
          <span class="sr-only">Error icon</span>
        }
        @if (toast.type === 'warning') {
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"/>
          </svg>
          <span class="sr-only">Warning icon</span>
        }
        @if (toast.type === 'info') {
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <span class="sr-only">Info icon</span>
        }
      </div>

      <div class="ms-3 text-sm font-normal flex-1">
        @if (toast.title) {
          <div class="font-semibold mb-1 text-gray-900 dark:text-white">{{ toast.title }}</div>
        }
        <div class="text-gray-600 dark:text-gray-300">{{ toast.message }}</div>
      </div>

      @if (toast.dismissible) {
        <button
          type="button"
          class="ms-auto -mx-1.5 -my-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 p-1.5 transition-colors"
          (click)="onDismiss()"
          aria-label="Close"
        >
          <span class="sr-only">Close</span>
          <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
          </svg>
        </button>
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
    const baseClasses = 'text-gray-800 dark:text-gray-200';
    const typeClasses = {
      success: 'text-success-500 dark:text-success-400',
      error: 'text-error-500 dark:text-error-400',
      warning: 'text-warning-500 dark:text-warning-400',
      info: 'text-blue-light-500 dark:text-blue-light-400',
    };
    return `${baseClasses} ${typeClasses[this.toast.type] || ''}`;
  }

  getIconClasses(): string {
    const classes = {
      success: 'text-success-500 bg-success-50 dark:bg-success-500/15 dark:text-success-400',
      error: 'text-error-500 bg-error-50 dark:bg-error-500/15 dark:text-error-400',
      warning: 'text-warning-500 bg-warning-50 dark:bg-warning-500/15 dark:text-warning-400',
      info: 'text-blue-light-500 bg-blue-light-50 dark:bg-blue-light-500/15 dark:text-blue-light-400',
    };
    return classes[this.toast.type] || classes.info;
  }

  onDismiss(): void {
    this.dismiss.emit(this.toast.id);
  }
}

