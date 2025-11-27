import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Meter, MeterPayload, MeterPaginationParams } from '../interfaces/meter.interface';
import { PaginatedResponse } from '../interfaces/module.interface';

@Injectable({
  providedIn: 'root'
})
export class MetersService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/meters`;

  /**
   * Get paginated list of meters
   * @param params Pagination and filter parameters
   * @returns Observable of paginated meters response
   */
  getMeters(params: MeterPaginationParams = {}): Observable<PaginatedResponse<Meter>> {
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
    if (params.entityId) {
      httpParams = httpParams.set('entityId', params.entityId);
    }

    return this.http.get<PaginatedResponse<Meter>>(this.apiUrl, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error fetching meters:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single meter by ID
   * @param id Meter ID
   * @returns Observable of meter
   */
  getMeterById(id: string): Observable<{ success: boolean; message: string; data: Meter }> {
    return this.http.get<{ success: boolean; message: string; data: Meter }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching meter:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new meter
   * @param meter Meter data
   * @returns Observable of created meter
   */
  createMeter(meter: MeterPayload): Observable<{ success: boolean; message: string; data: Meter }> {
    return this.http.post<{ success: boolean; message: string; data: Meter }>(this.apiUrl, meter).pipe(
      catchError((error) => {
        console.error('Error creating meter:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing meter
   * @param id Meter ID
   * @param meter Updated meter data
   * @returns Observable of updated meter
   */
  updateMeter(id: string, meter: Partial<MeterPayload>): Observable<{ success: boolean; message: string; data: Meter }> {
    return this.http.patch<{ success: boolean; message: string; data: Meter }>(`${this.apiUrl}/${id}`, meter).pipe(
      catchError((error) => {
        console.error('Error updating meter:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a meter
   * @param id Meter ID
   * @returns Observable of deletion response
   */
  deleteMeter(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting meter:', error);
        return throwError(() => error);
      })
    );
  }
}

