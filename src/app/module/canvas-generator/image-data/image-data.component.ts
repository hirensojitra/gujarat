import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ImageDataService } from 'src/app/common/services/image-data.service';
import { ImageService } from 'src/app/common/services/image.service';
import { ToastService } from 'src/app/common/services/toast.service';
declare const bootstrap: any;

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-data.component.html',
  styleUrls: ['./image-data.component.scss']
})
export class ImageDataComponent implements OnInit {

  cacheBuster = Math.random().toString(36).substring(7);
  selected: boolean = false;
  selectedImage: File | null = null;
  images: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;
  constructor(
    private imageDataService: ImageDataService,
    private imageService: ImageService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private toastService: ToastService) {

  }
  imageUrl: string | ArrayBuffer | null = null;
  imageName: string | ArrayBuffer | null = null;

  uploadFile: any;
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const allowedTypes = ['image/svg+xml', 'image/jpeg', 'image/png'];
    if (file && allowedTypes.includes(file.type)) {
      this.selectedImage = file;
      this.previewImage(file);
    } else {
      // Reset selectedImage and imageUrl if file type is not allowed
      this.selectedImage = null;
      this.imageUrl = null;
      alert('Only SVG, JPG, and PNG files are allowed.');
    }
  }

  previewImage(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result;
      this.imageName = file.name;
      this.uploadFile.show();
    };
  }

  onUpload() {
    if (this.selectedImage) {
      this.imageDataService.uploadImage(this.selectedImage)
        .subscribe(
          response => {
            console.log('Image uploaded successfully:', response);
            if (response.success) {
              this.uploadImage(response);
              this.uploadFile.hide();
            }
          },
          error => {
            console.error('Error uploading image:', error);
            // Handle the error
          }
        );
    }
  }
  loadImages(page: number, limit: number) {
    this.imageService.getImages(page, limit)
      .subscribe(
        response => {
          this.images = response.data;
          this.totalPages = response.pagination.totalPages;
          this.totalItems = response.pagination.totalItems;
        },
        error => {
          console.error('Error fetching images:', error);
          // Handle the error
        }
      );
  }
  uploadImage(imageData: any) {
    this.imageService.uploadImage(imageData)
      .subscribe(
        response => {
          console.log('Image data uploaded successfully:', response);
          // Handle the response as needed
        },
        error => {
          console.error('Error uploading image data:', error);
          // Handle the error
        }
      );
  }
  deleteImages(ids: string[]): void {
    this.imageService.deleteImages(ids)
      .subscribe(
        response => {
          console.log('Images deleted successfully:', response);
          // Reload images after deletion
          this.loadImages(this.currentPage, this.pageSize);
        },
        error => {
          console.error('Error deleting images:', error);
          // Handle the error
        }
      );
  }
  onDeleteImages(): void {
    const selectedImageIds = this.images.filter(img => img.selected).map(img => img.id);
    if (selectedImageIds.length > 0) {
      this.deleteImages(selectedImageIds);
    } else {
      // No images selected, handle accordingly
    }
  }
  onImageSelectionChange(image: any): void {
    if (image.selected === undefined) {
      image.selected = true
    } else {
      image.selected = !image.selected;
    }
    this.selected = (this.images.filter(img => img.selected).length) ? true : false;
  }
  onCurrentPageChange($event: number) {
    this.currentPage = $event;
    this.loadImages(this.currentPage, this.pageSize);
  }
  onPageSizeChange($event: number) {
    this.pageSize = $event;
  }
  copyHrefToClipboard(event: MouseEvent, href: string): void {
    event.preventDefault();

    const el = this.renderer.createElement('textarea');
    el.value = href;
    this.renderer.appendChild(this.elementRef.nativeElement, el);
    el.select();
    document.execCommand('copy');
    this.renderer.removeChild(this.elementRef.nativeElement, el);
    this.toastService.show("Image File path copied to clipboard", { title: 'Copy Successed', class: 'bg-success' });
    
  }
  formatSize(bytes: number): string {
    const KB = bytes / 1024;
    const MB = bytes / (1024 * 1024);

    if (MB >= 1) {
      return MB.toFixed(2) + ' MB';
    } else {
      return KB.toFixed(2) + ' KB';
    }
  }
  ngOnInit(): void {
    this.loadImages(this.currentPage, this.pageSize);
    this.uploadFile = new bootstrap.Modal(document.getElementById('uploadFile')!, { focus: false, keyboard: false, static: false });
    this.uploadFile._element.addEventListener('hidde.bs.modal', () => {
      this.imageUrl = null;
      this.imageName = null;
      this.selectedImage = null;
    });
    this.uploadFile._element.addEventListener('show.bs.modal', () => {

    });
  }
}
