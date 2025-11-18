import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface CountryCode {
  code: string;
  label: string;
  dialCode: string;
}

@Component({
  selector: 'app-phone-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './phone-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  styles: ``
})
export class PhoneInputComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() countries: CountryCode[] = [];
  @Input() placeholder: string = 'Enter phone number';
  @Input() selectPosition: 'start' | 'end' = 'start';
  @Input() defaultCountry: string = 'IN'; // India as default
  @Input() error: boolean = false; // Error state for form validation

  selectedCountry: string = '';
  phoneNumber: string = '';
  private _disabled: boolean = false;

  private onChange: ((value: string) => void) | null = null;
  private onTouched: (() => void) | null = null;

  // Default countries list with India first
  defaultCountries: CountryCode[] = [
    { code: 'IN', label: '+91', dialCode: '+91' },
    { code: 'US', label: '+1', dialCode: '+1' },
    { code: 'GB', label: '+44', dialCode: '+44' },
    { code: 'CA', label: '+1', dialCode: '+1' },
    { code: 'AU', label: '+61', dialCode: '+61' },
    { code: 'DE', label: '+49', dialCode: '+49' },
    { code: 'FR', label: '+33', dialCode: '+33' },
    { code: 'JP', label: '+81', dialCode: '+81' },
    { code: 'CN', label: '+86', dialCode: '+86' },
    { code: 'BR', label: '+55', dialCode: '+55' },
  ];

  get disabled(): boolean {
    return this._disabled;
  }

  get availableCountries(): CountryCode[] {
    return this.countries.length > 0 ? this.countries : this.defaultCountries;
  }

  ngOnInit() {
    this.initializeCountry();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultCountry'] || changes['countries']) {
      this.initializeCountry();
    }
  }

  private initializeCountry(): void {
    const countries = this.availableCountries;
    if (countries.length > 0) {
      // Find India first, or use defaultCountry, or fallback to first country
      const defaultCountry = countries.find(c => c.code === this.defaultCountry) || 
                            countries.find(c => c.code === 'IN') || 
                            countries[0];
      this.selectedCountry = defaultCountry.code;
    }
  }

  handleCountryChange(event: Event): void {
    if (this._disabled) return;
    const newCountry = (event.target as HTMLSelectElement).value;
    this.selectedCountry = newCountry;
    this.emitValue();
  }

  handlePhoneNumberChange(event: Event): void {
    if (this._disabled) return;
    const newPhoneNumber = (event.target as HTMLInputElement).value;
    this.phoneNumber = newPhoneNumber;
    this.emitValue();
  }

  private emitValue(): void {
    const fullNumber = this.getFullPhoneNumber();
    if (this.onChange) {
      this.onChange(fullNumber);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }

  private getFullPhoneNumber(): string {
    const country = this.availableCountries.find(c => c.code === this.selectedCountry);
    const dialCode = country?.dialCode || '';
    // Return just the phone number without dial code for form value
    // Or return full number with dial code if needed
    return this.phoneNumber.trim();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (value) {
      // Try to extract country code and phone number from value
      // For now, just set the phone number
      this.phoneNumber = value;
    } else {
      this.phoneNumber = '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }
}
