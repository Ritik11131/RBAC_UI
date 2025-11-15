import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { UsersService } from '../../../../core/services/users.service';
import { User, UserUpdatePayload } from '../../../../core/interfaces/user.interface';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-meta-card',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    InputFieldComponent,
    ButtonComponent,
    LabelComponent,
  ],
  templateUrl: './user-meta-card.component.html',
  styles: ``
})
export class UserMetaCardComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() userUpdated = new EventEmitter<User>();

  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  isOpen = false;
  isLoading = false;
  form!: FormGroup;

  // Display properties derived from user
  displayUser: {
    firstName: string;
    lastName: string;
    role: string;
    location: string;
    avatar: string;
    social: {
      facebook: string;
      x: string;
      linkedin: string;
      instagram: string;
    };
    email: string;
    phone: string;
    bio: string;
  } = {
    firstName: '',
    lastName: '',
    role: 'User',
    location: '',
    avatar: '/images/user/owner.jpg',
    social: {
      facebook: '',
      x: '',
      linkedin: '',
      instagram: '',
    },
    email: '',
    phone: '',
    bio: '',
  };

  ngOnInit(): void {
    this.initializeForm();
    this.updateDisplayUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.updateDisplayUser();
      if (this.form) {
        this.populateForm();
      }
    }
  }

  /**
   * Initialize reactive form
   */
  initializeForm(): void {
    this.form = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]],
      phone: [''],
      bio: [''],
      facebook: [''],
      x: [''],
      linkedin: [''],
      instagram: [''],
    });
  }

  /**
   * Update display user from input user
   */
  updateDisplayUser(): void {
    if (!this.user) return;

    // Split name into first and last
    const nameParts = (this.user.name || '').split(' ');
    this.displayUser.firstName = nameParts[0] || '';
    this.displayUser.lastName = nameParts.slice(1).join(' ') || '';
    this.displayUser.email = this.user.email || '';
    this.displayUser.phone = this.user.mobile_no || '';
    this.displayUser.bio = this.user.attributes?.bio || '';
    this.displayUser.social = {
      facebook: this.user.attributes?.social?.facebook || '',
      x: this.user.attributes?.social?.x || '',
      linkedin: this.user.attributes?.social?.linkedin || '',
      instagram: this.user.attributes?.social?.instagram || '',
    };
    this.displayUser.location = this.user.attributes?.address?.cityState || '';
    this.displayUser.role = 'User'; // Could be fetched from role service if needed

    this.populateForm();
  }

  /**
   * Populate form with current user data
   */
  populateForm(): void {
    if (!this.form) return;

    this.form.patchValue({
      firstName: this.displayUser.firstName,
      lastName: this.displayUser.lastName,
      email: this.displayUser.email,
      phone: this.displayUser.phone,
      bio: this.displayUser.bio,
      facebook: this.displayUser.social.facebook,
      x: this.displayUser.social.x,
      linkedin: this.displayUser.social.linkedin,
      instagram: this.displayUser.social.instagram,
    });
  }

  openModal(): void {
    this.isOpen = true;
    this.populateForm();
  }

  closeModal(): void {
    this.isOpen = false;
  }

  /**
   * Handle save - update user via PATCH API
   */
  handleSave(): void {
    if (!this.user || !this.form.valid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.form.value;

    // Prepare update payload
    const payload: UserUpdatePayload = {
      name: `${formValue.firstName} ${formValue.lastName}`.trim(),
      mobile_no: formValue.phone || undefined,
      attributes: {
        bio: formValue.bio || undefined,
        social: {
          facebook: formValue.facebook || undefined,
          x: formValue.x || undefined,
          linkedin: formValue.linkedin || undefined,
          instagram: formValue.instagram || undefined,
        },
      },
    };

    // Remove undefined values
    if (!payload.attributes!.bio) delete payload.attributes!.bio;
    if (!payload.attributes!.social!.facebook) delete payload.attributes!.social!.facebook;
    if (!payload.attributes!.social!.x) delete payload.attributes!.social!.x;
    if (!payload.attributes!.social!.linkedin) delete payload.attributes!.social!.linkedin;
    if (!payload.attributes!.social!.instagram) delete payload.attributes!.social!.instagram;

    this.usersService.updateUser(this.user.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.userUpdated.emit(response.data);
            this.closeModal();
          } else {
            console.error('Failed to update user:', response.message);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
