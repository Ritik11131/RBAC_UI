import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface PaginatedSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface PaginatedSelectConfig {
  loadOptions: (page: number, limit: number, search?: string) => Promise<{
    options: PaginatedSelectOption[];
    hasMore: boolean;
    total?: number;
  }>;
  placeholder?: string;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  showSearch?: boolean;
  allowCreate?: boolean;
  createLabel?: string;
  createValue?: string;
}

@Component({
  selector: 'app-paginated-select',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative" #dropdownContainer>
      <!-- Selected Value Display -->
      <button
        type="button"
        (click)="toggleDropdown()"
        [disabled]="disabled"
        class="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 flex items-center justify-between"
        [ngClass]="{
          'border-error-500': error,
          'border-gray-300': !error,
          'opacity-50 cursor-not-allowed': disabled
        }"
      >
        <span [ngClass]="{'text-gray-400': !selectedLabel}">
          {{ selectedLabel || placeholder }}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current transition-transform"
          [ngClass]="{'rotate-180': isOpen}"
        >
          <path d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165" stroke="" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      @if (isOpen) {
        <div class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
          <!-- Search Input -->
          @if (config.showSearch !== false) {
            <div class="p-2 border-b border-gray-200 dark:border-gray-800">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="onSearchInput()"
                [placeholder]="config.searchPlaceholder || 'Search...'"
                class="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:bg-gray-800 dark:text-white/90"
              />
            </div>
          }

          <!-- Options List -->
          <div class="flex-1 overflow-y-auto" #optionsContainer (scroll)="onScroll($event)">
            @if (isLoading && options.length === 0) {
              <div class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            } @else if (options.length === 0 && !isLoading) {
              <div class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            } @else {
              @for (option of options; track option.value) {
                <button
                  type="button"
                  (click)="selectOption(option)"
                  [disabled]="option.disabled"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  [ngClass]="{
                    'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400': selectedValue === option.value,
                    'text-gray-700 dark:text-gray-300': selectedValue !== option.value,
                    'opacity-50 cursor-not-allowed': option.disabled
                  }"
                >
                  {{ option.label }}
                </button>
              }
              
              <!-- Load More Button -->
              @if (hasMore && !isLoading) {
                <button
                  type="button"
                  (click)="loadMore()"
                  class="w-full px-4 py-2 text-sm text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t border-gray-200 dark:border-gray-800"
                >
                  Load More
                </button>
              }
              
              <!-- Loading More Indicator -->
              @if (isLoading && options.length > 0) {
                <div class="p-2 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
                  Loading more...
                </div>
              }
            }
          </div>

          <!-- Create New Option -->
          @if (config.allowCreate) {
            <div class="border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                (click)="selectCreateOption()"
                class="w-full px-4 py-2 text-left text-sm text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                + {{ config.createLabel || 'Create New' }}
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: ``
})
export class PaginatedSelectComponent implements OnInit, OnDestroy, OnChanges {
  @Input() config!: PaginatedSelectConfig;
  @Input() value: string | number | null = null;
  @Input() disabled = false;
  @Input() error = false;
  @Input() placeholder = 'Select an option';

  @Output() valueChange = new EventEmitter<string | number>();
  @Output() createClick = new EventEmitter<void>();

  @ViewChild('dropdownContainer', { static: false }) dropdownContainer!: ElementRef;
  @ViewChild('optionsContainer', { static: false }) optionsContainer!: ElementRef;

  isOpen = false;
  options: PaginatedSelectOption[] = [];
  selectedValue: string | number | null = null;
  selectedLabel = '';
  searchTerm = '';
  currentPage = 1;
  hasMore = false;
  isLoading = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private itemsPerPage = 10;

  ngOnInit(): void {
    this.itemsPerPage = this.config.itemsPerPage || 10;
    this.selectedValue = this.value;
    this.setupSearchDebounce();
    this.loadOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && changes['value'].currentValue !== this.selectedValue) {
      this.selectedValue = changes['value'].currentValue;
      // Update label if we have the option loaded
      if (this.selectedValue) {
        const selected = this.options.find(opt => opt.value === this.selectedValue);
        if (selected) {
          this.selectedLabel = selected.label;
        } else {
          // Value changed but option not loaded yet - reload options to find the label
          // This handles the case when a new entity is created and set as value
          this.currentPage = 1;
          this.options = [];
          this.loadOptions();
        }
      } else {
        this.selectedLabel = '';
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.options = [];
      this.loadOptions();
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  async loadOptions(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    try {
      const result = await this.config.loadOptions(this.currentPage, this.itemsPerPage, this.searchTerm || undefined);
      if (this.currentPage === 1) {
        this.options = result.options;
      } else {
        this.options = [...this.options, ...result.options];
      }
      this.hasMore = result.hasMore;
      
      // Update selected label
      if (this.selectedValue) {
        const selected = this.options.find(opt => opt.value === this.selectedValue);
        if (selected) {
          this.selectedLabel = selected.label;
        } else if (this.currentPage === 1) {
          // If we're on first page and selected value not found, try to load it
          // This handles the case when a new entity is created
          this.selectedLabel = String(this.selectedValue); // Temporary label
        }
      }
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadMore(): Promise<void> {
    if (!this.hasMore || this.isLoading) return;
    this.currentPage++;
    await this.loadOptions();
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    
    // Load more when near bottom (within 50px)
    if (scrollBottom < 50 && this.hasMore && !this.isLoading) {
      this.loadMore();
    }
  }

  selectOption(option: PaginatedSelectOption): void {
    if (option.disabled) return;
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.valueChange.emit(option.value);
    this.closeDropdown();
  }

  selectCreateOption(): void {
    if (this.config.createValue) {
      this.selectedValue = this.config.createValue;
      this.selectedLabel = this.config.createLabel || 'Create New';
      this.valueChange.emit(this.config.createValue);
    }
    this.createClick.emit();
    this.closeDropdown();
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.options.length === 0) {
      this.loadOptions();
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}

