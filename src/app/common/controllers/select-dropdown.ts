// custom-dropdown.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'select-dropdown',
  template: `
    <div class="form-group">
      <label [for]="controlName" class="form-label mb-0">{{ label }}</label>
      <span class="text-danger">*</span>
      <select class="form-select" [formControlName]="controlName" *ngIf="options.length; else loadingTemplate" selectDropdown [options]="options" [defaultOptionText]="defaultOptionText">
        <option value="" selected disabled>{{ defaultOptionText }}</option>
        <ng-container *ngFor="let option of options; let i = index">
          <option [value]="option['id']">{{ option['name'] }}</option>
        </ng-container>
      </select>
      <ng-template #loadingTemplate>
        <input class="form-control" [formControlName]="controlName" value="{{ loadingText }}" [attr.disabled]="true">
      </ng-template>
    </div>
  `,
})
export class SelectDropdownComponent {
  @Input() controlName: string = '';
  @Input() label: string = '';
  @Input() options: any[] = [];
  @Input() defaultOptionText: string = 'Select';
  @Input() loadingText: string = 'Loading...';
  ngOnInit() {
  }
}
