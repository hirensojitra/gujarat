import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import ColorThief from 'colorthief';
import { AvatarDetails, Post, TextDetails, TextGroupDetails } from '../interfaces/post';
@Injectable({
  providedIn: 'root'
})
export class SVGImageService {
  constructor(
    private fb: FormBuilder,
  ) { }
  
  rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  makeDataForImage(d: Post) {
    const { w, h, backgroundUrl, data } = d.details;
    const e = {
      svgWidth: w || 0,
      svgHeight: h || 0,
      background: backgroundUrl || '',
      viewBox: "0 0 " + (w || 0) + " " + (h || 0),
      elements: data.map((item, index) => {
        if (item.type === 'text_group') {
          const d = item as TextGroupDetails;
          return {
            index: index,
            type: 'text_group',
            data: (d as TextGroupDetails).data.map((textItem: TextDetails, index) => {
              return {
                index: index,
                type: textItem.type,
                x: textItem.x,
                y: textItem.y,
                fs: textItem.fs,
                fw: textItem.fw,
                fontStyle: {
                  italic: textItem.fontStyle?.italic || false,
                  underline: textItem.fontStyle?.underline || false
                },
                textAlign: textItem.textAlign || '',
                color: textItem.color || ''
              };
            })
          };
        } else if (item.type === 'avatar') {
          const d = item as AvatarDetails;
          return {
            index: index,
            type: 'avatar',
            r: d.r || 0,
            borderwidth: d.borderwidth || 0,
            bordercolor: d.bordercolor || '',
            imageUrl: d.imageUrl || 'assets/images/jpeg/profile-1.jpeg',
            x: d.x || 0,
            y: d.y || 0
          };
        } else if (item.type === 'name' || item.type === 'address') {
          const d = item as TextDetails;
          return {
            index: index,
            type: d.type,
            x: d.x,
            y: d.y,
            fs: d.fs,
            text: d.text,
            fw: d.fw,
            fontStyle: {
              italic: item.fontStyle?.italic || false,
              underline: item.fontStyle?.underline || false
            },
            textAlign: item.textAlign || '',
            color: item.color || ''
          };
        } else {
          return {
            index: index,
          };
        }
      }).filter(item => item !== null)
    };
    return e;
  }
  textPosition(t: string): string {
    switch (t) {
      case 'center':
        return 'middle';
      case 'left':
        return 'start';
      case 'right':
        return 'end';
      default:
        return 'middle';
    }
  }
  setData(element: any, dataControl: FormArray) {
    if (dataControl instanceof FormArray) {
      const e = dataControl.controls[element.index];
      e.get('x')?.setValue(element.x, { emitEvent: false });
      e.get('y')?.setValue(element.y, { emitEvent: false });
    }
  }
  addAvatarControls(dataFormArray: FormArray) {
    const avatarFormGroup = this.fb.group({
      type: ['avatar'],
      r: [100, Validators.required],
      borderwidth: [10, Validators.required],
      bordercolor: ['#FFF', Validators.required],
      x: [300, Validators.required],
      y: [300, Validators.required],
      imageUrl:['']
    });
    dataFormArray.push(avatarFormGroup);
  }
  private createFormControlGroup(type: string): FormGroup {
    return this.fb.group({
      type: [type],
      x: [10, Validators.required],
      y: [10, Validators.required],
      fs: [30, Validators.required],
      fw: '400',
      fontStyle: this.fb.group({
        italic: [false],
        underline: [false]
      }),
      textAlign: ['center', Validators.required],
      color: ['#FFF', Validators.required],
      text: '',
    });
  }
  
  addNameControls(dataFormArray: FormArray) {
    const nameFormGroup = this.createFormControlGroup('name');
    dataFormArray.push(nameFormGroup);
  }
  
  addAddressControls(dataFormArray: FormArray) {
    const addressFormGroup = this.createFormControlGroup('address');
    dataFormArray.push(addressFormGroup);
  }
  
  addTextGroupControls(dataFormArray: FormArray) {
    const textGroupFormGroup = this.fb.group({
      type: ['text_group'],
      data: this.fb.array([
        this.createFormControlGroup('name'),
        this.createFormControlGroup('address')
      ])
    });
    dataFormArray.push(textGroupFormGroup);
  }  
  private removeControls(type: string, dataFormArray: FormArray) {
    for (let i = dataFormArray.length - 1; i >= 0; i--) {
      const dataFormGroup = dataFormArray.at(i) as FormGroup;
      if (dataFormGroup.get('type')?.value === type) {
        dataFormArray.removeAt(i);
      }
    }
  }
  addControlsByType(controlName: string, FB: FormGroup) {
    const d: FormArray = FB.get('data') as FormArray;
    switch (controlName) {
      case 'avatar':
        this.addAvatarControls(d);
        break;
      case 'name':
        this.addNameControls(d);
        break;
      case 'address':
        this.addAddressControls(d);
        break;
      case 'text_group':
        this.addTextGroupControls(d);
        break;
      default:
        break;
    }
  }
  removeControlsByType(controlName: string, FB: FormGroup) {
    const d: FormArray = FB.get('data') as FormArray;
    switch (controlName) {
      case 'avatar':
        this.removeControls('avatar', d);
        break;
      case 'name':
        this.removeControls('name', d);
        break;
      case 'address':
        this.removeControls('address', d);
        break;
      case 'text_group':
        this.removeControls('text_group', d);
        break;
      default:
        break;
    }
  }
  getMousePosition(evt: TouchEvent | MouseEvent, svg: SVGSVGElement): { x: number, y: number } {
    evt.preventDefault();
    const touchOrMouse = 'touches' in evt ? evt.touches[0] : evt;
    const CTM = svg.getScreenCTM();
    return {
      x: (touchOrMouse.clientX - CTM!.e) / CTM!.a,
      y: (touchOrMouse.clientY - CTM!.f) / CTM!.d
    };
  }
}
