import { AfterViewInit, Component, OnInit } from '@angular/core';
import { PostDetails } from 'src/app/common/interfaces/image-element';
import { PostDetailService } from 'src/app/common/services/post-detail.service';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss']
})
export class ImageListComponent implements OnInit, AfterViewInit {
  
  posts: PostDetails[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  totalLength: number = 0;
  window!: Window & typeof globalThis;
  constructor(private PS: PostDetailService) {

  }
  ngOnInit(): void {
    this.window = window;
    this.getAllPosts();
    this.getTotalPostLength();
  }
  ngAfterViewInit(): void {

  }
  getAllPosts(): void {
    this.PS.getAllPosts(this.currentPage)
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
