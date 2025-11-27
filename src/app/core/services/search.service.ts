import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  GlobalSearchApiResponse, 
  PathApiResponse, 
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
   * Get path for a specific resource (path-only, no siblings)
   * @param type Resource type
   * @param id Resource ID
   * @returns Observable of path data (linear array)
   * 
   * Note: Currently returns path-only (no pagination support).
   * Future-proof: Structure allows for potential pagination/expansion features.
   */
  getPath(
    type: SearchType,
    id: string
  ): Observable<PathApiResponse> {
    const url = `${this.apiUrl}/${type}/${id}/hierarchy`;
    return this.http.get<PathApiResponse>(url).pipe(
      catchError(error => {
        console.error('Path fetch error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * @deprecated Use getPath instead. This method is kept for backward compatibility.
   */
  getHierarchy(type: SearchType, id: string): Observable<PathApiResponse> {
    return this.getPath(type, id);
  }
}

