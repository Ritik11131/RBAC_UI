import { ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

/**
 * Form field types supported by the generic form
 */
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'date' 
  | 'time';

/**
 * Select option interface
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  key: string; // Field key (must match API field name)
  label: string; // Field label
  type: FormFieldType; // Field type
  placeholder?: string; // Placeholder text
  required?: boolean; // Is field required
  disabled?: boolean; // Is field disabled
  defaultValue?: any; // Default value
  validators?: ValidatorFn[]; // Custom validators
  options?: SelectOption[]; // Options for select/radio fields
  hint?: string; // Help text
  errorMessage?: string; // Custom error message
  gridCols?: number; // Grid columns (1-12, default: 12)
  order?: number; // Display order
  conditional?: {
    // Conditional field visibility
    dependsOn: string; // Field key this depends on
    condition: (value: any) => boolean; // Condition function
  };
}

/**
 * Generic form configuration
 */
export interface GenericFormConfig<T = any> {
  title: string; // Form title
  subtitle?: string; // Form subtitle
  fields: FormFieldConfig[]; // Form fields configuration
  submitLabel?: string; // Submit button label (default: 'Save')
  cancelLabel?: string; // Cancel button label (default: 'Cancel')
  mode?: 'create' | 'update'; // Form mode
  initialData?: Partial<T>; // Initial data for update mode
  modalWidth?: string; // Tailwind width classes for modal (e.g., 'w-full sm:w-[500px] md:w-[600px] lg:w-[700px]')
  onSubmit: (data: Partial<T>) => Observable<any>; // Submit handler
  onSuccess?: (response: any) => void; // Success callback
  onError?: (error: any) => void; // Error callback
}

