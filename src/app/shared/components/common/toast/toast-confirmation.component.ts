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
        
        <!-- Modal Content - Centered -->
        <div
          class="relative flex flex-col transform transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 shadow-2xl rounded-lg w-full max-w-md mx-4 animate-fade-in-scale"
          (click)="$event.stopPropagation()"
          role="alert"
        >
          <div class="p-6">
            <!-- Icon and Title -->
            <div class="flex items-center mb-4">
              <div class="inline-flex items-center justify-center shrink-0 w-10 h-10 text-warning-500 bg-warning-50 rounded-lg mr-3 dark:bg-warning-500/15 dark:text-warning-400">
                <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"/>
                </svg>
                <span class="sr-only">Warning icon</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ toast.title || 'Confirm Action' }}
              </h3>
            </div>

            <!-- Message -->
            <div class="mb-6 text-sm text-gray-600 dark:text-gray-300">
              {{ toast.message }}
            </div>

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
              >
                {{ toast.confirmLabel || 'Confirm' }}
              </app-button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class ToastConfirmationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() toast!: Toast | null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<string>();

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

