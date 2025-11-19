import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ModalComponent } from '../../ui/modal/modal.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { UsersService } from '../../../../core/services/users.service';
import { User, UserUpdatePayload } from '../../../../core/interfaces/user.interface';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-address-card',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // InputFieldComponent,
    ButtonComponent,
    LabelComponent,
    ModalComponent,
  ],
  templateUrl: './user-address-card.component.html',
  styles: ``
})
export class UserAddressCardComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() userUpdated = new EventEmitter<User>();

  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  isOpen = false;
  isLoading = false;
  form!: FormGroup;

  // Display properties derived from user
  displayAddress: {
    country: string;
    cityState: string;
    postalCode: string;
    taxId: string;
  } = {
    country: '',
    cityState: '',
    postalCode: '',
    taxId: '',
  };

  ngOnInit(): void {
    this.initializeForm();
    this.updateDisplayAddress();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.updateDisplayAddress();
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
      country: [''],
      cityState: [''],
      postalCode: [''],
      taxId: [''],
    });
  }

  /**
   * Update display address from input user
   */
  updateDisplayAddress(): void {
    if (!this.user) return;

    this.displayAddress = {
      country: this.user.attributes?.address?.country || '',
      cityState: this.user.attributes?.address?.cityState || '',
      postalCode: this.user.attributes?.address?.postalCode || '',
      taxId: this.user.attributes?.address?.taxId || '',
    };

    this.populateForm();
  }

  /**
   * Populate form with current address data
   */
  populateForm(): void {
    if (!this.form) return;

    this.form.patchValue({
      country: this.displayAddress.country,
      cityState: this.displayAddress.cityState,
      postalCode: this.displayAddress.postalCode,
      taxId: this.displayAddress.taxId,
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
   * Handle save - update user address via PATCH API
   */
  handleSave(): void {
    if (!this.user || !this.form.valid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.form.value;

    // Prepare update payload with address in attributes
    const payload: UserUpdatePayload = {
      attributes: {
        address: {
          country: formValue.country || undefined,
          cityState: formValue.cityState || undefined,
          postalCode: formValue.postalCode || undefined,
          taxId: formValue.taxId || undefined,
        },
      },
    };

    // Remove undefined values
    const address: any = {};
    if (formValue.country) address.country = formValue.country;
    if (formValue.cityState) address.cityState = formValue.cityState;
    if (formValue.postalCode) address.postalCode = formValue.postalCode;
    if (formValue.taxId) address.taxId = formValue.taxId;

    if (Object.keys(address).length > 0) {
      payload.attributes!.address = address;
    } else {
      payload.attributes!.address = {};
    }

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
