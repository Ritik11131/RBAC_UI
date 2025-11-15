import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/interfaces/user.interface';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserInfoCardComponent,
    UserAddressCardComponent,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit, OnDestroy {
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load current user's profile data
   */
  loadUserProfile(): void {
    const loggedInUser = this.authService.getCurrentUser();
    if (!loggedInUser?.id) {
      console.error('No logged-in user found');
      return;
    }

    this.isLoading = true;
    this.usersService.getUserById(loggedInUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUser = response.data;
          } else {
            console.error('Failed to load user profile:', response.message);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Handle user update from child components
   */
  onUserUpdated(updatedUser: User): void {
    this.currentUser = updatedUser;
    // Optionally reload to get latest data
    this.loadUserProfile();
  }
}
