import { AfterViewInit, Component, OnInit } from '@angular/core';
import { PostDetails } from 'src/app/common/interfaces/image-element';
import { PostDetailService } from 'src/app/common/services/post-detail.service';
declare const bootstrap: any;

@Component({
  selector: 'app-image-deleted',
  templateUrl: './image-deleted.component.html',
  styleUrls: ['./image-deleted.component.scss']
})
export class ImageDeletedComponent implements OnInit, AfterViewInit {

  posts: PostDetails[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  totalLength: number = 0;
  window!: Window & typeof globalThis;


  confirmRecover: any;
  confirmDelete: any;
  selectedID: string | undefined;
  constructor(private PS: PostDetailService) {

  }
  ngOnInit(): void {
    this.window = window;
    this.getAllPosts();
    this.getTotalPostLength();
    this.confirmRecover = new bootstrap.Modal(document.getElementById('confirmRecover')!, { focus: false, keyboard: false, static: false });
    this.confirmRecover._element.addEventListener('hide.bs.modal', () => {
    });
    this.confirmRecover._element.addEventListener('hidden.bs.modal', () => {
      this.selectedID = undefined;
    });
    this.confirmRecover._element.addEventListener('show.bs.modal', () => {

    });
    this.confirmRecover._element.addEventListener('shown.bs.modal', () => {
    });
    this.confirmDelete = new bootstrap.Modal(document.getElementById('confirmDelete')!, { focus: false, keyboard: false, static: false });
    this.confirmDelete._element.addEventListener('hide.bs.modal', () => {
    });
    this.confirmDelete._element.addEventListener('hidden.bs.modal', () => {
      this.selectedID = undefined;
    });
    this.confirmDelete._element.addEventListener('show.bs.modal', () => {

    });
    this.confirmDelete._element.addEventListener('shown.bs.modal', () => {
    });
  }
  ngAfterViewInit(): void {

  }
  selectRecoverId(id: any) {
    this.selectedID = id;
    id && this.confirmRecover.show();
  }
  selectDeleteId(id: any) {
    this.selectedID = id;
    id && this.confirmDelete.show();
  }
  getAllPosts(): void {
    this.PS.getAllSoftDeletedPosts(this.currentPage)
      .subscribe(posts => {
        this.posts = posts;
        console.log(this.posts)
      });
  }
  getTotalPostLength(): void {
    this.PS.getTotalPostLength()
      .subscribe(data => {
        this.totalLength = data.totalLength;
        this.calculateTotalPages();
      });
  }
  recoverPost(): void {
    this.selectedID && this.PS.recoverPost(this.selectedID)
      .subscribe(
        response => {
          console.log('Resored successful:', response);
          this.confirmRecover.hide();
          this.getAllPosts();
        },
        error => {
          console.error('Error during Restore:', error);
        }
      );
    this.confirmRecover.hide();
  }
  hardDelete(): void {
    this.selectedID &&  this.PS.hardDeletePost(this.selectedID)
      .subscribe(
        response => {
          console.log('Soft deletion successful:', response);
          this.confirmDelete.hide();
          window.close();
        },
        error => {
          console.error('Error during soft deletion:', error);
        }
      );
  }
  calculateTotalPages(): void {
    const postLimitPerPage = 12;
    this.totalPages = Math.ceil(this.totalLength / postLimitPerPage);
  }
  onPageChange(pageNumber: number): void {
    if (this.currentPage == pageNumber) { return }
    this.currentPage = pageNumber;
    this.getAllPosts();
  }
  getPaginationControls(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }
}
