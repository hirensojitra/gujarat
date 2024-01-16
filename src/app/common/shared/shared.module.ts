import { DecimalDirective } from 'src/app/common/directives/decimal.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccordionActiveDirective } from '../directives/accordion-active.directive';
import { CaptchaDirective } from '../directives/captcha.directive';
import { SelectDropdownDirective } from '../directives/select-dropdown.directive';
import { TogglePasswordDirective } from '../directives/toggle-password.directive';
import { AsteriskDirective } from '../directives/asterisk.directive';
import { LocalitySelectorComponent } from '../controllers/locality-selector/locality-selector.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  declarations: [
    CaptchaDirective,
    TogglePasswordDirective,
    AccordionActiveDirective,
    SelectDropdownDirective,
    AsteriskDirective,
    DecimalDirective,
    LocalitySelectorComponent
  ],
  exports: [
    CaptchaDirective,
    TogglePasswordDirective,
    AccordionActiveDirective,
    SelectDropdownDirective,
    AsteriskDirective,
    DecimalDirective,
    LocalitySelectorComponent
  ],
  providers: [
  ]
})
export class SharedModule { }
