import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button.component';
import { Toast } from '../../../../core/interfaces/toast.interface';

@Component({
  selector: 'app-toast-confirmation',
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (toast) {
      <div class="fixed inset-0 z-99999 flex items-center justify-center overflow-hidden">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 h-full w-full bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
          (click)="onBackdropClick()"
        ></div>
        
        <!-- OPTION 1: Centered Icon Design -->
        @if (designOption === 1) {
          <div
            class="relative flex flex-col transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-2xl rounded-lg w-full max-w-md mx-4 animate-fade-in-scale"
            (click)="$event.stopPropagation()"
            role="alertdialog"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-message"
          >
            <!-- Centered Icon -->
            <div class="flex justify-center pt-8 pb-4">
              <div class="w-16 h-16 rounded-full bg-error-100 dark:bg-error-500/20 flex items-center justify-center">
                <svg class="w-8 h-8 text-error-600 dark:text-error-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"/>
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 pb-6 text-center">
              <h3 id="confirmation-title" class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ toast.title || 'Delete Confirmation' }}
              </h3>
              <p id="confirmation-message" class="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {{ toast.message }}
              </p>

              <!-- Actions -->
              <div class="flex items-center justify-center gap-3">
                <app-button
                  size="sm"
                  variant="outline"
                  (btnClick)="onCancel()"
                >
                  {{ toast.cancelLabel || 'Cancel' }}
                </app-button>
                <app-button
                  size="sm"
                  variant="primary"
                  className="bg-error-500 hover:bg-error-600 text-white dark:bg-error-600 dark:hover:bg-error-700"
                  (btnClick)="onConfirm()"
                  [startIcon]="deleteIcon"
                >
                  {{ toast.confirmLabel || 'Delete' }}
                </app-button>
              </div>
            </div>
          </div>
        }

        <!-- OPTION 2: Top Border Accent -->
        @if (designOption === 2) {
          <div
            class="relative flex flex-col transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-2xl rounded-lg w-full max-w-md mx-4 border-t-4 border-error-500 animate-fade-in-scale"
            (click)="$event.stopPropagation()"
            role="alertdialog"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-message"
          >
            <div class="p-6">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-error-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"/>
                  </svg>
                </div>
                <div class="ml-4 flex-1">
                  <h3 id="confirmation-title" class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {{ toast.title || 'Delete Confirmation' }}
                  </h3>
                  <p id="confirmation-message" class="text-sm text-gray-600 dark:text-gray-300">
                    {{ toast.message }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex items-center justify-end gap-3">
                <app-button
                  size="sm"
                  variant="outline"
                  (btnClick)="onCancel()"
                >
                  {{ toast.cancelLabel || 'Cancel' }}
                </app-button>
                <app-button
                  size="sm"
                  variant="primary"
                  className="bg-error-500 hover:bg-error-600 text-white dark:bg-error-600 dark:hover:bg-error-700"
                  (btnClick)="onConfirm()"
                  [startIcon]="deleteIcon"
                >
                  {{ toast.confirmLabel || 'Delete' }}
                </app-button>
              </div>
            </div>
          </div>
        }

        <!-- OPTION 3: Minimal Design -->
        @if (designOption === 3) {
          <div
            class="relative flex flex-col transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-xl rounded-lg w-full max-w-md mx-4 animate-fade-in-scale"
            (click)="$event.stopPropagation()"
            role="alertdialog"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-message"
          >
            <div class="p-5">
              <h3 id="confirmation-title" class="text-base font-medium text-gray-900 dark:text-white mb-2">
                {{ toast.title || 'Delete Confirmation' }}
              </h3>
              <p id="confirmation-message" class="text-sm text-gray-500 dark:text-gray-400 mb-5">
                {{ toast.message }}
              </p>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-2">
                <app-button
                  size="sm"
                  variant="outline"
                  (btnClick)="onCancel()"
                >
                  {{ toast.cancelLabel || 'Cancel' }}
                </app-button>
                <app-button
                  size="sm"
                  variant="primary"
                  className="bg-error-500 hover:bg-error-600 text-white dark:bg-error-600 dark:hover:bg-error-700"
                  (btnClick)="onConfirm()"
                  [startIcon]="deleteIcon"
                >
                  {{ toast.confirmLabel || 'Delete' }}
                </app-button>
              </div>
            </div>
          </div>
        }

        <!-- OPTION 4: Card with Colored Header -->
        @if (designOption === 4) {
          <div
            class="relative flex flex-col transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-2xl rounded-lg w-full max-w-md mx-4 overflow-hidden animate-fade-in-scale"
            (click)="$event.stopPropagation()"
            role="alertdialog"
            aria-labelledby="confirmation-title"
            aria-describedby="confirmation-message"
          >
            <!-- Colored Header -->
            <div class="bg-error-500 px-6 py-4 flex items-center gap-3">
              <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"/>
              </svg>
              <h3 id="confirmation-title" class="text-lg font-semibold text-white">
                {{ toast.title || 'Delete Confirmation' }}
              </h3>
            </div>

            <!-- Content -->
            <div class="p-6">
              <p id="confirmation-message" class="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {{ toast.message }}
              </p>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3">
                <app-button
                  size="sm"
                  variant="outline"
                  (btnClick)="onCancel()"
                >
                  {{ toast.cancelLabel || 'Cancel' }}
                </app-button>
                <app-button
                  size="sm"
                  variant="primary"
                  className="bg-error-500 hover:bg-error-600 text-white dark:bg-error-600 dark:hover:bg-error-700"
                  (btnClick)="onConfirm()"
                  [startIcon]="deleteIcon"
                >
                  {{ toast.confirmLabel || 'Delete' }}
                </app-button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: ``
})
export class ToastConfirmationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() toast!: Toast | null;
  @Input() designOption: 1 | 2 | 3 | 4 = 2; // Default to Option 2
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<string>();

  // Computed property for delete icon - static, no need to recompute
  readonly deleteIcon = `<svg class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m-4 5v6m-4-6v6m8-6v6M10 11h4"/>
  </svg>`;

  ngOnInit(): void {
    if (this.toast) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['toast']) {
      document.body.style.overflow = this.toast ? 'hidden' : 'unset';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'unset';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.toast) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    if (this.toast?.onConfirm) {
      this.toast.onConfirm();
    }
    this.confirm.emit();
    this.dismiss.emit(this.toast?.id || '');
  }

  onCancel(): void {
    if (this.toast?.onCancel) {
      this.toast.onCancel();
    }
    this.cancel.emit();
    this.dismiss.emit(this.toast?.id || '');
  }

  onBackdropClick(): void {
    // Allow closing by clicking backdrop
    this.onCancel();
  }
}

