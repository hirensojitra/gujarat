import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ]
})
export class ColorPickerComponent implements ControlValueAccessor, OnInit {
  @Input() colorSet!: string[];
  @Input() getActiveControl!: (index: number, controlName: string) => boolean;

  uniqueId: string = ''; 
  selectedColor!: string;

  onChange: any = () => {};
  onTouch: any = () => {};

  constructor() { }

  ngOnInit(): void {
    this.uniqueId = 'color-picker-' + Math.random().toString(36).substr(2, 9);
  }

  getColorClass(color: string): string {
    return this.selectedColor === color ? 'shadow border border-light border-3' : '';
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.onChange(this.selectedColor);
    this.onTouch();
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.selectedColor = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implement if needed
  }
}
