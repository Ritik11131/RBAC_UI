import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, RolePayload, RolePaginationParams, PaginatedRolesResponse } from '../interfaces/role.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  /**
   * Get logged-in user's entity ID
   */
  private getLoggedInEntityId(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.entity_id || null;
  }

  /**
   * Get paginated list of roles
   * Automatically includes logged-in user's entityId in the request
   * @param params Pagination and filter parameters
   * @returns Observable of paginated roles response
   */
  getRoles(params: RolePaginationParams = {}): Observable<PaginatedRolesResponse> {
    let httpParams = new HttpParams();

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
    
    // Always include logged-in user's entityId
    const loggedInEntityId = params.entityId || this.getLoggedInEntityId();
    if (loggedInEntityId) {
      httpParams = httpParams.set('entityId', loggedInEntityId);
    }

    return this.http.get<PaginatedRolesResponse>(this.apiUrl, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error fetching roles:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single role by ID
   * @param id Role ID
   * @returns Observable of role
   */
  getRoleById(id: string): Observable<{ success: boolean; message: string; data: Role }> {
    return this.http.get<{ success: boolean; message: string; data: Role }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new role
   * @param role Role data
   * @returns Observable of created role
   */
  createRole(role: RolePayload): Observable<{ success: boolean; message: string; data: Role }> {
    return this.http.post<{ success: boolean; message: string; data: Role }>(this.apiUrl, role).pipe(
      catchError((error) => {
        console.error('Error creating role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing role
   * @param id Role ID
   * @param role Updated role data
   * @returns Observable of updated role
   */
  updateRole(id: string, role: Partial<RolePayload>): Observable<{ success: boolean; message: string; data: Role }> {
    return this.http.patch<{ success: boolean; message: string; data: Role }>(`${this.apiUrl}/${id}`, role).pipe(
      catchError((error) => {
        console.error('Error updating role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a role
   * @param id Role ID
   * @returns Observable of deletion response
   */
  deleteRole(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting role:', error);
        return throwError(() => error);
      })
    );
  }
}

