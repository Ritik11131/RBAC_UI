import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../services/toast.service';
import { Toast, ToastPosition } from '../../../../core/interfaces/toast.interface';
import { ToastComponent } from './toast.component';
import { ToastConfirmationComponent } from './toast-confirmation.component';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, ToastComponent, ToastConfirmationComponent],
  template: `
    <!-- Regular Toasts -->
    @for (position of positions; track position) {
      <div [ngClass]="getPositionClasses(position)" class="fixed z-99999 space-y-4">
        @for (toast of getToastsByPosition(position); track toast.id) {
          <app-toast
            [toast]="toast"
            (dismiss)="removeToast($event)"
          />
        }
      </div>
    }

    <!-- Centered Confirmation Toasts - Only show one at a time -->
    @if (getToastsByPosition('center').length > 0) {
      <app-toast-confirmation
        [toast]="getToastsByPosition('center')[0]"
        (confirm)="removeToast(getToastsByPosition('center')[0].id)"
        (cancel)="removeToast(getToastsByPosition('center')[0].id)"
        (dismiss)="removeToast($event)"
      />
    }
  `,
  styles: ``
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  toasts: Toast[] = [];
  positions: ToastPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'bottom-center'];

  ngOnInit(): void {
    this.toastService.getToasts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(toast => {
        this.addToast(toast);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private addToast(toast: Toast): void {
    this.toasts.push(toast);
    this.cdr.detectChanges();

    // Auto-dismiss if duration is set and > 0
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }

  getToastsByPosition(position: ToastPosition): Toast[] {
    return this.toasts.filter(t => t.position === position);
  }

  getPositionClasses(position: ToastPosition): string {
    const classes: Record<ToastPosition, string> = {
      'top-left': 'top-20 left-5',
      'top-right': 'top-20 right-5',
      'bottom-left': 'bottom-5 left-5',
      'bottom-right': 'bottom-5 right-5',
      'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2',
      'center': '', // Handled separately
    };
    return classes[position] || '';
  }
}

