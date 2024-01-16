import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/common/services/user.service';
import Cropper from 'cropperjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DevelopmentService } from 'src/app/common/services/development.service';
import { VillageService } from 'src/app/common/services/village.service';
import { Subscription } from 'rxjs';
import { User, Village } from 'src/app/common/interfaces/commonInterfaces';
declare const bootstrap: any;


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})

export class UserProfileComponent implements OnInit {

  user!: User | any;

  @ViewChild('imageInput') imageInput!: ElementRef;
  cropper!: Cropper;
  cropperModal: any;
  profilePictureForm: FormGroup<any>;
  userSubscription: Subscription;
  constructor(
    private fb: FormBuilder,
    private US: UserService,
    private DS: DevelopmentService,
    private villageService: VillageService
  ) {
    this.profilePictureForm = this.fb.group({
      username: ['', Validators.required],
      image: ['']
    })
    this.userSubscription = this.US.getUser().subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        this.profilePictureForm.get('username')?.setValue(user.username);
        this.getVillage(user.village_id)
      }
    });
  }

  ngOnInit(): void {
    this.cropperModal = new bootstrap.Modal(document.getElementById('cropperModal')!, { focus: false, keyboard: false, static: false });
    this.cropperModal._element.addEventListener('hide.bs.modal', () => {
      if (this.cropper) {
        this.cropper.destroy();
      }
      // this.profilePictureForm.reset();
    });
    this.cropperModal._element.addEventListener('show.bs.modal', () => {
      this.profilePictureForm.get('username')?.setValue(this.user.username)
      // this.profilePictureForm.get('image')?.setValue(this.user.image)
    });
  }
  openImageCropperDialog(): void {
    const inputElement = this.imageInput.nativeElement;
    inputElement.click(); // Trigger click on the hidden file input
    inputElement.value = null;
  }

  handleImageInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        // Open Bootstrap modal dialog with Cropper

        this.cropperModal.show();
        // Initialize Cropper
        const cropperElement = document.getElementById('cropper') as HTMLImageElement;
        this.cropper = new Cropper(cropperElement, {
          aspectRatio: 1,
          scalable: true,
          viewMode: 3, // Ensure the crop box is always within the container
          crop: (event) => {
            this.handleCropEvent(event)
          },
          autoCropArea: 1, // Ensure the initial crop area covers the entire image
          dragMode: 'move', // Allow dragging to move the image within the container
          responsive: true, // Update crop box on resize
          cropBoxResizable: false, // Disable resizing the crop box
          minCropBoxWidth: 320,
          minCropBoxHeight: 320,
          minContainerWidth: 320,
          minContainerHeight: 320
        });

        // Set image source for Cropper
        this.cropper.replace(imageSrc);
      };

      reader.readAsDataURL(file);
    }
  }
  handleCropEvent(event: Cropper.CropEvent): void {
    if (this.cropper) {
      const croppedCanvas = this.cropper.getCroppedCanvas();
      const resizedCanvas = document.createElement('canvas');
      const resizedContext = resizedCanvas.getContext('2d')!;
      resizedCanvas.width = 20;
      resizedCanvas.height = 20;
      resizedContext.drawImage(croppedCanvas, 0, 0, 20, 20);
      const resizedImageData = resizedCanvas.toDataURL('image/jpeg'); // Adjust format as needed
      this.profilePictureForm.get('image')?.setValue(resizedImageData);
    }
  }
  saveCroppedImage(): void {
    if (this.profilePictureForm.valid) {
      if (this.user) {
        let formValue = this.profilePictureForm.value;
        const isUserDataChanged = Object.keys(formValue).some(key => this.user![key] !== formValue[key]);
        if (!isUserDataChanged) {
          return;
        }
        const username = this.user?.username || '';
        this.US.updateUserData(username, formValue).subscribe(
          (response: any) => {
            this.US.setUser(response.user);
            this.cropperModal.hide();
          },
          error => {
            console.error('Error updating user:', error);
            // Handle error, e.g., show an error message to the user
          }
        );
      }
    }
  }
  validateImage(imageUrl: string): string {
    return imageUrl || `https://dummyimage.com/300x300/F4F4F4/000000&text=${this.imageText()}`;
  }
  imageText(): string {
    if (this.user && this.user.firstName && this.user.lastName) {
      const firstCharFirstName = this.user.firstName.charAt(0);
      const firstCharLastName = this.user.lastName.charAt(0);
      return ` ${firstCharFirstName}${firstCharLastName} `;
    } else {
      return 'USER';
    }
  }
  deleteImage() {
    this.profilePictureForm.get('username')?.setValue(this.user.username)
    this.profilePictureForm.get('image')?.setValue('delete');
    if (this.user) {
      let formValue = this.profilePictureForm.value;
      const isUserDataChanged = Object.keys(formValue).some(key => this.user![key] !== formValue[key]);
      if (!isUserDataChanged) {
        console.log('User data has not changed. Skipping update.');
        return;
      }
      const username = this.user?.username || '';
      this.US.updateUserData(username, formValue).subscribe(
        (response: any) => {
          console.log('User updated successfully:', response);
          this.US.setUser(response.user);
          this.cropperModal.hide();
          this.profilePictureForm.reset();
        },
        error => {
          console.error('Error updating user:', error);
          // Handle error, e.g., show an error message to the user
        }
      );
    }
  }
  village!:Village;
  getVillage(id:any){
    this.villageService.getVillageById(id).subscribe(
      (data) => {
        const village = data.data;
        if (village) {
          this.village = village;
        }
      },
      (error) => {

      }
    );
  }
}
