import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, firstValueFrom, EMPTY } from 'rxjs';
import { SearchService } from '../../../../core/services/search.service';
import { GlobalSearchResponse, SearchType, HierarchyResponse } from '../../../../core/interfaces/search.interface';
import { HierarchyTreeComponent } from './hierarchy-tree/hierarchy-tree.component';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, HierarchyTreeComponent],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchResults') searchResults!: ElementRef<HTMLDivElement>;

  searchQuery = '';
  searchResults$ = new Subject<string>();
  results: GlobalSearchResponse | null = null;
  loading = false;
  error: string | null = null;
  isOpen = false;
  selectedResult: { type: SearchType; id: string; hierarchyResponse: HierarchyResponse | null } | null = null;
  loadingHierarchy = false;

  private destroy$ = new Subject<void>();

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    // Debounce search queries
    this.searchResults$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.results = null;
          this.loading = false;
          return EMPTY;
        }
        this.loading = true;
        this.error = null;
        return this.searchService.search({ q: query, page: 1, limit: 10 });
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.results = response.data;
        this.loading = false;
        this.error = null;
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.error || 'Failed to search. Please try again.';
        this.results = null;
      }
    });

    // Handle keyboard shortcut (Cmd/Ctrl + K)
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
      this.isOpen = true;
    }
  };

  onSearchChange() {
    if (this.searchQuery.trim()) {
      this.isOpen = true;
    }
    this.searchResults$.next(this.searchQuery);
  }

  onInputFocus() {
    if (this.results && this.searchQuery.trim()) {
      this.isOpen = true;
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.results = null;
    this.isOpen = false;
    this.selectedResult = null;
    this.error = null;
    this.searchInput.nativeElement.focus();
  }

  async onResultClick(type: SearchType, id: string) {
    this.loadingHierarchy = true;
    this.selectedResult = { type, id, hierarchyResponse: null };

    try {
      const response = await firstValueFrom(
        this.searchService.getHierarchy(type, id).pipe(takeUntil(this.destroy$))
      );
      if (response?.data) {
        this.selectedResult = { type, id, hierarchyResponse: response.data };
      }
    } catch (error: any) {
      this.error = error.error?.error || 'Failed to load hierarchy.';
      this.selectedResult = null;
    } finally {
      this.loadingHierarchy = false;
    }
  }

  backToResults() {
    this.selectedResult = null;
  }

  closeSearch() {
    this.isOpen = false;
    this.selectedResult = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.searchResults && !this.searchResults.nativeElement.contains(event.target as Node)) {
      if (this.searchInput && !this.searchInput.nativeElement.contains(event.target as Node)) {
        this.isOpen = false;
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeSearch();
    }
    // Prevent Cmd/Ctrl+K from bubbling up
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.stopPropagation();
    }
  }

  getTotalResults(): number {
    if (!this.results) return 0;
    return this.results.pagination.totalResults;
  }

  hasResults(): boolean {
    return this.results !== null && this.getTotalResults() > 0;
  }
}

