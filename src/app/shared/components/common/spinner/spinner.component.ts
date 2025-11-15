import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [ngClass]="containerClass">
      <div class="relative" [ngClass]="sizeClass">
        <div class="absolute inset-0 border-4 border-gray-200 rounded-full dark:border-gray-700"></div>
        <div 
          class="absolute inset-0 border-4 border-transparent border-t-brand-500 rounded-full animate-spin"
          [ngClass]="spinnerClass">
        </div>
      </div>
      @if (showText) {
        <p class="ml-3 text-sm text-gray-600 dark:text-gray-400">{{ text || 'Loading...' }}</p>
      }
    </div>
  `,
  styles: ``
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showText: boolean = false;
  @Input() text: string = 'Loading...';
  @Input() containerClass: string = 'py-12';

  get sizeClass(): string {
    const sizes = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    return sizes[this.size];
  }

  get spinnerClass(): string {
    const classes = {
      sm: 'border-t-2',
      md: 'border-t-4',
      lg: 'border-t-4'
    };
    return classes[this.size];
  }
}

