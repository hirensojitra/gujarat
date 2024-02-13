import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CaptchaDirective } from '../directives/captcha.directive';
import { TogglePasswordDirective } from '../directives/toggle-password.directive';
import { AccordionActiveDirective } from '../directives/accordion-active.directive';
import { SelectDropdownDirective } from '../directives/select-dropdown.directive';
import { AsteriskDirective } from '../directives/asterisk.directive';
import { DecimalDirective } from 'src/app/common/directives/decimal.directive';
import { LocalitySelectorComponent } from '../controllers/locality-selector/locality-selector.component';
import { DraggableDirective } from '../directives/draggable.directive';  // Add this line
import { KeysPipe } from '../pipes/keys.pipe';
import { SvgProcessorDirective } from '../directives/svg-processor.directive';
import { ColorService } from '../services/color.service';

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
    LocalitySelectorComponent,
    DraggableDirective,
    KeysPipe,
    SvgProcessorDirective
  ],
  exports: [
    CaptchaDirective,
    TogglePasswordDirective,
    AccordionActiveDirective,
    SelectDropdownDirective,
    AsteriskDirective,
    DecimalDirective,
    LocalitySelectorComponent,
    DraggableDirective,
    KeysPipe,
    SvgProcessorDirective
  ],
  providers: [KeysPipe, ColorService]
})
export class SharedModule { }