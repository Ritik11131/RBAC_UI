import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Module, PaginatedResponse, PaginationParams } from '../interfaces/module.interface';

@Injectable({
  providedIn: 'root'
})
export class ModulesService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/modules`;

  /**
   * Get paginated list of modules
   * @param params Pagination and filter parameters
   * @returns Observable of paginated modules response
   */
  getModules(params: PaginationParams = {}): Observable<PaginatedResponse<Module>> {
    let httpParams = new HttpParams();

    // Add pagination parameters
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }

    return this.http.get<PaginatedResponse<Module>>(this.apiUrl, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error fetching modules:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single module by ID
   * @param id Module ID
   * @returns Observable of module
   */
  getModuleById(id: string): Observable<{ success: boolean; message: string; data: Module }> {
    return this.http.get<{ success: boolean; message: string; data: Module }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching module:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new module
   * @param module Module data
   * @returns Observable of created module
   */
  createModule(module: Partial<Module>): Observable<{ success: boolean; message: string; data: Module }> {
    return this.http.post<{ success: boolean; message: string; data: Module }>(this.apiUrl, module).pipe(
      catchError((error) => {
        console.error('Error creating module:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing module
   * @param id Module ID
   * @param module Updated module data
   * @returns Observable of updated module
   */
  updateModule(id: string, module: Partial<Module>): Observable<{ success: boolean; message: string; data: Module }> {
    return this.http.patch<{ success: boolean; message: string; data: Module }>(`${this.apiUrl}/${id}`, module).pipe(
      catchError((error) => {
        console.error('Error updating module:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a module
   * @param id Module ID
   * @returns Observable of deletion response
   */
  deleteModule(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting module:', error);
        return throwError(() => error);
      })
    );
  }
}

