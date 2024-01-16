import { Directive, ElementRef, HostListener, Input, Renderer2, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { NgControl, AbstractControl, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[formControlName]'
})
export class AsteriskDirective implements OnInit, OnChanges {
  @Input('formControlName') formControlName: string | undefined;
  blured: boolean = false;
  isTouched: boolean | null | undefined = false;
  @Input() label!: string | undefined;
  private valueChangesSubscription: Subscription | undefined;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ngControl: NgControl | null) {
    const readonlyAttribute = this.el.nativeElement.getAttribute('readonly');
    this.renderer.setAttribute(this.el.nativeElement, 'tabindex', (readonlyAttribute !== null) ? '-1' : '0');

  }
  ngOnInit() {
    this.subscribeToValueChanges();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formControlName']) {
      this.addAsterisk();
    }
  }
  @HostListener('blur')
  onBlur() {
    if (this.formControlName && this.ngControl?.control) {
      this.ngControl?.control.markAsTouched();
      this.isTouched = this.ngControl.control?.touched;
      this.addAsterisk();
    }
  }
  private subscribeToValueChanges() {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
    if (this.ngControl?.valueChanges) {
      this.valueChangesSubscription = this.ngControl.valueChanges.subscribe((value) => {
        this.isTouched = this.ngControl?.touched;
        this.addAsterisk();
      });
    }
  }
  private addAsterisk() {
    const formGroup = this.el.nativeElement.closest('.form-group, td, th, .form-floating');
    if (!formGroup) return;

    const controlElements = formGroup.querySelectorAll('.form-control, .form-select, .form-label');
    controlElements?.forEach((element: any) => {
      this.renderer.removeClass(element, 'border-danger');
      this.renderer.removeClass(element, 'text-danger')
    });
    const inputGroupText = formGroup.querySelectorAll('.input-group-text');
    inputGroupText?.forEach((element: any) => {
      this.renderer.removeClass(element, 'border-danger');
      this.renderer.removeClass(element, 'bg-danger');
      this.renderer.removeClass(element, 'text-white');
    });
    formGroup.querySelector('.error')?.remove();
    formGroup.querySelector('span.text-danger')?.remove();
    const formLabel = formGroup.querySelector('.form-label');
    const labelText = formLabel?.textContent.trim() || this.label || 'This';
    const control = this.getFormControl();
    if (formLabel && control) {
      if (this.isControlRequired(this.getFormControl())) {
        const asteriskSpan = this.renderer.createElement('span');
        this.renderer.addClass(asteriskSpan, 'text-danger');
        this.renderer.appendChild(asteriskSpan, this.renderer.createText(' *'));
        this.renderer.appendChild(formLabel, asteriskSpan);
      }
      if (this.isTouched && !control.valid) {
        const errorKey = Object.keys(control.errors || {})[0];
        const errorDetails = errorKey ? this.getErrorDetails(errorKey, control.errors![errorKey], labelText) : '';
        const requiredError = this.renderer.createElement('small');
        this.renderer.addClass(requiredError, 'error');
        this.renderer.addClass(requiredError, 'text-danger');
        if (formGroup.classList.contains('row')) {
          this.renderer.addClass(requiredError, 'col-12');
          this.renderer.addClass(requiredError, 'text-end')
        } else { this.renderer.addClass(requiredError, 'position-absolute') };
        requiredError.textContent = errorDetails;
        this.renderer.appendChild(formGroup, requiredError);
        controlElements?.forEach((element: any) => {
          this.renderer.addClass(element, 'border-danger')
          this.renderer.addClass(element, 'text-danger')
        });
        inputGroupText?.forEach((element: any) => {
          this.renderer.addClass(element, 'border-danger');
          this.renderer.addClass(element, 'bg-danger');
          this.renderer.addClass(element, 'text-white');
        });
      }
    }
    if (!formGroup.classList.contains('form-group')) {
      if (this.isTouched && control && !control.valid) {
        const errorKey = Object.keys(control.errors || {})[0];
        const errorDetails = errorKey ? this.getErrorDetails(errorKey, control.errors![errorKey], labelText) : '';
        const requiredError = this.renderer.createElement('small');
        this.renderer.addClass(requiredError, 'error');
        this.renderer.addClass(requiredError, 'text-danger');
        requiredError.textContent = errorDetails;
        this.renderer.appendChild(formGroup, requiredError);
        controlElements?.forEach((element: any) => this.renderer.addClass(element, 'border-danger'));
        inputGroupText?.forEach((element: any) => {
          this.renderer.addClass(element, 'border-danger');
          this.renderer.addClass(element, 'bg-danger');
          this.renderer.addClass(element, 'text-white');
        });
      }
      // If the closest parent is 'td' or 'th', add error span as the last child

    }
    const inputType = this.el.nativeElement.type;
    const placeholderValue = this.el.nativeElement.getAttribute('placeholder');
    const isTextInput = ['text', 'email', 'number', 'textarea'].includes(inputType as string);

    if (!placeholderValue && isTextInput) {
      const selector = '.form-control, .form-select';
      this.renderer.setAttribute(
        formGroup.querySelector(selector),
        'placeholder',
        `Enter ${labelText}`
      );
    }
  }

  private getFormControl(): AbstractControl | null {
    return this.ngControl?.control as FormControl;
  }

  private isControlRequired(control: AbstractControl | null): boolean {
    const validators = control?.validator ? control.validator({} as AbstractControl) : null;
    return validators ? validators['required'] : false;
  }

  private getErrorDetails(key: string, value: any, label: string): string {
    let l = (label ? label : this.label ? this.label : 'This');
    switch (key) {
      case 'required':
        return l + ' is required';
      case 'minlength':
        return l + ` requires mini length is ${value.requiredLength}`;
      case 'maxlength':
        return l + ` requires max length is ${value.requiredLength}`;
      case 'min':
        return l + ` must be at least ${value.min}`;
      case 'max':
        return l + ` must not exceed ${value.max}`;
      case 'email':
        return 'Invalid email address';
      case 'usernameTaken':
        l = (l == 'This') ? l : 'This ' + l;
        return l + ' is not available';
      case 'emailTaken':
        l = (l == 'This') ? l : 'This ' + l;
        return l + ' is already used';
      case 'districtNameTaken':
        l = (l == 'This') ? l : 'This ' + l;
        return l + ' is already used';
      case 'districtIdTaken':
        l = (l == 'This') ? l : 'This ' + l;
        return l + ' is already used';
      case 'pattern':
        return l + 'is not valid';
      // Add more cases for other default validators as needed
      default:
        return `Validation failed: ${key}`;
    }
  }
  ngOnDestroy() {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }
}
