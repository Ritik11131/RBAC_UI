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
  selector: 'app-user-info-card',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
  ],
  templateUrl: './user-info-card.component.html',
  styles: ``
})
export class UserInfoCardComponent implements OnInit, OnChanges {
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
    email: string;
    phone: string;
    bio: string;
  } = {
    firstName: '',
    lastName: '',
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
      },
    };

    // Remove undefined values
    if (!payload.attributes!.bio) delete payload.attributes!.bio;

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
