import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { GenericDataTableComponent, TableColumn, TableAction, TableConfig } from '../../shared/components/tables/generic-data-table/generic-data-table.component';

interface Module {
  id: number;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-modules',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    GenericDataTableComponent,
  ],
  templateUrl: './modules.component.html',
  styleUrl: './modules.component.css'
})
export class ModulesComponent {
  // Sample module data
  modulesData: Module[] = [
    {
      id: 1,
      name: 'User Management',
      description: 'Manage users and their permissions',
      status: 'Active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
    },
    {
      id: 2,
      name: 'Role Management',
      description: 'Define and manage user roles',
      status: 'Active',
      createdAt: '2024-01-16',
      updatedAt: '2024-01-21',
    },
    {
      id: 3,
      name: 'Permission Management',
      description: 'Configure system permissions',
      status: 'Pending',
      createdAt: '2024-01-17',
      updatedAt: '2024-01-17',
    },
    {
      id: 4,
      name: 'Entity Management',
      description: 'Manage system entities',
      status: 'Active',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-22',
    },
    {
      id: 5,
      name: 'Meter Management',
      description: 'Manage meter configurations',
      status: 'Inactive',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
    },
  ];

  // Table column definitions
  columns: TableColumn<Module>[] = [
    {
      key: 'name',
      label: 'Module Name',
      sortable: true,
      searchable: true,
      type: 'custom',
      render: (item) => `
        <div>
          <p class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">${item.name}</p>
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">${item.description}</span>
        </div>
      `,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      badgeColor: (item) => {
        if (item.status === 'Active') return 'success';
        if (item.status === 'Pending') return 'warning';
        return 'error';
      },
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      sortable: true,
    },
  ];

  // Table configuration
  config: TableConfig = {
    title: 'Modules',
    showSearch: true,
    showPagination: true,
    showItemsPerPage: true,
    showSelectAll: true,
    showDownload: false,
    searchPlaceholder: 'Search modules...',
    itemsPerPageOptions: [10, 20, 50],
    defaultItemsPerPage: 10,
    emptyMessage: 'No modules found',
    enableSorting: true,
    enableSelection: true,
    useDropdownMenu: true, // Use dropdown menu for actions
  };

  // Action buttons
  actions: TableAction<Module>[] = [
    {
      label: 'Edit',
      variant: 'default',
      icon: `<svg width="16" height="16" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0911 3.53206C16.2124 2.65338 14.7878 2.65338 13.9091 3.53206L5.6074 11.8337C5.29899 12.1421 5.08687 12.5335 4.99684 12.9603L4.26177 16.445C4.20943 16.6931 4.286 16.9508 4.46529 17.1301C4.64458 17.3094 4.90232 17.3859 5.15042 17.3336L8.63507 16.5985C9.06184 16.5085 9.45324 16.2964 9.76165 15.988L18.0633 7.68631C18.942 6.80763 18.942 5.38301 18.0633 4.50433L17.0911 3.53206ZM14.9697 4.59272C15.2626 4.29982 15.7375 4.29982 16.0304 4.59272L17.0027 5.56499C17.2956 5.85788 17.2956 6.33276 17.0027 6.62565L16.1043 7.52402L14.0714 5.49109L14.9697 4.59272ZM13.0107 6.55175L6.66806 12.8944C6.56526 12.9972 6.49455 13.1277 6.46454 13.2699L5.96704 15.6283L8.32547 15.1308C8.46772 15.1008 8.59819 15.0301 8.70099 14.9273L15.0436 8.58468L13.0107 6.55175Z" fill="currentColor"></path>
      </svg>`,
      action: (item) => {
        console.log('Edit module:', item);
        // Add edit logic here
      },
    },
    {
      label: 'Delete',
      variant: 'error',
      icon: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.54142 3.7915C6.54142 2.54886 7.54878 1.5415 8.79142 1.5415H11.2081C12.4507 1.5415 13.4581 2.54886 13.4581 3.7915V4.0415H15.6252H16.666C17.0802 4.0415 17.416 4.37729 17.416 4.7915C17.416 5.20572 17.0802 5.5415 16.666 5.5415H16.3752V8.24638V13.2464V16.2082C16.3752 17.4508 15.3678 18.4582 14.1252 18.4582H5.87516C4.63252 18.4582 3.62516 17.4508 3.62516 16.2082V13.2464V8.24638V5.5415H3.3335C2.91928 5.5415 2.5835 5.20572 2.5835 4.7915C2.5835 4.37729 2.91928 4.0415 3.3335 4.0415H4.37516H6.54142V3.7915ZM14.8752 13.2464V8.24638V5.5415H13.4581H12.7081H7.29142H6.54142H5.12516V8.24638V13.2464V16.2082C5.12516 16.6224 5.46095 16.9582 5.87516 16.9582H14.1252C14.5394 16.9582 14.8752 16.6224 14.8752 16.2082V13.2464ZM8.04142 4.0415H11.9581V3.7915C11.9581 3.37729 11.6223 3.0415 11.2081 3.0415H8.79142C8.37721 3.0415 8.04142 3.37729 8.04142 3.7915V4.0415ZM8.3335 7.99984C8.74771 7.99984 9.0835 8.33562 9.0835 8.74984V13.7498C9.0835 14.1641 8.74771 14.4998 8.3335 14.4998C7.91928 14.4998 7.5835 14.1641 7.5835 13.7498V8.74984C7.5835 8.33562 7.91928 7.99984 8.3335 7.99984ZM12.4168 8.74984C12.4168 8.33562 12.081 7.99984 11.6668 7.99984C11.2526 7.99984 10.9168 8.33562 10.9168 8.74984V13.7498C10.9168 14.1641 11.2526 14.4998 11.6668 14.4998C12.081 14.4998 12.4168 14.1641 12.4168 13.7498V8.74984Z" fill="currentColor"></path>
      </svg>`,
      action: (item) => {
        console.log('Delete module:', item);
        // Add delete logic here
      },
    },
  ];

  // Event handlers
  onPageChange(page: number) {
    console.log('Page changed to:', page);
  }

  onItemsPerPageChange(itemsPerPage: number) {
    console.log('Items per page changed to:', itemsPerPage);
  }

  onSortChange(sort: { column: string; direction: 'asc' | 'desc' | null }) {
    console.log('Sort changed:', sort);
  }

  onSearchChange(searchTerm: string) {
    console.log('Search changed:', searchTerm);
  }

  onSelectionChange(selected: Module[]) {
    console.log('Selection changed:', selected);
  }

  onActionClick(event: { action: string; item: Module }) {
    console.log('Action clicked:', event);
  }
}
