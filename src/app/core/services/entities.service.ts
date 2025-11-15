import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Entity, EntityPayload, EntityPaginationParams, PaginatedEntitiesResponse } from '../interfaces/entity.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/entities`;

  /**
   * Get logged-in user's entity ID
   */
  private getLoggedInEntityId(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.entity_id || null;
  }

  /**
   * Get paginated list of entities
   * Automatically includes logged-in user's entityId in the request
   * @param params Pagination and filter parameters
   * @returns Observable of paginated entities response
   */
  getEntities(params: EntityPaginationParams = {}): Observable<PaginatedEntitiesResponse> {
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
    
    // Always include logged-in user's entityId
    const loggedInEntityId = params.entityId || this.getLoggedInEntityId();
    if (loggedInEntityId) {
      httpParams = httpParams.set('entityId', loggedInEntityId);
    }

    return this.http.get<PaginatedEntitiesResponse>(this.apiUrl, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error fetching entities:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single entity by ID
   * @param id Entity ID
   * @returns Observable of entity
   */
  getEntityById(id: string): Observable<{ success: boolean; message: string; data: Entity }> {
    return this.http.get<{ success: boolean; message: string; data: Entity }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching entity:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new entity
   * Automatically includes logged-in user's entityId as root entity_id if not provided
   * @param entity Entity data
   * @returns Observable of created entity
   */
  createEntity(entity: EntityPayload): Observable<{ success: boolean; message: string; data: Entity }> {
    // If entity_id is not provided, use logged-in user's entityId
    const payload: EntityPayload = {
      ...entity,
      entity_id: entity.entity_id || this.getLoggedInEntityId() || undefined,
    };

    return this.http.post<{ success: boolean; message: string; data: Entity }>(this.apiUrl, payload).pipe(
      catchError((error) => {
        console.error('Error creating entity:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing entity
   * @param id Entity ID
   * @param entity Updated entity data
   * @returns Observable of updated entity
   */
  updateEntity(id: string, entity: Partial<EntityPayload>): Observable<{ success: boolean; message: string; data: Entity }> {
    return this.http.patch<{ success: boolean; message: string; data: Entity }>(`${this.apiUrl}/${id}`, entity).pipe(
      catchError((error) => {
        console.error('Error updating entity:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an entity
   * @param id Entity ID
   * @returns Observable of deletion response
   */
  deleteEntity(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting entity:', error);
        return throwError(() => error);
      })
    );
  }
}

