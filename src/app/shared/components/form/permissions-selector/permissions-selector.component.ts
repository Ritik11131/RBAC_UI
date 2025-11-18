import { Component, Input, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '../input/checkbox.component';
import { Module } from '../../../../core/interfaces/module.interface';
import { Permission } from '../../../../core/interfaces/role.interface';

@Component({
  selector: 'app-permissions-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CheckboxComponent],
  template: `
    <div class="space-y-4">
      @if (modules && modules.length > 0) {
        @for (module of modules; track module.id) {
          <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div class="mb-3">
              <h4 class="text-sm font-semibold text-gray-800 dark:text-white/90">{{ module.name }}</h4>
            </div>
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <app-checkbox
                  [checked]="getPermissionValue(module.id, 'read')"
                  (checkedChange)="onPermissionChange(module.id, 'read', $event)"
                  [disabled]="disabled"
                  className="w-4 h-4 rounded"
                />
                <label 
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  [class.cursor-not-allowed]="disabled"
                  [class.opacity-50]="disabled"
                  (click)="togglePermission(module.id, 'read')"
                >
                  Read
                </label>
              </div>
              <div class="flex items-center gap-2">
                <app-checkbox
                  [checked]="getPermissionValue(module.id, 'write')"
                  (checkedChange)="onPermissionChange(module.id, 'write', $event)"
                  [disabled]="disabled"
                  className="w-4 h-4 rounded"
                />
                <label 
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  [class.cursor-not-allowed]="disabled"
                  [class.opacity-50]="disabled"
                  (click)="togglePermission(module.id, 'write')"
                >
                  Write
                </label>
              </div>
            </div>
          </div>
        }
      } @else {
        <p class="text-sm text-gray-500 dark:text-gray-400">No modules available</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionsSelectorComponent),
      multi: true,
    },
  ],
})
export class PermissionsSelectorComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() modules: Module[] = [];

  private permissions: Permission[] = [];
  private _disabled: boolean = false;
  private onChange: ((value: Permission[]) => void) | null = null;
  private onTouched: (() => void) | null = null;
  private isInitialized = false;

  // Getter for template access
  get disabled(): boolean {
    return this._disabled;
  }

  ngOnInit(): void {
    // Don't initialize permissions here - wait for writeValue or modules to be set
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modules'] && this.modules && this.modules.length > 0) {
      // Only initialize if we have modules and onChange is registered
      if (this.onChange && !this.isInitialized) {
        this.initializePermissions();
      }
    }
  }

  /**
   * Initialize permissions array from modules
   */
  private initializePermissions(): void {
    if (!this.modules || this.modules.length === 0) {
      this.permissions = [];
      this.isInitialized = true;
      return;
    }

    // Initialize permissions for all modules with read/write as false
    // If permissions already exist, preserve them
    const existingPermissions = new Map(
      this.permissions.map(p => [p.moduleId, p])
    );

    this.permissions = this.modules.map(module => {
      const existing = existingPermissions.get(module.id);
      return existing || {
        moduleId: module.id,
        name: module.name,
        read: false,
        write: false,
      };
    });

    this.isInitialized = true;
    // Only notify if onChange is registered
    if (this.onChange) {
      this.notifyChange();
    }
  }

  /**
   * Get permission value for a module and permission type
   */
  getPermissionValue(moduleId: string, type: 'read' | 'write'): boolean {
    const permission = this.permissions.find(p => p.moduleId === moduleId);
    if (!permission) return false;
    return type === 'read' ? permission.read : permission.write;
  }

  /**
   * Handle permission change
   */
  onPermissionChange(moduleId: string, type: 'read' | 'write', checked: boolean): void {
    if (this._disabled) return;

    const permission = this.permissions.find(p => p.moduleId === moduleId);
    if (permission) {
      permission[type] = checked;
    } else {
      // Create new permission if it doesn't exist
      const module = this.modules.find(m => m.id === moduleId);
      if (module) {
        this.permissions.push({
          moduleId: module.id,
          name: module.name,
          read: type === 'read' ? checked : false,
          write: type === 'write' ? checked : false,
        });
      }
    }

    this.notifyChange();
  }

  /**
   * Toggle permission when label is clicked
   */
  togglePermission(moduleId: string, type: 'read' | 'write'): void {
    if (this._disabled) return;
    const currentValue = this.getPermissionValue(moduleId, type);
    this.onPermissionChange(moduleId, type, !currentValue);
  }

  /**
   * Notify parent form of changes
   */
  private notifyChange(): void {
    // Only notify if onChange is registered (FormControl is attached)
    if (!this.onChange) {
      return;
    }
    
    // Filter out permissions where both read and write are false
    const activePermissions = this.permissions.filter(p => p.read || p.write);
    this.onChange(activePermissions);
  }

  // ControlValueAccessor implementation
  writeValue(value: Permission[]): void {
    if (value && Array.isArray(value)) {
      // Update permissions with provided values
      const valueMap = new Map(value.map(p => [p.moduleId, p]));
      this.permissions = this.modules.map(module => {
        const provided = valueMap.get(module.id);
        return provided || {
          moduleId: module.id,
          name: module.name,
          read: false,
          write: false,
        };
      });
    } else if (this.modules && this.modules.length > 0) {
      // Initialize with empty permissions if no value provided
      this.permissions = this.modules.map(module => ({
        moduleId: module.id,
        name: module.name,
        read: false,
        write: false,
      }));
    }
    
    // Mark as initialized after writeValue
    this.isInitialized = true;
  }

  registerOnChange(fn: (value: Permission[]) => void): void {
    this.onChange = fn;
    // If modules are already available, initialize permissions now
    if (this.modules && this.modules.length > 0 && !this.isInitialized) {
      this.initializePermissions();
    }
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }
}

