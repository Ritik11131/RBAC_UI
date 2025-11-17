import { FormFieldConfig } from '../../core/interfaces/form-config.interface';
import { Validators } from '@angular/forms';

/**
 * Create entity_id field configuration for profile forms
 */
export function createEntityIdField(
  loadOptions: (page: number, limit: number, search?: string) => Promise<{
    options: { value: string; label: string; disabled?: boolean }[];
    hasMore: boolean;
    total?: number;
  }>,
  onCreateClick: () => void
): FormFieldConfig {
  return {
    key: 'entity_id',
    label: 'Entity',
    type: 'paginated-select',
    placeholder: 'Select an entity',
    required: true,
    validators: [Validators.required],
    gridCols: 12,
    order: 1, // Always at the top
    hint: 'Select an existing entity or create a new one',
    paginatedSelectConfig: {
      loadOptions,
      searchPlaceholder: 'Search entities...',
      itemsPerPage: 10,
      showSearch: true,
      allowCreate: true,
      createLabel: 'Create New Entity',
      createValue: '__create_new__',
      onCreateClick,
    },
  };
}

/**
 * Create profile_id field configuration for entity forms
 */
export function createProfileIdField(
  loadOptions: (page: number, limit: number, search?: string) => Promise<{
    options: { value: string; label: string; disabled?: boolean }[];
    hasMore: boolean;
    total?: number;
  }>,
  onCreateClick: () => void
): FormFieldConfig {
  return {
    key: 'profile_id',
    label: 'Profile',
    type: 'paginated-select',
    placeholder: 'Select a profile',
    required: true,
    validators: [Validators.required],
    gridCols: 12,
    order: 1, // Always at the top
    hint: 'Select an existing profile or create a new one',
    paginatedSelectConfig: {
      loadOptions,
      searchPlaceholder: 'Search profiles...',
      itemsPerPage: 10,
      showSearch: true,
      allowCreate: true,
      createLabel: 'Create New Profile',
      createValue: '__create_new__',
      onCreateClick,
    },
  };
}

/**
 * Create role_id field configuration for user forms
 */
export function createRoleIdField(
  loadOptions: (page: number, limit: number, search?: string) => Promise<{
    options: { value: string; label: string; disabled?: boolean }[];
    hasMore: boolean;
    total?: number;
  }>,
  onCreateClick?: () => void
): FormFieldConfig {
  return {
    key: 'role_id',
    label: 'Role',
    type: 'paginated-select',
    placeholder: 'Select a role',
    required: true,
    validators: [Validators.required],
    gridCols: 12,
    order: 1, // Always at the top (same as entity_id and profile_id)
    hint: 'Select an existing role or create a new one',
    paginatedSelectConfig: {
      loadOptions,
      searchPlaceholder: 'Search roles...',
      itemsPerPage: 10,
      showSearch: true,
      allowCreate: onCreateClick ? true : false,
      createLabel: 'Create New Role',
      createValue: '__create_new__',
      onCreateClick: onCreateClick || (() => {}),
    },
  };
}

