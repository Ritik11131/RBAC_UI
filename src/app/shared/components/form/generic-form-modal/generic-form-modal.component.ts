import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ModalComponent } from '../../ui/modal/modal.component';
import { LabelComponent } from '../label/label.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { SpinnerComponent } from '../../common/spinner/spinner.component';
import { PaginatedSelectComponent } from '../paginated-select/paginated-select.component';
import { PermissionsSelectorComponent } from '../permissions-selector/permissions-selector.component';
import { PhoneInputComponent } from '../group-input/phone-input/phone-input.component';
import { FormFieldConfig, GenericFormConfig, PaginatedSelectConfig } from '../../../../core/interfaces/form-config.interface';

@Component({
  selector: 'app-generic-form-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    LabelComponent,
    ButtonComponent,
    SpinnerComponent,
    PaginatedSelectComponent,
    PermissionsSelectorComponent,
    PhoneInputComponent,
  ],
  template: `
    <app-modal
      [isOpen]="isOpen"
      (close)="onClose()"
      [widthClass]="config.modalWidth || 'w-full sm:w-[500px] md:w-[600px] lg:w-[700px]'"
    >
      <form [formGroup]="form" class="flex h-full flex-col" (ngSubmit)="onSubmit()">
        <!-- Form Header -->
        <div class="shrink-0 border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
            {{ config.title }}
          </h3>
          @if (config.subtitle) {
            <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              {{ config.subtitle }}
            </p>
          }
        </div>

        <!-- Form Content - Scrollable -->
        <div class="flex-1 overflow-y-auto px-6 py-6">
          @if (isFormLoading) {
            <app-spinner size="md" [showText]="true" [text]="isLoading ? 'Loading data...' : 'Submitting...'" />
          } @else {
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-12">
              @for (field of visibleFields; track field.key) {
                <div [class]="fieldGridClasses.get(field.key) || 'sm:col-span-12'">
                  <app-label>
                    {{ field.label }}
                    @if (field.required) {
                      <span class="text-error-500">*</span>
                    }
                  </app-label>
                  
                  @switch (field.type) {
                    @case ('textarea') {
                      <textarea
                        [formControlName]="field.key"
                        [placeholder]="field.placeholder"
                        rows="3"
                        class="w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        [ngClass]="{
                          'border-error-500': fieldErrors.get(field.key),
                          'border-gray-300': !fieldErrors.get(field.key)
                        }"
                      ></textarea>
                      @if (field.hint && !fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{{ field.hint }}</p>
                      }
                      @if (fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-error-500">{{ fieldErrors.get(field.key) }}</p>
                      }
                    }
                    @case ('select') {
                      <div class="relative">
                        <!-- Selected Value Display Button -->
                        <button
                          type="button"
                          (click)="toggleSelectDropdown(field.key)"
                          [disabled]="field.disabled || isFormLoading"
                          class="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 flex items-center justify-between"
                          [ngClass]="{
                            'border-error-500': fieldErrors.get(field.key),
                            'border-gray-300': !fieldErrors.get(field.key),
                            'opacity-50 cursor-not-allowed': field.disabled || isFormLoading
                          }"
                        >
                          <span [ngClass]="{'text-gray-400': !getSelectedOptionLabel(field)}">
                            {{ getSelectedOptionLabel(field) || field.placeholder || 'Select an option' }}
                          </span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="stroke-current transition-transform flex-shrink-0"
                            [ngClass]="{'rotate-180': openSelectDropdowns.has(field.key)}"
                          >
                            <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </button>

                        <!-- Dropdown Menu -->
                        @if (openSelectDropdowns.has(field.key)) {
                          <div class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                            <!-- Options List -->
                            <div class="flex-1 overflow-y-auto">
                              @if (field.options && field.options.length > 0) {
                                @for (option of field.options; track option.value) {
                                  <button
                                    type="button"
                                    (click)="selectOption(field.key, option.value)"
                                    [disabled]="option.disabled"
                                    class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    [ngClass]="{
                                      'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400': form.get(field.key)?.value === option.value,
                                      'text-gray-700 dark:text-gray-300': form.get(field.key)?.value !== option.value,
                                      'opacity-50 cursor-not-allowed': option.disabled
                                    }"
                                  >
                                    {{ option.label }}
                                  </button>
                                }
                              } @else {
                                <div class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                  No options available
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                      @if (field.hint && !fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{{ field.hint }}</p>
                      }
                      @if (fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-error-500">{{ fieldErrors.get(field.key) }}</p>
                      }
                    }
                    @case ('paginated-select') {
                      <app-paginated-select
                        [config]="getPaginatedSelectConfig(field)"
                        [value]="form.get(field.key)?.value"
                        [disabled]="field.disabled || isFormLoading"
                        [error]="!!fieldErrors.get(field.key)"
                        [placeholder]="field.placeholder || 'Select an option'"
                        (valueChange)="onPaginatedSelectChange(field.key, $event)"
                        (createClick)="onPaginatedSelectCreate(field)"
                      />
                      @if (field.hint && !fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{{ field.hint }}</p>
                      }
                      @if (fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-error-500">{{ fieldErrors.get(field.key) }}</p>
                      }
                    }
                    @case ('checkbox') {
                      <div class="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          [formControlName]="field.key"
                          [id]="field.key"
                          class="w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60"
                        />
                        @if (field.label) {
                          <label [for]="field.key" class="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                            {{ field.label }}
                          </label>
                        }
                      </div>
                      @if (field.hint) {
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{{ field.hint }}</p>
                      }
                    }
                    @case ('permissions') {
                      <app-permissions-selector
                        [modules]="field.permissionsConfig?.modules || []"
                        [formControlName]="field.key"
                      />
                      @if (field.hint && !fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{{ field.hint }}</p>
                      }
                      @if (fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-error-500">{{ fieldErrors.get(field.key) }}</p>
                      }
                    }
                    @case ('tel') {
                      <app-phone-input
                        [formControlName]="field.key"
                        [placeholder]="field.placeholder || 'Enter phone number'"
                        [selectPosition]="'start'"
                        [defaultCountry]="'IN'"
                        [error]="!!fieldErrors.get(field.key)"
                      />
                      @if (field.hint && !fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{{ field.hint }}</p>
                      }
                      @if (fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-error-500">{{ fieldErrors.get(field.key) }}</p>
                      }
                    }
                    @default {
                      <input
                        [type]="field.type"
                        [formControlName]="field.key"
                        [placeholder]="field.placeholder"
                        [id]="field.key"
                        class="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        [ngClass]="{
                          'border-error-500 focus:border-error-300 focus:ring-error-500/20': fieldErrors.get(field.key),
                          'border-gray-300 focus:border-brand-300 focus:ring-brand-500/20': !fieldErrors.get(field.key)
                        }"
                      />
                      @if (field.hint && !fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{{ field.hint }}</p>
                      }
                      @if (fieldErrors.get(field.key)) {
                        <p class="mt-1.5 text-xs text-error-500">{{ fieldErrors.get(field.key) }}</p>
                      }
                    }
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Fixed Action Buttons -->
        <div class="shrink-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-end gap-3">
            <app-button 
              size="sm" 
              variant="outline" 
              (btnClick)="onClose()"
              [disabled]="isFormLoading"
            >
              {{ config.cancelLabel || 'Cancel' }}
            </app-button>
            <app-button 
              size="sm" 
              type="submit"
              [disabled]="form.invalid || isFormLoading"
            >
              @if (_isSubmitting) {
                <span class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              } @else {
                {{ config.submitLabel || 'Save' }}
              }
            </app-button>
          </div>
        </div>
      </form>
    </app-modal>
  `,
  styles: ``
})
export class GenericFormModalComponent<T = any> implements OnInit, OnDestroy, OnChanges {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Input() isOpen: boolean = false;
  @Input() config!: GenericFormConfig<T>;
  @Input() isLoading: boolean = false; // External loading state (e.g., for edit data fetching)
  
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  form!: FormGroup;
  _isSubmitting = false; // Internal loading state for form submission (public for template access)
  sortedFields: FormFieldConfig[] = [];
  
  // Optimized: Pre-computed properties to avoid function calls in template
  visibleFields: FormFieldConfig[] = [];
  fieldErrors = new Map<string, string | undefined>();
  fieldGridClasses = new Map<string, string>();
  
  // Track open select dropdowns
  openSelectDropdowns = new Set<string>();

  get isFormLoading(): boolean {
    // Show loading if external loading (edit data) or internal submitting
    return this.isLoading || this._isSubmitting;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoading']) {
      this.updateFormDisabledState();
    }
    if (changes['config'] && this.config) {
      if (!changes['config'].firstChange) {
        // If form already exists and only initialData changed, patch values instead of rebuilding
        if (this.form && changes['config'].previousValue && 
            JSON.stringify(changes['config'].previousValue.initialData) !== JSON.stringify(this.config.initialData)) {
          this.patchFormValues();
        } else {
          this.buildForm();
        }
      } else {
        this.buildForm();
      }
    }
    if (changes['isOpen'] && changes['isOpen'].currentValue && this.config) {
      // Rebuild form when modal opens to ensure fresh state
      // But skip if config was just changed (to avoid double build when opening modal after setting initialData)
      const configJustChanged = changes['config'] && !changes['config'].firstChange;
      if (!configJustChanged || !this.form) {
        this.buildForm();
      }
    }
  }

  ngOnInit(): void {
    if (this.config) {
      this.buildForm();
    }
  }

  /**
   * Patch form values when initialData changes (without rebuilding form)
   */
  private patchFormValues(): void {
    if (this.form && this.config.initialData) {
      this.form.patchValue(this.config.initialData);
      this.updateFieldProperties();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Build the reactive form based on field configuration
   */
  private buildForm(): void {
    const formControls: { [key: string]: any } = {};

    // Sort fields by order
    this.sortedFields = [...this.config.fields].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Pre-compute field properties for optimization
    this.fieldGridClasses.clear();
    this.fieldErrors.clear();

    // Build form controls and pre-compute properties
    this.sortedFields.forEach(field => {
      const validators = [];
      
      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.validators) {
        validators.push(...field.validators);
      }

      // Get initial value
      let initialValue = field.defaultValue ?? null;
      
      // If in update mode and initialData provided, use that
      if (this.config.mode === 'update' && this.config.initialData) {
        initialValue = this.config.initialData[field.key as keyof T] ?? initialValue;
      }

      formControls[field.key] = [
        { value: initialValue, disabled: field.disabled || false },
        validators
      ];

      // Pre-compute grid class - use explicit mapping to ensure Tailwind includes the classes
      const cols = field.gridCols || 12;
      const gridClassMap: { [key: number]: string } = {
        1: 'sm:col-span-1',
        2: 'sm:col-span-2',
        3: 'sm:col-span-3',
        4: 'sm:col-span-4',
        5: 'sm:col-span-5',
        6: 'sm:col-span-6',
        7: 'sm:col-span-7',
        8: 'sm:col-span-8',
        9: 'sm:col-span-9',
        10: 'sm:col-span-10',
        11: 'sm:col-span-11',
        12: 'sm:col-span-12',
      };
      this.fieldGridClasses.set(field.key, gridClassMap[cols] || 'sm:col-span-12');
    });

    this.form = this.fb.group(formControls);
    
    // Update visible fields and errors
    this.updateFieldProperties();
    
    // Update disabled state based on current loading state
    this.updateFormDisabledState();
    
    // Subscribe to form value changes for conditional fields and error updates
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateFieldProperties();
    });
    
    // Subscribe to form status changes for error updates
    this.form.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateFieldProperties();
    });
  }

  /**
   * Update form controls disabled state based on field.disabled and isLoading
   */
  private updateFormDisabledState(): void {
    if (!this.form) {
      return;
    }

    this.sortedFields.forEach(field => {
      const control = this.form.get(field.key);
      if (!control) {
        return;
      }

      const shouldBeDisabled = field.disabled || this.isFormLoading;
      
      if (shouldBeDisabled && control.enabled) {
        control.disable({ emitEvent: false });
      } else if (!shouldBeDisabled && control.disabled && !field.disabled) {
        // Only enable if field itself is not disabled
        control.enable({ emitEvent: false });
      }
    });
    
    // Note: For ControlValueAccessor components (like permissions-selector),
    // Angular automatically calls setDisabledState() when FormControl disabled state changes
  }

  /**
   * Update field properties (visibility, errors) - optimized to avoid function calls in template
   */
  private updateFieldProperties(): void {
    // Update visible fields based on conditional logic
    this.visibleFields = this.sortedFields.filter(field => {
      if (!field.conditional) {
        return true;
      }
      const dependentValue = this.form.get(field.conditional.dependsOn)?.value;
      return field.conditional.condition(dependentValue);
    });

    // Update field errors
    this.sortedFields.forEach(field => {
      const control = this.form.get(field.key);
      if (!control || !control.errors || !control.touched) {
        this.fieldErrors.set(field.key, undefined);
        return;
      }

      let errorMessage: string | undefined = undefined;

      if (control.hasError('required')) {
        errorMessage = `${this.getFieldLabel(field.key)} is required`;
      } else if (control.hasError('email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (control.hasError('minlength')) {
        const minLength = control.errors['minlength'].requiredLength;
        errorMessage = `Minimum length is ${minLength} characters`;
      } else if (control.hasError('maxlength')) {
        const maxLength = control.errors['maxlength'].requiredLength;
        errorMessage = `Maximum length is ${maxLength} characters`;
      } else {
        // Check for custom error message in field config
        const fieldConfig = this.config.fields.find(f => f.key === field.key);
        if (fieldConfig?.errorMessage) {
          errorMessage = fieldConfig.errorMessage;
        } else {
          errorMessage = 'Invalid value';
        }
      }

      this.fieldErrors.set(field.key, errorMessage);
    });
    
    this.cdr.markForCheck();
  }


  /**
   * Get field label by key
   */
  private getFieldLabel(key: string): string {
    const field = this.config.fields.find(f => f.key === key);
    return field?.label || key;
  }

  /**
   * Get paginated select config for field
   */
  getPaginatedSelectConfig(field: FormFieldConfig): any {
    if (!field.paginatedSelectConfig) {
      return {
        loadOptions: async () => ({ options: [], hasMore: false }),
      };
    }
    return field.paginatedSelectConfig;
  }

  /**
   * Handle paginated select value change
   */
  onPaginatedSelectChange(fieldKey: string, value: string | number): void {
    const control = this.form.get(fieldKey);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
      this.updateFieldProperties();
    }
  }

  /**
   * Handle paginated select create click
   */
  onPaginatedSelectCreate(field: FormFieldConfig): void {
    if (field.paginatedSelectConfig?.onCreateClick) {
      field.paginatedSelectConfig.onCreateClick();
    }
  }

  /**
   * Toggle select dropdown
   */
  toggleSelectDropdown(fieldKey: string): void {
    if (this.openSelectDropdowns.has(fieldKey)) {
      this.openSelectDropdowns.delete(fieldKey);
    } else {
      // Close all other dropdowns first
      this.openSelectDropdowns.clear();
      this.openSelectDropdowns.add(fieldKey);
    }
    this.cdr.markForCheck();
  }

  /**
   * Select an option from dropdown
   */
  selectOption(fieldKey: string, value: string | number): void {
    const control = this.form.get(fieldKey);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
      this.openSelectDropdowns.delete(fieldKey);
      this.updateFieldProperties();
      this.cdr.markForCheck();
    }
  }

  /**
   * Get selected option label
   */
  getSelectedOptionLabel(field: FormFieldConfig): string | null {
    const value = this.form.get(field.key)?.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const option = field.options?.find(opt => opt.value === value);
    return option?.label || null;
  }

  /**
   * Close dropdowns when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Check if click is outside any select dropdown button or menu
    const clickedInsideDropdown = target.closest('.relative') && 
                                  (target.closest('button[type="button"]') || target.closest('.absolute.z-50'));
    if (!clickedInsideDropdown && this.openSelectDropdowns.size > 0) {
      this.openSelectDropdowns.clear();
      this.cdr.markForCheck();
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      this.updateFieldProperties(); // Update errors after marking as touched
      return;
    }

    this._isSubmitting = true;
    const formValue = this.form.getRawValue();

    // Call the submit handler
    this.config.onSubmit(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this._isSubmitting = false;
          this.success.emit(response);
          if (this.config.onSuccess) {
            this.config.onSuccess(response);
          }
          this.onClose();
        },
        error: (error) => {
          this._isSubmitting = false;
          this.error.emit(error);
          if (this.config.onError) {
            this.config.onError(error);
          } else {
            console.error('Form submission error:', error);
          }
        }
      });
  }

  /**
   * Handle modal close
   */
  onClose(): void {
    if (!this.isLoading) {
      this.form.reset();
      this.close.emit();
    }
  }
}

