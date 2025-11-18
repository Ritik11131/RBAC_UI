import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LabelComponent } from '../../label/label.component';
import { InputFieldComponent } from '../../input/input-field.component';
import { PhoneInputComponent } from '../../group-input/phone-input/phone-input.component';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';

@Component({
  selector: 'app-input-group',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelComponent,
    InputFieldComponent,
    PhoneInputComponent,
    ComponentCardComponent,
  ],
  templateUrl: './input-group.component.html',
  styles: ``
})
export class InputGroupComponent {
  // Form controls for phone inputs
  phoneStart = new FormControl('');
  phoneEnd = new FormControl('');

  // Optional: Custom countries list (if not provided, defaults will be used)
  countries = [
    { code: 'IN', label: '+91', dialCode: '+91' },
    { code: 'US', label: '+1', dialCode: '+1' },
    { code: 'GB', label: '+44', dialCode: '+44' },
    { code: 'CA', label: '+1', dialCode: '+1' },
    { code: 'AU', label: '+61', dialCode: '+61' },
  ];

  constructor() {
    // Listen to form control changes
    this.phoneStart.valueChanges.subscribe(value => {
      console.log('Phone (start) updated:', value);
    });
    this.phoneEnd.valueChanges.subscribe(value => {
      console.log('Phone (end) updated:', value);
    });
  }
}
