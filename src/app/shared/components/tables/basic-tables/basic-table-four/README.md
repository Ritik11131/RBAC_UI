# Generic Data Table Component

A highly optimized, scalable, and reusable data table component for Angular applications with support for:
- Dynamic pagination (client-side and server-side)
- Configurable columns with custom rendering
- Sorting and searching
- Row selection
- Custom actions
- Responsive design

## Features

✅ **Generic Type Support** - Works with any data type using TypeScript generics  
✅ **Client & Server-Side Pagination** - Supports both pagination modes  
✅ **Configurable Columns** - Define columns with custom rendering, sorting, and search  
✅ **Custom Actions** - Add edit, delete, or any custom actions per row  
✅ **Row Selection** - Single or multiple row selection with select all  
✅ **Optimized Performance** - Uses OnPush change detection and trackBy functions  
✅ **Fully Responsive** - Works on all screen sizes  
✅ **Dark Mode Support** - Built-in dark mode styling  

## Basic Usage

```typescript
import { Component } from '@angular/core';
import { GenericDataTableComponent, TableColumn, TableAction, TableConfig } from '../../generic-data-table/generic-data-table.component';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-user-table',
  imports: [GenericDataTableComponent],
  template: `
    <app-generic-data-table
      [data]="users"
      [columns]="columns"
      [config]="config"
      [actions]="actions"
      [idKey]="'id'"
      (pageChange)="onPageChange($event)"
      (actionClick)="onActionClick($event)"
    ></app-generic-data-table>
  `
})
export class UserTableComponent {
  users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    // ... more users
  ];

  columns: TableColumn<User>[] = [
    { key: 'name', label: 'Name', sortable: true, searchable: true },
    { key: 'email', label: 'Email', sortable: true, searchable: true },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      badgeColor: (item) => item.status === 'Active' ? 'success' : 'error'
    }
  ];

  config: TableConfig = {
    title: 'Users',
    showSearch: true,
    showPagination: true,
    defaultItemsPerPage: 10
  };

  actions: TableAction<User>[] = [
    {
      label: 'Edit',
      action: (item) => this.editUser(item)
    },
    {
      label: 'Delete',
      variant: 'error',
      action: (item) => this.deleteUser(item)
    }
  ];

  onPageChange(page: number) {
    // Handle page change
  }

  onActionClick(event: { action: string; item: User }) {
    // Handle action click
  }
}
```

## Column Configuration

### Basic Column
```typescript
{
  key: 'name',           // Property key or nested path (e.g., 'user.name')
  label: 'Name',         // Column header label
  sortable: true,        // Enable sorting (default: true)
  searchable: true,       // Include in search (default: true)
  width: '200px',         // Optional column width
  align: 'left'           // Text alignment: 'left' | 'center' | 'right'
}
```

### Badge Column
```typescript
{
  key: 'status',
  label: 'Status',
  type: 'badge',
  badgeColor: (item) => {
    if (item.status === 'Active') return 'success';
    if (item.status === 'Pending') return 'warning';
    return 'error';
  }
}
```

### Custom Rendered Column
```typescript
{
  key: 'name',
  label: 'User',
  type: 'custom',
  render: (item) => `
    <div>
      <p class="font-medium">${item.name}</p>
      <span class="text-sm text-gray-500">${item.email}</span>
    </div>
  `
}
```

## Table Configuration

```typescript
const config: TableConfig = {
  title: 'Data Table',                    // Optional table title
  showSearch: true,                       // Show search input
  showPagination: true,                    // Show pagination controls
  showItemsPerPage: true,                  // Show items per page selector
  showSelectAll: true,                     // Show select all checkbox
  showDownload: false,                     // Show download button
  searchPlaceholder: 'Search...',          // Search input placeholder
  itemsPerPageOptions: [5, 10, 20, 50],   // Items per page options
  defaultItemsPerPage: 10,                 // Default items per page
  emptyMessage: 'No data available',       // Empty state message
  enableSorting: true,                     // Enable column sorting
  enableSelection: true                    // Enable row selection
};
```

## Server-Side Pagination

For server-side pagination, set `serverSidePagination` to `true` and provide `totalRecords`:

```typescript
<app-generic-data-table
  [data]="users"
  [columns]="columns"
  [serverSidePagination]="true"
  [totalRecords]="totalUsers"
  (pageChange)="loadUsers($event)"
  (sortChange)="onSortChange($event)"
  (searchChange)="onSearchChange($event)"
></app-generic-data-table>
```

## Events

- `pageChange` - Emitted when page changes
- `itemsPerPageChange` - Emitted when items per page changes
- `sortChange` - Emitted when sorting changes
- `searchChange` - Emitted when search term changes
- `selectionChange` - Emitted when selection changes
- `downloadClick` - Emitted when download button is clicked
- `actionClick` - Emitted when an action is clicked

## Action Configuration

```typescript
const actions: TableAction<User>[] = [
  {
    label: 'Edit',
    icon: '<svg>...</svg>',              // Optional SVG icon
    variant: 'default',                   // 'default' | 'error' | 'warning' | 'success'
    action: (item) => this.edit(item),   // Action handler
    show: (item) => item.canEdit         // Optional: conditionally show action
  }
];
```

## Performance Tips

1. **Use trackBy**: The component uses `trackByFn` for optimal rendering
2. **OnPush Change Detection**: Component uses OnPush for better performance
3. **Server-Side Pagination**: Use server-side pagination for large datasets
4. **Limit Searchable Columns**: Only mark frequently searched columns as searchable

## Examples

See `basic-table-four-example.component.ts` for a complete working example.

