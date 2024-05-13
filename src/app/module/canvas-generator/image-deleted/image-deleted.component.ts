import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  hardDeleteModal: any;
  selectedID: string | undefined;

  constructor(
    private PS: PostDetailService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.window = window;
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.getAllPosts();
      this.getTotalPostLength();
    });
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
    this.hardDeleteModal = new bootstrap.Modal(document.getElementById('hardDeleteModal')!, { focus: false, keyboard: false, static: false });
    this.hardDeleteModal._element.addEventListener('hide.bs.modal', () => {
    });
    this.hardDeleteModal._element.addEventListener('hidden.bs.modal', () => {
      this.selectedID = undefined;
    });
    this.hardDeleteModal._element.addEventListener('show.bs.modal', () => {

    });
    this.hardDeleteModal._element.addEventListener('shown.bs.modal', () => {
    });
  }
  ngAfterViewInit(): void { }

  selectRecoverId(id: any) {
    this.selectedID = id;
    id && this.confirmRecover.show();
  }

  selectDeleteId(id: any) {
    this.selectedID = id;
    id && this.hardDeleteModal.show();
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
          console.log('Restored successful:', response);
          this.confirmRecover.hide();
          this.getAllPosts();
        },
        error => {
          console.error('Error during Restore:', error);
        }
      );
  }

  hardDelete(): void {
    this.selectedID && this.PS.hardDeletePost(this.selectedID)
      .subscribe(
        response => {
          console.log('Hard deletion successful:', response);
          this.hardDeleteModal.hide();
          window.close();
        },
        error => {
          console.error('Error during hard deletion:', error);
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
    this.updateUrlParams();
  }

  getPaginationControls(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge'
    });
  }
}
