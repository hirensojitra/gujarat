import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { selectKey } from 'src/app/common/interfaces/commonInterfaces';
@Component({
  selector: 'app-canvas-list',
  templateUrl: './canvas-list.component.html',
  styleUrls: ['./canvas-list.component.scss']
})

export class CanvasListComponent implements OnInit {
  
  postForm!: FormGroup;
  types!: selectKey[];
  myForm: FormGroup;
  constructor(private fb: FormBuilder) { 
    this.myForm = this.fb.group({
      data: this.fb.array([])
    });
  }

  ngOnInit() {
    this.types = [
      { id: 'post', name: 'Post' }
    ];
    this.initForm();
  }

  initForm() {
    this.postForm = this.fb.group({
      type: ['post'],
      avatar: [false],
      name: [false],
      address: [false],
      'text-group': [false],
      details: this.fb.array([
        this.fb.group({
          w: [1024],
          h: [1024],
          backgroundUrl: [''],
          data: this.fb.array([])
        })
      ])
    });
    // Subscribe to value changes for avatar, name, address, and text-group
    ['avatar', 'name', 'address', 'text-group'].forEach(controlName => {
      this.postForm.get(controlName)?.valueChanges.subscribe(value => {
        if (value) {
          this.addControlsByType(controlName);
        } else {
          this.removeControlsByType(controlName);
        }
      });
    });
  }
  get detailsForms() {
    return this.postForm.get('details') as FormArray;
  }
  private addAvatarControls() {
    const avatarFormGroup = this.fb.group({
      type: ['avatar'],
      radius: [100],
      borderwidth: [10],
      bordercolor: ['#FFF'],
      x: [300],
      y: [300]
    });

    // Push the new avatar form group to 'data' array
    // Assuming avatarFormGroup is already defined

    (this.postForm.get('details') as FormArray).controls.forEach((control: AbstractControl, index: number) => {
      if (control instanceof FormGroup) {
        const detail = control as FormGroup;
        const dataFormArray = detail.get('data') as FormArray;
        dataFormArray.push(avatarFormGroup);
      }
    });


  }
  private removeAvatarControls() {
    (this.postForm.get('details') as FormArray).controls.forEach(detail => {
      const dataFormArray = detail.get('data') as FormArray;
      for (let i = dataFormArray.length - 1; i >= 0; i--) {
        const dataFormGroup = dataFormArray.at(i) as FormGroup;
        if (dataFormGroup.get('type')?.value === 'avatar') {
          dataFormArray.removeAt(i);
        }
      }
    });
  }
  private addNameControls() {
    const nameFormGroup = this.fb.group({
      type: ['name'],
      x: [10],
      y: [10],
      fs: [30],
    });

    (this.postForm.get('details') as FormArray).controls.forEach((control: AbstractControl) => {
      if (control instanceof FormGroup) {
        const detail = control as FormGroup;
        const dataFormArray = detail.get('data') as FormArray;
        dataFormArray.push(nameFormGroup);
      }
    });
  }

  private addAddressControls() {
    const addressFormGroup = this.fb.group({
      type: ['address'],
      x: [10],
      y: [10],
      fs: [30],
    });

    (this.postForm.get('details') as FormArray).controls.forEach((control: AbstractControl) => {
      if (control instanceof FormGroup) {
        const detail = control as FormGroup;
        const dataFormArray = detail.get('data') as FormArray;
        dataFormArray.push(addressFormGroup);
      }
    });
  }

  private addTextGroupControls() {
    const textGroupFormGroup = this.fb.group({
      type: ['text-group'],
      data: this.fb.array([
        this.fb.group({
          type: ['name'],
          x: [10],
          y: [10],
          fs: [30],
        }),
        this.fb.group({
          type: ['address'],
          x: [10],
          y: [10],
          fs: [30],
        })
      ])
    });

    (this.postForm.get('details') as FormArray).controls.forEach((control: AbstractControl) => {
      if (control instanceof FormGroup) {
        const detail = control as FormGroup;
        const dataFormArray = detail.get('data') as FormArray;
        dataFormArray.push(textGroupFormGroup);
      }
    });
  }

  private removeControls(type: string) {
    (this.postForm.get('details') as FormArray).controls.forEach(detail => {
      const dataFormArray = detail.get('data') as FormArray;
      for (let i = dataFormArray.length - 1; i >= 0; i--) {
        const dataFormGroup = dataFormArray.at(i) as FormGroup;
        if (dataFormGroup.get('type')?.value === type) {
          dataFormArray.removeAt(i);
        }
      }
    });
  }
  // Method to add controls based on the control name
  private addControlsByType(controlName: string) {
    switch (controlName) {
      case 'avatar':
        this.addAvatarControls();
        break;
      case 'name':
        this.addNameControls();
        break;
      case 'address':
        this.addAddressControls();
        break;
      case 'text-group':
        this.addTextGroupControls();
        break;
      default:
        break;
    }
  }

  // Method to remove controls based on the control name
  private removeControlsByType(controlName: string) {
    switch (controlName) {
      case 'avatar':
        this.removeControls('avatar');
        break;
      case 'name':
        this.removeControls('name');
        break;
      case 'address':
        this.removeControls('address');
        break;
      case 'text-group':
        this.removeControls('text-group');
        break;
      default:
        break;
    }
  }
  getDataControls(detail: any): AbstractControl[] {
    if (detail instanceof FormGroup || detail instanceof FormArray) {
      const dataArray = detail.get('data') as FormArray;
      return dataArray ? dataArray.controls : [];
    } else if (detail instanceof FormControl) {
      // If it's a FormControl, return an empty array or handle it as needed
      return [];
    } else {
      // Handle other cases as needed
      return [];
    }
  }

  checkDataType(data: any): AbstractControl[] {
    if (data && data.controls) {
      return data.controls;
    } else {
      return [];
    }
  }
  formArray(control:any) {
    return control as FormArray;
  }
  convertArrayToFormArray(values: any[]): FormArray {
    const formArray = this.myForm.get('data') as FormArray;
    // Clear any existing form controls
    formArray.clear();

    // Iterate through the array and create a FormGroup for each object
    values.forEach(value => {
      const formGroup = this.fb.group({
        type: [value.type],
        x: [value.x],
        y: [value.y],
        fs: [value.fs]
      });
      // Push the FormGroup into the FormArray
      formArray.push(formGroup);
    });
    return formArray
  }  
}
