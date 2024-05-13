import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AspectRatios, ImageElement } from '../interfaces/image-element';

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
  calculateWH(image: ImageElement): { w: number, h: number, cW: number, cH: number } {
    let cW = 320;
    let cH = 320;
    let w = 320;
    let h = 320;
    const shape = image.shape;
    const aspectRatios: AspectRatios = {
      'circle': { ratio: 1, divisor: 1 },
      'rect': { ratio: 1, divisor: 1 },
      'ellipse': { ratio: 1, divisor: 1 },
      'rect_3_2': { ratio: 3, divisor: 2 },
      'rect_4_3': { ratio: 4, divisor: 3 },
      'rect_16_9': { ratio: 16, divisor: 9 },
      'rect_1_1': { ratio: 1, divisor: 1 },
      'rect_5_4': { ratio: 5, divisor: 4 },
      'rect_3_1': { ratio: 3, divisor: 1 },
      'rect_7_5': { ratio: 7, divisor: 5 },
      'rect_2_3': { ratio: 2, divisor: 3 },
      'rect_3_4': { ratio: 3, divisor: 4 },
      'rect_9_16': { ratio: 9, divisor: 16 },
      'rect_4_5': { ratio: 4, divisor: 5 },
      'rect_5_7': { ratio: 5, divisor: 7 }
    };

    // Find the closest match for the shape's aspect ratio from the defined list
    const closestMatch = aspectRatios[shape];

    // If the shape is found in the list, calculate width and height
    if (closestMatch) {
      const r = image.r; // Assuming r is the radius
      cW = w;
      cH = (cW * closestMatch.ratio) / closestMatch.divisor;
      w = r * 2;
      h = (w * closestMatch.ratio) / closestMatch.divisor;
    } else {
      console.error('Aspect ratio not defined for shape:', shape);
    }

    return { w, h, cW, cH };
  }
}
