import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, TrackByFunction } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../ui/badge/badge.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { SpinnerComponent } from '../../common/spinner/spinner.component';


export type ColumnType = 'text' | 'badge' | 'custom' | 'checkbox';
export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  type?: ColumnType;
  searchable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => string;
  badgeColor?: (item: T) => 'success' | 'warning' | 'error' | 'info';
  customTemplate?: boolean; // For ng-template usage
}

export interface TableAction<T = any> {
  label?: string;
  icon?: string;
  action: (item: T) => void;
  variant?: 'default' | 'error' | 'warning' | 'success';
  show?: (item: T) => boolean;
}

export interface TableConfig {
  title?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  showItemsPerPage?: boolean;
  showSelectAll?: boolean;
  showDownload?: boolean;
  searchPlaceholder?: string;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  emptyMessage?: string;
  enableSorting?: boolean;
  enableSelection?: boolean;
  useDropdownMenu?: boolean; // Use dropdown menu for actions instead of direct buttons
}

@Component({
  selector: 'app-generic-data-table',
  imports: [
    CommonModule,
    FormsModule,
    BadgeComponent,
    ButtonComponent,
    CheckboxComponent,
    SafeHtmlPipe,
    TableDropdownComponent,
    SpinnerComponent,
  ],
  templateUrl: './generic-data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ``
})
export class GenericDataTableComponent<T = any> implements OnInit, OnChanges {
  // Inputs
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() config: TableConfig = {};
  @Input() actions: TableAction<T>[] = [];
  @Input() idKey: string = 'id';
  @Input() loading: boolean = false;
  @Input() serverSidePagination: boolean = false;
  @Input() totalRecords: number = 0;

  // Outputs
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: SortDirection }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() downloadClick = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<{ action: string; item: T }>();

  // Internal state
  searchTerm = '';
  itemsPerPage = 5;
  currentPage = 1;
  selectedItems: Set<string | number> = new Set();
  selectAll = false;
  sortColumn: string | null = null;
  sortDirection: SortDirection = null;

  // Default config
  private defaultConfig: TableConfig = {
    showSearch: true,
    showPagination: true,
    showItemsPerPage: true,
    showSelectAll: true,
    showDownload: false,
    searchPlaceholder: 'Search...',
    itemsPerPageOptions: [10, 20, 50],
    defaultItemsPerPage: 10,
    emptyMessage: 'No data available',
    enableSorting: true,
    enableSelection: true,
    useDropdownMenu: false, // Default to direct buttons
  };

  mergedConfig: TableConfig = {};

  ngOnInit() {
    this.mergedConfig = { ...this.defaultConfig, ...this.config };
    this.itemsPerPage = this.mergedConfig.defaultItemsPerPage || 5;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.mergedConfig = { ...this.defaultConfig, ...this.config };
    }
    if (changes['data'] && !this.serverSidePagination) {
      this.currentPage = 1;
    }
  }

  // Track by function for better performance
  trackByFn: TrackByFunction<T> = (index: number, item: T) => {
    return this.getId(item);
  };

  getId(item: T): string | number {
    return (item as any)[this.idKey] ?? Math.random();
  }

  get filteredData(): T[] {
    if (this.serverSidePagination) {
      return this.data;
    }

    let data = [...this.data];

    // Apply search filter
    if (this.searchTerm && this.mergedConfig.showSearch) {
      const search = this.searchTerm.toLowerCase();
      const searchableColumns = this.columns.filter(col => col.searchable !== false);
      
      data = data.filter(item => {
        return searchableColumns.some(col => {
          const value = this.getCellValue(item, col);
          return String(value).toLowerCase().includes(search);
        });
      });
    }

    // Apply sorting
    if (this.sortColumn && this.mergedConfig.enableSorting) {
      const column = this.columns.find(col => col.key === this.sortColumn);
      if (column?.sortable !== false) {
        data.sort((a, b) => {
          const aValue = this.getCellValue(a, column!);
          const bValue = this.getCellValue(b, column!);
          
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          
          if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return data;
  }

  get totalPages(): number {
    if (this.serverSidePagination) {
      return Math.ceil(this.totalRecords / this.itemsPerPage);
    }
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  get currentItems(): T[] {
    if (this.serverSidePagination) {
      return this.data;
    }
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredData.slice(start, start + this.itemsPerPage);
  }

  get totalRecordsCount(): number {
    if (this.serverSidePagination) {
      return this.totalRecords;
    }
    return this.filteredData.length;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalRecordsCount);
  }

  getCellValue(item: T, column: TableColumn<T>): any {
    if (column.render) {
      return column.render(item);
    }
    const keys = column.key.split('.');
    let value: any = item;
    for (const key of keys) {
      value = value?.[key];
    }
    return value ?? '';
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(this.totalPages, 10); // Show max 10 page numbers
    const startPage = Math.max(1, this.currentPage - 4);
    const endPage = Math.min(this.totalPages, startPage + 9);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onItemsPerPageChangeHandler() {
    this.currentPage = 1;
    this.selectedItems.clear();
    this.selectAll = false;
    this.itemsPerPageChange.emit(this.itemsPerPage);
    
    if (this.serverSidePagination) {
      this.pageChange.emit(this.currentPage);
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.selectedItems.clear();
    this.selectAll = false;
    this.searchChange.emit(this.searchTerm);
    
    if (this.serverSidePagination) {
      this.pageChange.emit(this.currentPage);
    }
  }

  toggleSort(column: TableColumn<T>) {
    if (!this.mergedConfig.enableSorting || column.sortable === false) {
      return;
    }

    if (this.sortColumn === column.key) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = null;
        this.sortColumn = null;
      }
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({ column: this.sortColumn || '', direction: this.sortDirection });
    
    if (this.serverSidePagination) {
      this.pageChange.emit(this.currentPage);
    }
  }

  getSortIcon(column: TableColumn<T>): string {
    if (this.sortColumn !== column.key) {
      return 'both';
    }
    return this.sortDirection === 'asc' ? 'asc' : this.sortDirection === 'desc' ? 'desc' : 'both';
  }

  onSelectAll(checked: boolean) {
    this.selectAll = checked;
    if (checked) {
      this.currentItems.forEach(item => {
        this.selectedItems.add(this.getId(item));
      });
    } else {
      this.selectedItems.clear();
    }
    this.emitSelection();
  }

  onItemSelect(item: T, checked: boolean) {
    const id = this.getId(item);
    if (checked) {
      this.selectedItems.add(id);
    } else {
      this.selectedItems.delete(id);
    }
    this.selectAll = this.currentItems.every(item => 
      this.selectedItems.has(this.getId(item))
    );
    this.emitSelection();
  }

  isItemSelected(item: T): boolean {
    return this.selectedItems.has(this.getId(item));
  }

  private emitSelection() {
    const selected = this.data.filter(item => 
      this.selectedItems.has(this.getId(item))
    );
    this.selectionChange.emit(selected);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.selectAll = false;
      this.pageChange.emit(page);
    }
  }

  handleAction(action: TableAction<T>, item: T) {
    if (action.show && !action.show(item)) {
      return;
    }
    action.action(item);
    this.actionClick.emit({ action: action.label || 'action', item });
  }

  handleDownload() {
    this.downloadClick.emit();
  }

  getBadgeColor(item: T, column: TableColumn<T>): 'success' | 'warning' | 'error' | 'info' {
    if (column.badgeColor) {
      return column.badgeColor(item);
    }
    return 'info';
  }

  hasActions(): boolean {
    return this.actions && this.actions.length > 0;
  }

  shouldShowAction(action: TableAction<T>, item: T): boolean {
    return !action.show || action.show(item);
  }

  // Arrow icons for pagination
  get previousArrowIcon(): string {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5825 9.9986C2.5822 10.1909 2.6554 10.3832 2.802 10.53L7.7987 15.5301C8.0915 15.8231 8.5663 15.8233 8.8593 15.5305C9.1523 15.2377 9.1525 14.7629 8.8597 14.4699L5.1396 10.7472L16.667 10.7472C17.0812 10.7472 17.417 10.4114 17.417 9.99715C17.417 9.58294 17.0812 9.24715 16.667 9.24715L5.1451 9.24715L8.8597 5.53016C9.1525 5.23717 9.1523 4.7623 8.8593 4.4695C8.5664 4.1767 8.0915 4.17685 7.7987 4.46984L2.8412 9.43049C2.6827 9.568 2.5825 9.77087 2.5825 9.99715C2.5825 9.99763 2.5825 9.99812 2.5825 9.9986Z" fill="currentColor"></path>
    </svg>`;
  }

  get nextArrowIcon(): string {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="fill-current">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z" fill="currentColor"></path>
    </svg>`;
  }
}

