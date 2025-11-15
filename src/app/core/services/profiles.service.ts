import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profile, ProfilePayload, ProfilePaginationParams } from '../interfaces/profile.interface';
import { PaginatedResponse } from '../interfaces/module.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfilesService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/profiles`;

  /**
   * Get paginated list of profiles
   * @param params Pagination and filter parameters
   * @returns Observable of paginated profiles response
   */
  getProfiles(params: ProfilePaginationParams = {}): Observable<PaginatedResponse<Profile>> {
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

    return this.http.get<PaginatedResponse<Profile>>(this.apiUrl, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error fetching profiles:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single profile by ID
   * @param id Profile ID
   * @returns Observable of profile
   */
  getProfileById(id: string): Observable<{ success: boolean; message: string; data: Profile }> {
    return this.http.get<{ success: boolean; message: string; data: Profile }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new profile
   * @param profile Profile data
   * @returns Observable of created profile
   */
  createProfile(profile: ProfilePayload): Observable<{ success: boolean; message: string; data: Profile }> {
    return this.http.post<{ success: boolean; message: string; data: Profile }>(this.apiUrl, profile).pipe(
      catchError((error) => {
        console.error('Error creating profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing profile
   * @param id Profile ID
   * @param profile Updated profile data
   * @returns Observable of updated profile
   */
  updateProfile(id: string, profile: Partial<ProfilePayload>): Observable<{ success: boolean; message: string; data: Profile }> {
    return this.http.patch<{ success: boolean; message: string; data: Profile }>(`${this.apiUrl}/${id}`, profile).pipe(
      catchError((error) => {
        console.error('Error updating profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a profile
   * @param id Profile ID
   * @returns Observable of deletion response
   */
  deleteProfile(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting profile:', error);
        return throwError(() => error);
      })
    );
  }
}

