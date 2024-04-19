import { Component, OnInit } from '@angular/core';
import { ImageDataService } from 'src/app/common/services/image-data.service';
import { ImageService } from 'src/app/common/services/image.service';
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
  pageSize = 18;
  totalPages = 0;
  constructor(private imageDataService: ImageDataService, private imageService: ImageService) { }
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

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadImages(this.currentPage, this.pageSize);
  }
  // Method to generate an array of page numbers for pagination
  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }
  onFirstPage() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
    }
  }

  onPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onLastPage() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
    }
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
