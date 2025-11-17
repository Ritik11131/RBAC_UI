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
            <!-- Danger Toast Style -->
            <div class="w-full p-4 text-sm rounded-lg border border-error-200 bg-error-50 dark:bg-error-500/15 dark:border-error-500/30">
              <h3 class="font-semibold text-error-700 dark:text-error-400 mb-2">
                {{ toast.title || 'Delete Confirmation' }}
              </h3>
              
              <div class="mt-2 mb-4 text-error-600 dark:text-error-300">
                {{ toast.message }}
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-3">
                <app-button
                  size="xs"
                  variant="primary"
                  className="bg-error-500 hover:bg-error-600 text-white dark:bg-error-600 dark:hover:bg-error-700"
                  (btnClick)="onConfirm()"
                  [startIcon]="getDeleteIcon()"
                >
                  {{ toast.confirmLabel || 'Delete' }}
                </app-button>
                <app-button
                  size="xs"
                  variant="outline"
                  className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-500/50 dark:hover:bg-error-500/10"
                  (btnClick)="onCancel()"
                >
                  {{ toast.cancelLabel || 'Cancel' }}
                </app-button>
              </div>
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

  getDeleteIcon(): string {
    // Delete/Trash icon SVG
    return `<svg class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m-4 5v6m-4-6v6m8-6v6M10 11h4"/>
    </svg>`;
  }
}

