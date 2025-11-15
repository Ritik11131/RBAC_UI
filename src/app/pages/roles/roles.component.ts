import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, Observable, firstValueFrom } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { GenericDataTableComponent, TableColumn, TableAction, TableConfig } from '../../shared/components/tables/generic-data-table/generic-data-table.component';
import { RolesService } from '../../core/services/roles.service';
import { EntitiesService } from '../../core/services/entities.service';
import { ModulesService } from '../../core/services/modules.service';
import { Role, RolePaginationParams, RolePayload, Permission } from '../../core/interfaces/role.interface';
import { Entity } from '../../core/interfaces/entity.interface';
import { Module } from '../../core/interfaces/module.interface';
import { formatDateMedium } from '../../shared/utils/date.util';
import { GenericFormModalComponent } from '../../shared/components/form/generic-form-modal/generic-form-modal.component';
import { FormFieldConfig, GenericFormConfig } from '../../core/interfaces/form-config.interface';
import { Validators } from '@angular/forms';
import { createEntityIdField } from '../../shared/utils/form-field-helpers';

@Component({
  selector: 'app-roles',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    GenericDataTableComponent,
    GenericFormModalComponent,
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit, OnDestroy {
  private rolesService = inject(RolesService);
  private entitiesService = inject(EntitiesService);
  private modulesService = inject(ModulesService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Component state
  rolesData: Role[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalRecords = 0;
  totalPages = 0;
  searchTerm = '';
  sortColumn: string | null = null;
  sortOrder: 'asc' | 'desc' | null = null;
  
  // Entity filter state (from table component)
  currentEntityFilter: { showAll: boolean; entityId: string | null } = { showAll: true, entityId: null };

  // Form modal state
  isFormModalOpen = false;
  formConfig!: GenericFormConfig<RolePayload>;
  currentEditRole: Role | null = null;
  isLoadingEditData = false;

  // Available modules and entities for form
  availableModules: Module[] = [];
  availableEntities: Entity[] = [];

  // Table column definitions
  columns: TableColumn<Role>[] = [
    {
      key: 'name',
      label: 'Role Name',
      sortable: true,
      searchable: true,
    },
    {
      key: 'entityId',
      label: 'Entity ID',
      sortable: true,
      searchable: true,
    },
    {
      key: 'permissions',
      label: 'Permissions',
      sortable: false,
      render: (item) => {
        const count = item.permissions?.length || 0;
        return `${count} permission${count !== 1 ? 's' : ''}`;
      },
    },
    {
      key: 'creation_time',
      label: 'Created At',
      sortable: true,
      render: (item) => item.creation_time ? formatDateMedium(item.creation_time) : 'N/A',
    },
    {
      key: 'last_update_on',
      label: 'Last Updated',
      sortable: true,
      render: (item) => item.last_update_on ? formatDateMedium(item.last_update_on) : 'N/A',
    },
  ];

  // Table configuration
  config: TableConfig = {
    title: 'Roles',
    subtitle: 'Manage and configure system roles. Create, edit, or delete roles to control access permissions.',
    showSearch: true,
    showPagination: true,
    showItemsPerPage: true,
    showSelectAll: true,
    showDownload: false,
    showCreateButton: true,
    createButtonLabel: 'Create Role',
    searchPlaceholder: 'Search roles...',
    itemsPerPageOptions: [10, 20, 50],
    defaultItemsPerPage: 10,
    emptyMessage: 'No roles found',
    enableSorting: true,
    enableSelection: true,
    useDropdownMenu: true,
    showEntityFilter: true,
    entityFilterDefault: 'all',
  };

  // Action buttons
  actions: TableAction<Role>[] = [
    {
      label: 'Edit',
      variant: 'default',
      icon: `<svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0911 3.53206C16.2124 2.65338 14.7878 2.65338 13.9091 3.53206L5.6074 11.8337C5.29899 12.1421 5.08687 12.5335 4.99684 12.9603L4.26177 16.445C4.20943 16.6931 4.28600 16.9508 4.46529 17.1301C4.64458 17.3094 4.90232 17.3859 5.15042 17.3336L8.63507 16.5985C9.06184 16.5085 9.45324 16.2964 9.76165 15.988L18.0633 7.68631C18.9420 6.80763 18.9420 5.38301 18.0633 4.50433L17.0911 3.53206ZM14.9697 4.59272C15.2626 4.29982 15.7375 4.29982 16.0304 4.59272L17.0027 5.56499C17.2956 5.85788 17.2956 6.33276 17.0027 6.62565L16.1043 7.52402L14.0714 5.49109L14.9697 4.59272ZM13.0107 6.55175L6.66806 12.8944C6.56526 12.9972 6.49455 13.1277 6.46454 13.2699L5.96704 15.6283L8.32547 15.1308C8.46772 15.1008 8.59819 15.0301 8.70099 14.9273L15.0436 8.58468L13.0107 6.55175Z" fill="currentColor"></path>
      </svg>`,
      action: (item) => {
        this.handleEdit(item);
      },
    },
    {
      label: 'Delete',
      variant: 'error',
      icon: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.54142 3.7915C6.54142 2.54886 7.54878 1.5415 8.79142 1.5415H11.2081C12.4507 1.5415 13.4581 2.54886 13.4581 3.7915V4.0415H15.6252H16.6660C17.0802 4.0415 17.4160 4.37729 17.4160 4.7915C17.4160 5.20572 17.0802 5.5415 16.6660 5.5415H16.3752V8.24638V13.2464V16.2082C16.3752 17.4508 15.3678 18.4582 14.1252 18.4582H5.87516C4.63252 18.4582 3.62516 17.4508 3.62516 16.2082V13.2464V8.24638V5.5415H3.33350C2.91928 5.5415 2.58350 5.20572 2.58350 4.7915C2.58350 4.37729 2.91928 4.0415 3.33350 4.0415H4.37516H6.54142V3.7915ZM14.8752 13.2464V8.24638V5.5415H13.4581H12.7081H7.29142H6.54142H5.12516V8.24638V13.2464V16.2082C5.12516 16.6224 5.46095 16.9582 5.87516 16.9582H14.1252C14.5394 16.9582 14.8752 16.6224 14.8752 16.2082V13.2464ZM8.04142 4.0415H11.9581V3.7915C11.9581 3.37729 11.6223 3.0415 11.2081 3.0415H8.79142C8.37721 3.0415 8.04142 3.37729 8.04142 3.7915V4.0415ZM8.33350 7.99984C8.74771 7.99984 9.08350 8.33562 9.08350 8.74984V13.7498C9.08350 14.1641 8.74771 14.4998 8.33350 14.4998C7.91928 14.4998 7.58350 14.1641 7.58350 13.7498V8.74984C7.58350 8.33562 7.91928 7.99984 8.33350 7.99984ZM12.4168 8.74984C12.4168 8.33562 12.0810 7.99984 11.6668 7.99984C11.2526 7.99984 10.9168 8.33562 10.9168 8.74984V13.7498C10.9168 14.1641 11.2526 14.4998 11.6668 14.4998C12.0810 14.4998 12.4168 14.1641 12.4168 13.7498V8.74984Z" fill="currentColor"></path>
      </svg>`,
      action: (item) => {
        this.handleDelete(item);
      },
    },
  ];

  ngOnInit(): void {
    this.loadRoles();
    this.setupSearchDebounce();
    this.loadModulesAndEntities();
    this.initializeFormConfig();
  }

  /**
   * Load modules and entities for form dropdowns
   */
  private loadModulesAndEntities(): void {
    // Load modules
    this.modulesService.getModules({ limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.availableModules = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading modules:', error);
        }
      });

    // Load entities
    this.entitiesService.getEntities({ limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.availableEntities = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading entities:', error);
        }
      });
  }

  /**
   * Initialize form configuration for roles
   */
  private initializeFormConfig(): void {
    const fields: FormFieldConfig[] = [
      // Entity selection at the top (required)
      createEntityIdField(
        async (page: number, limit: number, search?: string) => {
          return this.loadEntityOptions(page, limit, search);
        },
        () => {
          // Entity creation from role form - could be handled if needed
          console.warn('Entity creation from role form');
        }
      ),
      {
        key: 'name',
        label: 'Role Name',
        type: 'text',
        placeholder: 'Enter role name',
        required: true,
        validators: [Validators.required, Validators.minLength(2)],
        gridCols: 12,
        order: 2,
        hint: 'Enter a unique name for the role',
      },
    ];

    this.formConfig = {
      title: 'Create Role',
      subtitle: 'Add a new role with permissions',
      fields,
      submitLabel: 'Create Role',
      cancelLabel: 'Cancel',
      mode: 'create',
      modalWidth: 'w-full sm:w-[500px] md:w-[600px]',
      onSubmit: (data: Partial<RolePayload>) => this.handleFormSubmit(data),
      onSuccess: (response) => {
        console.log('Role created successfully:', response);
        this.loadRoles();
      },
      onError: (error) => {
        console.error('Error creating role:', error);
      },
    };
  }

  /**
   * Load entity options with pagination
   */
  private async loadEntityOptions(page: number, limit: number, search?: string): Promise<{
    options: { value: string; label: string; disabled?: boolean }[];
    hasMore: boolean;
    total?: number;
  }> {
    try {
      const response = await firstValueFrom(this.entitiesService.getEntities({
        page,
        limit,
        search,
      }));

      if (response && response.success) {
        const options = response.data.map(entity => ({
          value: entity.id,
          label: entity.name,
        }));

        return {
          options,
          hasMore: response.pagination.hasNextPage,
          total: response.pagination.total,
        };
      }

      return { options: [], hasMore: false };
    } catch (error) {
      console.error('Error loading entity options:', error);
      return { options: [], hasMore: false };
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  /**
   * Setup debounced search to avoid too many API calls
   */
  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1; // Reset to first page on search
      this.loadRoles();
    });
  }

  /**
   * Load roles from API
   */
  loadRoles(): void {
    this.isLoading = true;

    const params: RolePaginationParams = {
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.sortColumn && this.sortOrder) {
      params.sortBy = this.sortColumn;
      params.sortOrder = this.sortOrder;
    }

    // Entity filtering: table component handles entityId logic automatically
    // If showAll is false, table emits logged-in user's entityId
    // If showAll is true, table emits null, so we don't pass entityId to API
    if (!this.currentEntityFilter.showAll && this.currentEntityFilter.entityId) {
      params.entityId = this.currentEntityFilter.entityId;
    }

    this.rolesService.getRoles(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.rolesData = response.data;
          this.totalRecords = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.isLoading = false;
          // TODO: Show error toast/notification
        }
      });
  }

  // Event handlers
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRoles();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1; // Reset to first page
    this.loadRoles();
  }

  onSortChange(sort: { column: string; direction: 'asc' | 'desc' | null }): void {
    this.sortColumn = sort.column;
    this.sortOrder = sort.direction;
    this.currentPage = 1; // Reset to first page on sort
    this.loadRoles();
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onSelectionChange(selected: Role[]): void {
    console.log('Selection changed:', selected);
    // TODO: Handle bulk actions
  }

  onActionClick(event: { action: string; item: Role }): void {
    const { action, item } = event;
    
    switch (action) {
      case 'Edit':
        this.handleEdit(item);
        break;
      case 'Delete':
        this.handleDelete(item);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  /**
   * Handle delete action
   */
  private handleDelete(role: Role): void {
    if (confirm(`Are you sure you want to delete "${role.name}"?`)) {
      this.isLoading = true;
      this.rolesService.deleteRole(role.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadRoles(); // Reload list
            // TODO: Show success toast
          },
          error: (error) => {
            console.error('Error deleting role:', error);
            this.isLoading = false;
            // TODO: Show error toast
          }
        });
    }
  }

  /**
   * Handle create button click
   */
  onCreateClick(): void {
    this.currentEditRole = null;
    this.formConfig = {
      ...this.formConfig,
      title: 'Create Role',
      subtitle: 'Add a new role with permissions',
      mode: 'create',
      submitLabel: 'Create Role',
      initialData: undefined,
    };
    this.isFormModalOpen = true;
  }

  /**
   * Handle form submission (both create and update)
   */
  private handleFormSubmit(data: Partial<RolePayload>): Observable<any> {
    console.log('Form submit - mode:', this.formConfig.mode, 'currentEditRole:', this.currentEditRole);
    
    // Prepare payload
    // TODO: Add permissions UI component to handle permissions array
    // For now, using empty permissions array - will be enhanced later
    const payload: RolePayload = {
      name: data.name || '',
      entityId: data.entityId || '',
      permissions: [], // TODO: Get from permissions selector component
    };

    if (this.formConfig.mode === 'update' && this.currentEditRole) {
      console.log('Updating role:', this.currentEditRole.id, 'with data:', payload);
      return this.rolesService.updateRole(this.currentEditRole.id, payload);
    } else {
      console.log('Creating role with data:', payload);
      return this.rolesService.createRole(payload);
    }
  }

  /**
   * Handle edit action - fetches role data from API
   */
  private handleEdit(role: Role): void {
    this.currentEditRole = role;
    this.isLoadingEditData = true;
    
    // Set form config first to show loading state - preserve onSubmit handler
    this.formConfig = {
      ...this.formConfig,
      title: 'Edit Role',
      subtitle: 'Update role information and permissions',
      mode: 'update',
      submitLabel: 'Update Role',
      initialData: undefined, // Will be set after API call
      onSubmit: (data: Partial<RolePayload>) => this.handleFormSubmit(data), // Ensure onSubmit is preserved
    };
    this.isFormModalOpen = true;

    // Fetch role data from API
    this.rolesService.getRoleById(role.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoadingEditData = false;
          if (response.success && response.data) {
            const roleData = response.data;
            // Update form config with fetched data - preserve onSubmit handler
            // Note: Permissions will be handled separately in a future enhancement
            this.formConfig = {
              ...this.formConfig,
              initialData: {
                name: roleData.name,
                entityId: roleData.entityId,
                // permissions: roleData.permissions || [], // TODO: Handle permissions separately
              } as any,
              onSubmit: (data: Partial<RolePayload>) => this.handleFormSubmit(data), // Ensure onSubmit is preserved
            };
          } else {
            console.error('Failed to fetch role data:', response.message);
            // TODO: Show error toast/notification
            this.onFormModalClose();
          }
        },
        error: (error) => {
          this.isLoadingEditData = false;
          console.error('Error fetching role data:', error);
          // TODO: Show error toast/notification
          this.onFormModalClose();
        }
      });
  }

  /**
   * Handle form modal close
   */
  onFormModalClose(): void {
    this.isFormModalOpen = false;
    this.currentEditRole = null;
    this.isLoadingEditData = false;
  }

  /**
   * Handle form modal success
   */
  onFormModalSuccess(response: any): void {
    this.loadRoles();
    // TODO: Show success toast
  }

  /**
   * Handle form modal error
   */
  onFormModalError(error: any): void {
    console.error('Form error:', error);
    // TODO: Show error toast
  }

  /**
   * Handle entity filter change from table
   */
  onEntityFilterChange(event: { showAll: boolean; entityId: string | null }): void {
    this.currentEntityFilter = event;
    this.currentPage = 1; // Reset to first page
    this.loadRoles();
  }
}
