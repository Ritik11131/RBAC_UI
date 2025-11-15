import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserCreatePayload, UserUpdatePayload, UserPaginationParams, PaginatedUsersResponse } from '../interfaces/user.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  /**
   * Get logged-in user's entity ID
   */
  private getLoggedInEntityId(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.entity_id || null;
  }

  /**
   * Get paginated list of users
   * Automatically includes logged-in user's entityId in the request
   * @param params Pagination and filter parameters
   * @returns Observable of paginated users response
   */
  getUsers(params: UserPaginationParams = {}): Observable<PaginatedUsersResponse> {
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

    return this.http.get<PaginatedUsersResponse>(this.apiUrl, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error fetching users:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single user by ID
   * @param id User ID
   * @returns Observable of user
   */
  getUserById(id: string): Observable<{ success: boolean; message: string; data: User }> {
    return this.http.get<{ success: boolean; message: string; data: User }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new user
   * @param user User data
   * @returns Observable of created user
   */
  createUser(user: UserCreatePayload): Observable<{ success: boolean; message: string; data: User }> {
    return this.http.post<{ success: boolean; message: string; data: User }>(this.apiUrl, user).pipe(
      catchError((error) => {
        console.error('Error creating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param user Updated user data
   * @returns Observable of updated user
   */
  updateUser(id: string, user: UserUpdatePayload): Observable<{ success: boolean; message: string; data: User }> {
    return this.http.patch<{ success: boolean; message: string; data: User }>(`${this.apiUrl}/${id}`, user).pipe(
      catchError((error) => {
        console.error('Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Observable of deletion response
   */
  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting user:', error);
        return throwError(() => error);
      })
    );
  }
}

