import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DevelopmentService {
  constructor(private fb: FormBuilder) { }
  public ReportDate: any = new Date();
  public formattedDate: any;
  public getDate() {
    const year = this.ReportDate.getFullYear();
    const month = String(this.ReportDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to get correct month (as it's zero-based)
    const day = String(this.ReportDate.getDate()).padStart(2, '0');
    this.formattedDate = `${year}-${month}-${day}`;
    return this.formattedDate;
  }

  markFormGroupTouched(formGroup: FormGroup) {
  Object.keys(formGroup.controls).forEach(controlName => {
    const control = formGroup?.get(controlName);

    if (control instanceof FormControl) {
      if (!control.touched) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    } else if (control instanceof FormGroup) {
      this.markFormGroupTouched(control);
    } else if (control instanceof FormArray) {
      this.markFormArrayTouched(control);
    }
  });
}
  markFormArrayTouched(formArray: FormArray) {
    formArray.controls.forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        this.markFormArrayTouched(control);
      }
    });
  }
  setControl(formGroup: FormGroup, controlName: string, defaultValue: any, validators?: any[]): void {
    if (formGroup.get(controlName)) {
      return;
    }
    const control = this.fb.control(defaultValue, validators);
    control.markAsUntouched;
    formGroup.addControl(controlName, control);
  }
  removeControls(formGroup: FormGroup, controlNames: string[]): void {
    controlNames.forEach(controlName => {
      if (formGroup.get(controlName)) {
        formGroup.removeControl(controlName);
      }
    });
  }
  filterAndSetValue(control: AbstractControl | null) {
    const value = control?.value;
    if (value !== undefined && value !== null) {
      const filteredValue = value.toString().replace(/^0+(?=\d)/, ''); // Remove leading zeros
      const intValue = parseInt(filteredValue, 10) || 0; // Convert to integer, default to 0 if NaN
      intValue.toString() !== filteredValue && control?.setValue(intValue); // Set the filtered and converted value
    }
  };
}
