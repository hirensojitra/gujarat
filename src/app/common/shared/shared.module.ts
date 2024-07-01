import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ColorPickerComponent } from '../controllers/color-picker/color-picker.component';
import { PaginationDirective } from '../directives/pagination.directive';
import { DependencyListPipe } from '../pipes/dependency-list.pipe';
import { SvgResponseDirective } from '../directives/svg-response.directive';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule
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
    DependencyListPipe,
    SvgProcessorDirective,
    ColorPickerComponent,
    PaginationDirective,
    SvgResponseDirective
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
    DependencyListPipe,
    SvgProcessorDirective,
    ColorPickerComponent,
    PaginationDirective,
    SvgResponseDirective
  ],
  providers: [KeysPipe, ColorService, ColorPickerComponent, DependencyListPipe]
})
export class SharedModule { }