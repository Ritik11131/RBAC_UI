import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  GlobalSearchApiResponse, 
  HierarchyApiResponse, 
  SearchParams,
  SearchType 
} from '../interfaces/search.interface';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/search`;

  /**
   * Perform global search across all resource types
   * @param params Search parameters
   * @returns Observable of search results
   */
  search(params: SearchParams): Observable<GlobalSearchApiResponse> {
    let httpParams = new HttpParams()
      .set('q', params.q)
      .set('page', params.page?.toString() || '1')
      .set('limit', params.limit?.toString() || '10');

    // Handle type filter
    if (params.type) {
      const types = Array.isArray(params.type) 
        ? params.type.join(',') 
        : params.type;
      httpParams = httpParams.set('type', types);
    }

    return this.http.get<GlobalSearchApiResponse>(this.apiUrl, { params: httpParams }).pipe(
      catchError(error => {
        console.error('Search error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get hierarchy for a specific resource
   * @param type Resource type
   * @param id Resource ID
   * @param depth Optional depth limit
   * @param paginateRootChildren Optional pagination for root children
   * @param page Optional page number for paginated root children
   * @param limit Optional limit for paginated root children
   * @returns Observable of hierarchy data
   */
  getHierarchy(
    type: SearchType,
    id: string,
    depth?: number,
    paginateRootChildren?: boolean,
    page?: number,
    limit?: number
  ): Observable<HierarchyApiResponse> {
    let httpParams = new HttpParams();

    if (depth !== undefined) {
      httpParams = httpParams.set('depth', depth.toString());
    }
    if (paginateRootChildren !== undefined) {
      httpParams = httpParams.set('paginateRootChildren', paginateRootChildren.toString());
    }
    if (page !== undefined) {
      httpParams = httpParams.set('page', page.toString());
    }
    if (limit !== undefined) {
      httpParams = httpParams.set('limit', limit.toString());
    }

    const url = `${this.apiUrl}/${type}/${id}/hierarchy`;
    return this.http.get<HierarchyApiResponse>(url, { params: httpParams }).pipe(
      catchError(error => {
        console.error('Hierarchy fetch error:', error);
        return throwError(() => error);
      })
    );
  }
}

