import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to generate page numbers for pagination
 */
@Pipe({
  name: 'tablePageNumbers',
  standalone: true,
  pure: true
})
export class TablePageNumbersPipe implements PipeTransform {
  transform(currentPage: number, totalPages: number, maxVisible: number = 10): number[] {
    if (totalPages <= 0) {
      return [];
    }
    
    const pages: number[] = [];
    const maxPages = Math.min(totalPages, maxVisible);
    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    const adjustedStartPage = Math.max(1, endPage - maxVisible + 1);
    
    for (let i = adjustedStartPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}

