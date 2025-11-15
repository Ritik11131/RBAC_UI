import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User, DecodedToken, Permission } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly REMEMBER_ME_KEY = 'remember_me';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public permissions$ = this.permissionsSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getUser();

    if (token && user && this.isTokenValid(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      const decodedToken = this.decodeToken(token);
      if (decodedToken) {
        this.permissionsSubject.next(decodedToken.permissions || []);
      }
    } else {
      this.logout();
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data.token) {
          this.setToken(response.data.token, rememberMe);
          this.setUser(response.data.user, rememberMe);
          this.currentUserSubject.next(response.data.user);
          this.isAuthenticatedSubject.next(true);
          
          const decodedToken = this.decodeToken(response.data.token);
          if (decodedToken) {
            this.permissionsSubject.next(decodedToken.permissions || []);
          }
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    
    this.currentUserSubject.next(null);
    this.permissionsSubject.next([]);
    this.isAuthenticatedSubject.next(false);
    
    this.router.navigate(['/signin']);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
    if (rememberMe) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set token in storage
   */
  private setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.REMEMBER_ME_KEY, 'true');
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.REMEMBER_ME_KEY, 'false');
    }
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    const rememberMe = localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
    const userStr = rememberMe 
      ? localStorage.getItem(this.USER_KEY)
      : sessionStorage.getItem(this.USER_KEY) || localStorage.getItem(this.USER_KEY);
    
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Set user in storage
   */
  private setUser(user: User, rememberMe: boolean): void {
    const userStr = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(this.USER_KEY, userStr);
    } else {
      sessionStorage.setItem(this.USER_KEY, userStr);
    }
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current permissions synchronously
   */
  getPermissions(): Permission[] {
    return this.permissionsSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && this.isTokenValid(token);
  }

  /**
   * Check if token is valid (not expired)
   */
  private isTokenValid(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return false;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if user has permission for a module
   */
  hasModulePermission(moduleId: string, requireWrite: boolean = false): boolean {
    const permissions = this.getPermissions();
    const permission = permissions.find(p => p.moduleId === moduleId);
    
    if (!permission) {
      return false;
    }
    
    if (requireWrite) {
      return permission.write === true;
    }
    
    return permission.read === true || permission.write === true;
  }

  /**
   * Check if user has permission by module name
   */
  hasModulePermissionByName(moduleName: string, requireWrite: boolean = false): boolean {
    const permissions = this.getPermissions();
    const permission = permissions.find(p => p.name.toLowerCase() === moduleName.toLowerCase());
    
    if (!permission) {
      return false;
    }
    
    if (requireWrite) {
      return permission.write === true;
    }
    
    return permission.read === true || permission.write === true;
  }

  /**
   * Get all enabled module IDs
   */
  getEnabledModuleIds(): string[] {
    return this.getPermissions().map(p => p.moduleId);
  }

  /**
   * Get all enabled module names
   */
  getEnabledModuleNames(): string[] {
    return this.getPermissions().map(p => p.name);
  }
}

