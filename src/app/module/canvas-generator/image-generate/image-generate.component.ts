import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ImageDataService } from 'src/app/common/services/image-data.service';


@Component({
  selector: 'app-image-generate',
  templateUrl: './image-generate.component.html',
  styleUrls: ['./image-generate.component.scss']
})
export class ImageGenerateComponent {
  formDataForm!: FormGroup;

  constructor(private fb: FormBuilder, private imageDataService: ImageDataService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.formDataForm = this.fb.group({
      image: ['', Validators.required],
      id: [0, Validators.required],
      data: this.fb.array([]),
    });
  }

  get dataFormArray(): FormArray {
    return this.formDataForm.get('data') as FormArray;
  }

  addDataField(): void {
    this.dataFormArray.push(
      this.fb.group({
        type: ['', Validators.required],
        checked: [false],
        fontSize: [20],
        x: [150],
        y: [150]
      })
    );
  }

  addDynamicFields(group: FormGroup): void {
    const dataType = group.get('type')?.value;
  
    switch (dataType) {
      case 'avatar':
        group.addControl('radius', this.fb.control(50));
        group.removeControl('fontSize');
        break;
  
      case 'name':
        group.addControl('fontSize', this.fb.control(20));
        break;
  
      case 'mobile':
        group.addControl('fontSize', this.fb.control(15));
        break;
  
      case 'address':
        group.addControl('fontSize', this.fb.control(15));
        break;
  
      case 'social':
        group.removeControl('fontSize');
        group.addControl('social', this.fb.group({
          twitter: [''],
          facebook: [''],
          instagram: [''],
        }));
        break;
  
      default:
        // Handle other data types if needed
        break;
    }
  }

  removeDynamicFields(group: FormGroup): void {
    group.removeControl('radius');
    group.removeControl('fontSize');
    // Remove other dynamic fields as needed
  }

  onCheckboxChange(index: number): void {
    const fieldGroup = this.dataFormArray.at(index) as FormGroup;
    const isChecked = fieldGroup.get('checked')?.value;

    if (isChecked) {
      this.addDynamicFields(fieldGroup);
    } else {
      // Reset the group and remove dynamic fields
      fieldGroup.reset({
        type: '',
        checked: false,
      });
      this.removeDynamicFields(fieldGroup);
    }
  }

  removeDataField(index: number): void {
    this.dataFormArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.formDataForm.valid) {
      const formData = this.formDataForm.value;
      // Call the service to update the JSON file
      this.imageDataService.updateImageData([formData]).subscribe((response) => {
        console.log('JSON file updated:', response);
        // Reset the form after successful submission
        this.formDataForm.reset();
      });
    }
  }
}
