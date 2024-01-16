import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[decimalOnly]'
})
export class DecimalDirective {

  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const inputElement = this.el.nativeElement;
    const currentValue: string = inputElement.value;

    // Allow only digits, one leading zero, and one decimal point
    let sanitizedValue = currentValue.replace(/[^0-9.]/g, '');

    // Allow inputs like "0.123" and "123.0"
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places to two
    const [integerPart, decimalPart = ''] = sanitizedValue.split('.');
    const limitedDecimalPart = decimalPart.slice(0, 2);
    sanitizedValue = decimalPart ? `${integerPart}.${limitedDecimalPart}` : integerPart;

    // Update the input value if it was modified
    if (currentValue !== sanitizedValue) {
      this.control.control?.setValue(sanitizedValue, { emitEvent: false }); // Update FormControl value without triggering another input event
      inputElement.value = sanitizedValue;
      event.stopPropagation();
    }
  }

  // Allow cursor placement in the input field
  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const inputElement = this.el.nativeElement;
    const cursorPosition = inputElement.selectionStart || 0;
    const currentValue: string = inputElement.value;

    // Allow only specific keys
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Control', 'Shift', 'Home', 'End', 'PageUp', 'PageDown', 'Tab'];
    if (!event.key || allowedKeys.includes(event.key)) {
      return;
    }
    event.preventDefault(); // Prevent default behavior for all keys
    // Handle numeric inputs
    if (/^\d$/.test(event.key)) {
      // Insert the pressed key at the cursor position, considering the decimal point
      const newValue = currentValue.slice(0, cursorPosition) + event.key + currentValue.slice(cursorPosition);
      const [integerPart, decimalPart = ''] = newValue.split('.');
      const limitedDecimalPart = decimalPart.slice(0, 2);
      inputElement.value = decimalPart ? `${integerPart}.${limitedDecimalPart}` : integerPart;

      // Update the FormControl value
      this.control.control?.setValue(inputElement.value, { emitEvent: false });
    }

  }
}
