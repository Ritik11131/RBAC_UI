import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, Observable, firstValueFrom } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { GenericDataTableComponent, TableColumn, TableAction, TableConfig } from '../../shared/components/tables/generic-data-table/generic-data-table.component';
import { EntitiesService } from '../../core/services/entities.service';
import { ProfilesService } from '../../core/services/profiles.service';
import { Entity, EntityPaginationParams, EntityPayload } from '../../core/interfaces/entity.interface';
import { Profile, ProfilePayload } from '../../core/interfaces/profile.interface';
import { formatDateMedium } from '../../shared/utils/date.util';
import { GenericFormModalComponent } from '../../shared/components/form/generic-form-modal/generic-form-modal.component';
import { FormFieldConfig, GenericFormConfig } from '../../core/interfaces/form-config.interface';
import { Validators } from '@angular/forms';
import { createProfileIdField, createEntityIdField } from '../../shared/utils/form-field-helpers';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-entities',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    GenericDataTableComponent,
    GenericFormModalComponent,
  ],
  templateUrl: './entities.component.html',
  styleUrl: './entities.component.css'
})
export class EntitiesComponent implements OnInit, OnDestroy {
  private entitiesService = inject(EntitiesService);
  private profilesService = inject(ProfilesService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Component state
  entitiesData: Entity[] = [];
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
  formConfig!: GenericFormConfig<EntityPayload>;
  currentEditEntity: Entity | null = null;
  isLoadingEditData = false;

  // Profile creation modal state (for creating profile from entity form)
  isProfileModalOpen = false;
  profileFormConfig!: GenericFormConfig<ProfilePayload>;

  // Table column definitions
  columns: TableColumn<Entity>[] = [
    {
      key: 'name',
      label: 'Entity',
      sortable: true,
      searchable: true,
      type: 'custom',
      render: (item) => `
        <div>
          <p class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">${item.name || '-'}</p>
          ${item.email_id ? `<span class="text-sm font-normal text-gray-500 dark:text-gray-400">${item.email_id}</span>` : ''}
        </div>
      `,
    },
    {
      key: 'mobile_no',
      label: 'Mobile',
      sortable: true,
      searchable: true,
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
    title: 'Entities',
    subtitle: 'Manage and configure system entities. Create, edit, or delete entities to organize your application structure.',
    showSearch: true,
    showPagination: true,
    showItemsPerPage: true,
    showSelectAll: true,
    showDownload: false,
    showCreateButton: true,
    createButtonLabel: 'Create Entity',
    searchPlaceholder: 'Search entities...',
    itemsPerPageOptions: [10, 20, 50],
    defaultItemsPerPage: 10,
    emptyMessage: 'No entities found',
    enableSorting: true,
    enableSelection: true,
    useDropdownMenu: true,
    showEntityFilter: true,
    entityFilterDefault: 'all',
  };

  // Action buttons
  actions: TableAction<Entity>[] = [
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
    this.loadEntities();
    this.setupSearchDebounce();
    this.initializeFormConfig();
    this.initializeProfileFormConfig();
  }

  /**
   * Initialize form configuration for entities
   */
  private initializeFormConfig(): void {
    const fields: FormFieldConfig[] = [
      // Profile selection at the top (required)
      createProfileIdField(
        async (page: number, limit: number, search?: string) => {
          return this.loadProfileOptions(page, limit, search);
        },
        () => {
          this.openProfileCreationModal();
        }
      ),
      {
        key: 'name',
        label: 'Entity Name',
        type: 'text',
        placeholder: 'Enter entity name',
        required: true,
        validators: [Validators.required, Validators.minLength(2)],
        gridCols: 12,
        order: 2,
        hint: 'Enter a unique name for the entity',
      },
      {
        key: 'email_id',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter email address',
        required: false,
        validators: [Validators.email],
        gridCols: 12,
        order: 3,
        hint: 'Enter a valid email address',
      },
      {
        key: 'mobile_no',
        label: 'Mobile Number',
        type: 'tel',
        placeholder: 'Enter mobile number',
        required: false,
        validators: [Validators.pattern(/^[0-9]{10}$/)],
        gridCols: 12,
        order: 4,
        hint: 'Enter a 10-digit mobile number',
      },
      {
        key: 'type',
        label: 'Type',
        type: 'text',
        placeholder: 'Enter entity type (e.g., tenant)',
        required: false,
        gridCols: 6,
        order: 5,
        hint: 'Type of entity (e.g., tenant, customer)',
      },
      {
        key: 'industry',
        label: 'Industry',
        type: 'text',
        placeholder: 'Enter industry',
        required: false,
        gridCols: 6,
        order: 6,
        hint: 'Industry classification (e.g., Energy, Technology)',
      },
    ];

    this.formConfig = {
      title: 'Create Entity',
      subtitle: 'Add a new entity to organize your application structure',
      fields,
      submitLabel: 'Create Entity',
      cancelLabel: 'Cancel',
      mode: 'create',
      modalWidth: 'w-full sm:w-[400px] md:w-[500px]',
      onSubmit: (data: Partial<EntityPayload>) => this.handleFormSubmit(data),
      onSuccess: (response) => {
        console.log('Entity created successfully:', response);
        this.loadEntities();
      },
      onError: (error) => {
        console.error('Error creating entity:', error);
      },
    };
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
      // Only trigger if search term actually changed
      if (this.searchTerm !== searchTerm) {
        this.searchTerm = searchTerm;
        this.currentPage = 1; // Reset to first page on search
        this.loadEntities();
      }
    });
  }

  /**
   * Load entities from API
   */
  loadEntities(): void {
    this.isLoading = true;

    const params: EntityPaginationParams = {
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

    this.entitiesService.getEntities(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.entitiesData = response.data;
          this.totalRecords = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading entities:', error);
          this.isLoading = false;
          this.toastService.error(error);
        }
      });
  }

  // Event handlers
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEntities();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1; // Reset to first page
    this.loadEntities();
  }

  onSortChange(sort: { column: string; direction: 'asc' | 'desc' | null }): void {
    this.sortColumn = sort.column;
    this.sortOrder = sort.direction;
    this.currentPage = 1; // Reset to first page on sort
    this.loadEntities();
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onSelectionChange(selected: Entity[]): void {
    console.log('Selection changed:', selected);
    // TODO: Handle bulk actions
  }

  onActionClick(event: { action: string; item: Entity }): void {
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
  private handleDelete(entity: Entity): void {
    this.toastService.confirmDelete(
      entity.name,
      () => {
        this.isLoading = true;
        this.entitiesService.deleteEntity(entity.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadEntities(); // Reload list
              this.toastService.success(`Entity "${entity.name}" deleted successfully`);
            },
            error: (error) => {
              console.error('Error deleting entity:', error);
              this.isLoading = false;
              this.toastService.error(error);
            }
          });
      }
    );
  }

  /**
   * Handle create button click
   */
  onCreateClick(): void {
    this.currentEditEntity = null;
    this.formConfig = {
      ...this.formConfig,
      title: 'Create Entity',
      subtitle: 'Add a new entity to organize your application structure',
      mode: 'create',
      submitLabel: 'Create Entity',
      initialData: undefined,
    };
    this.isFormModalOpen = true;
  }

  /**
   * Handle form submission (both create and update)
   */
  private handleFormSubmit(data: Partial<EntityPayload>): Observable<any> {
    console.log('Form submit - mode:', this.formConfig.mode, 'currentEditEntity:', this.currentEditEntity);
    
    // Prevent submission if profile_id is still the create placeholder
    if (data.profile_id === '__create_new__') {
      this.toastService.warning('Please create a profile first or select an existing one');
      return new Observable(observer => {
        observer.error({ message: 'Please select a valid profile or create a new one first' });
      });
    }

    // Prepare payload - extract type and industry from form data to attributes
    const payload: EntityPayload = {
      name: data.name || '',
      email_id: data.email_id,
      mobile_no: data.mobile_no,
      profile_id: data.profile_id,
      attributes: {},
    };

    // Map type and industry to attributes
    if ((data as any).type) {
      payload.attributes = {
        ...payload.attributes,
        type: (data as any).type,
      };
    }
    if ((data as any).industry) {
      payload.attributes = {
        ...payload.attributes,
        industry: (data as any).industry,
      };
    }

    if (this.formConfig.mode === 'update' && this.currentEditEntity) {
      console.log('Updating entity:', this.currentEditEntity.id, 'with data:', payload);
      return this.entitiesService.updateEntity(this.currentEditEntity.id, payload);
    } else {
      console.log('Creating entity with data:', payload);
      return this.entitiesService.createEntity(payload);
    }
  }

  /**
   * Handle edit action - fetches entity data from API
   */
  private handleEdit(entity: Entity): void {
    this.currentEditEntity = entity;
    this.isLoadingEditData = true;
    
    // Set form config first to show loading state - preserve onSubmit handler
    this.formConfig = {
      ...this.formConfig,
      title: 'Edit Entity',
      subtitle: 'Update entity information',
      mode: 'update',
      submitLabel: 'Update Entity',
      initialData: undefined, // Will be set after API call
      onSubmit: (data: Partial<EntityPayload>) => this.handleFormSubmit(data), // Ensure onSubmit is preserved
    };
    this.isFormModalOpen = true;

    // Fetch entity data from API
    this.entitiesService.getEntityById(entity.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoadingEditData = false;
          if (response.success && response.data) {
            const entityData = response.data;
            // Update form config with fetched data - preserve onSubmit handler
            this.formConfig = {
              ...this.formConfig,
              initialData: {
                name: entityData.name,
                email_id: entityData.email_id || '',
                mobile_no: entityData.mobile_no || '',
                profile_id: entityData.profile_id || '',
                type: entityData.attributes?.type || '',
                industry: entityData.attributes?.industry || '',
              } as any,
              onSubmit: (data: Partial<EntityPayload>) => this.handleFormSubmit(data), // Ensure onSubmit is preserved
            };
          } else {
            console.error('Failed to fetch entity data:', response.message);
            this.toastService.error(response.message || 'Failed to fetch entity data');
            this.onFormModalClose();
          }
        },
        error: (error) => {
          this.isLoadingEditData = false;
          console.error('Error fetching entity data:', error);
          this.toastService.error(error);
          this.onFormModalClose();
        }
      });
  }

  /**
   * Handle form modal close
   */
  onFormModalClose(): void {
    this.isFormModalOpen = false;
    this.currentEditEntity = null;
    this.isLoadingEditData = false;
  }

  /**
   * Handle form modal success
   */
  onFormModalSuccess(response: any): void {
    this.loadEntities();
    const message = this.formConfig.mode === 'create' 
      ? 'Entity created successfully' 
      : 'Entity updated successfully';
    this.toastService.success(message);
  }

  /**
   * Handle form modal error
   */
  onFormModalError(error: any): void {
    console.error('Form error:', error);
    this.toastService.error(error);
  }

  /**
   * Initialize profile form configuration (for creating profile from entity form)
   */
  private initializeProfileFormConfig(): void {
    const fields: FormFieldConfig[] = [
      // Entity selection at the top (required)
      createEntityIdField(
        async (page: number, limit: number, search?: string) => {
          return this.loadEntityOptionsForProfile(page, limit, search);
        },
        () => {
          // Note: This would open entity modal, but we're already in entity form context
          // So we might want to handle this differently or just show a message
          this.toastService.warning('Cannot create entity from profile form when already in entity form');
        }
      ),
      {
        key: 'name',
        label: 'Profile Name',
        type: 'text',
        placeholder: 'Enter profile name',
        required: true,
        validators: [Validators.required, Validators.minLength(2)],
        gridCols: 12,
        order: 2,
        hint: 'Enter a unique name for the profile',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter profile description',
        required: false,
        gridCols: 12,
        order: 3,
        hint: 'Optional description for this profile',
      },
    ];

    this.profileFormConfig = {
      title: 'Create New Profile',
      subtitle: 'Create a new profile to use in entities',
      fields,
      submitLabel: 'Create Profile',
      cancelLabel: 'Cancel',
      mode: 'create',
      modalWidth: 'w-full sm:w-[400px] md:w-[450px]',
      onSubmit: (data: Partial<ProfilePayload>) => this.handleProfileFormSubmit(data),
      onSuccess: (response) => {
        this.onProfileCreated(response);
      },
      onError: (error) => {
        console.error('Error creating profile:', error);
      },
    };
  }

  /**
   * Handle profile form submission
   */
  private handleProfileFormSubmit(data: Partial<ProfilePayload>): Observable<any> {
    // Ensure name is provided (required field)
    if (!data.name) {
      return new Observable(observer => {
        observer.error({ message: 'Profile name is required' });
      });
    }

    // Prevent submission if entity_id is still the create placeholder
    if (data.entity_id === '__create_new__') {
      this.toastService.warning('Please create an entity first or select an existing one');
      return new Observable(observer => {
        observer.error({ message: 'Please select a valid entity or create a new one first' });
      });
    }

    // Create payload with required name field
    const payload: ProfilePayload = {
      name: data.name || '',
      entity_id: data.entity_id || '',
      attributes: {},
    };

    // Handle description field (mapped to attributes.description)
    if ((data as any).description) {
      payload.attributes = {
        description: (data as any).description,
      };
    }

    return this.profilesService.createProfile(payload);
  }

  /**
   * Load entity options for profile form (when creating profile from entity form)
   */
  private async loadEntityOptionsForProfile(page: number, limit: number, search?: string): Promise<{
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

  /**
   * Open profile creation modal
   */
  private openProfileCreationModal(): void {
    this.isProfileModalOpen = true;
  }

  /**
   * Handle profile creation success - update entity form with new profile
   */
  onProfileCreated(response: any): void {
    if (response.success && response.data) {
      const newProfile = response.data;
      
      // Close profile modal first
      this.isProfileModalOpen = false;
      
      // Update the entity form config's initialData with the newly created profile
      if (this.formConfig && this.isFormModalOpen) {
        const currentInitialData = this.formConfig.initialData || {};
        this.formConfig = {
          ...this.formConfig,
          initialData: {
            ...currentInitialData,
            profile_id: newProfile.id,
          } as any,
        };
        
        // Also update the paginated select config to include the new profile in options
        const profileField = this.formConfig.fields.find(f => f.key === 'profile_id');
        if (profileField && profileField.paginatedSelectConfig) {
          const originalLoadOptions = profileField.paginatedSelectConfig.loadOptions;
          profileField.paginatedSelectConfig.loadOptions = async (page: number, limit: number, search?: string) => {
            const result = await originalLoadOptions(page, limit, search);
            if (page === 1 && !result.options.find(opt => opt.value === newProfile.id)) {
              result.options.unshift({
                value: newProfile.id,
                label: newProfile.name,
              });
            }
            return result;
          };
        }
      }
      
      console.log('Profile created successfully:', newProfile);
      console.log('Entity form will be updated with profile_id:', newProfile.id);
    }
  }

  /**
   * Handle profile modal close
   */
  onProfileModalClose(): void {
    this.isProfileModalOpen = false;
  }

  /**
   * Handle profile modal error
   */
  onProfileModalError(error: any): void {
    console.error('Profile creation error:', error);
    this.toastService.error(error);
  }

  /**
   * Load profile options with pagination
   */
  private async loadProfileOptions(page: number, limit: number, search?: string): Promise<{
    options: { value: string; label: string; disabled?: boolean }[];
    hasMore: boolean;
    total?: number;
  }> {
    try {
      const response = await firstValueFrom(this.profilesService.getProfiles({
        page,
        limit,
        search,
      }));

      if (response && response.success) {
        const options = response.data.map(profile => ({
          value: profile.id,
          label: profile.name,
        }));

        return {
          options,
          hasMore: response.pagination.hasNextPage,
          total: response.pagination.total,
        };
      }

      return { options: [], hasMore: false };
    } catch (error) {
      console.error('Error loading profile options:', error);
      return { options: [], hasMore: false };
    }
  }

  /**
   * Handle entity filter change from table
   */
  onEntityFilterChange(event: { showAll: boolean; entityId: string | null }): void {
    this.currentEntityFilter = event;
    this.currentPage = 1; // Reset to first page
    this.loadEntities();
  }
}
