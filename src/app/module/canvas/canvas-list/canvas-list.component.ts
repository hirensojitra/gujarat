import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl, FormControl, Validators } from '@angular/forms';
import { selectKey, User } from 'src/app/common/interfaces/commonInterfaces';
import ColorThief from 'colorthief';
import { Post } from 'src/app/common/interfaces/post';
import { PostService } from 'src/app/common/services/post.service';
import { UserService } from 'src/app/common/services/user.service';
import { VillageService } from 'src/app/common/services/village.service';
import { SVGImageService } from 'src/app/common/services/svgimage-service.service';

@Component({
  selector: 'app-canvas-list',
  templateUrl: './canvas-list.component.html',
  styleUrls: ['./canvas-list.component.scss']
})

export class CanvasListComponent implements OnInit, AfterViewInit {
  @ViewChild('imageElement') imageElement!: ElementRef;
  posts: Post[] = [];
  deletedLength: number = 0;
  currentPage: number = 1;
  totalLength: number = 0;
  totalPages: number = 0;
  pageSize: number = 12;
  totalPagesArray: number[] = [];
  editImage: boolean = false;
  addImage: boolean = false;
  showList: boolean = true;

  postForm!: FormGroup;
  types!: selectKey[];
  postEdit!: Post;

  user!: User;
  userFullName!: string;
  address!: string;
  color: any;
  CT: any;
  addressList: any;
  window!: Window & typeof globalThis;
  constructor(private renderer: Renderer2,
    private fb: FormBuilder,
    private postService: PostService,
    private US: UserService,
    private VS: VillageService,
    private IMG: SVGImageService) {
  }
  async getVillage(id: any) {
    this.VS.getVillageById(id).subscribe(
      (data) => {
        this.addressList = data.data;
        this.address = this.addressList.gu_name + ", તાલુકા : " + this.addressList.taluka_gu_name + ", જિલ્લા : " + this.addressList.district_gu_name;
      },
      (error: any) => {

      }
    )
  }

  ngAfterViewInit(): void {
    this.types = [
      { id: 'post', name: 'Post' }
    ];
    this.getAllPosts();
    this.getTotalPostLength();
    this.getTotalDeletedPostLength();

  }
  
  ngOnInit() {
    this.window = window;
  }
  

  
  
  

  
  

  getAllPosts(): void {
    this.postService.getAllPosts(this.currentPage)
      .subscribe(posts => {
        this.posts = posts;
        console.log(this.posts)
      });
  }
  
  getTotalPostLength(): void {
    this.postService.getTotalPostLength()
      .subscribe(data => {
        this.totalLength = data.totalLength;
        this.calculateTotalPages();
      });
  }

  getTotalDeletedPostLength(): void {
    this.postService.getTotalDeletedPostLength()
      .subscribe(data => {
        this.deletedLength = data.totalLength;
      });
  }

  

  softDeletePost(postId: string): void {
    this.postService.softDeletePost(postId)
      .subscribe(response => {
        console.log(response); // Log success message or handle response accordingly
        // After soft deleting, refresh the post list and post counts
        this.getAllPosts();
        this.getTotalPostLength();
        this.getTotalDeletedPostLength();
      }, error => {
        console.error(error); // Handle error appropriately
      });
  }

  hardDeletePost(postId: string): void {
    this.postService.hardDeletePost(postId)
      .subscribe(response => {
        console.log(response); // Log success message or handle response accordingly
        // After hard deleting, refresh the post list and post counts
        this.getAllPosts();
        this.getTotalPostLength();
        this.getTotalDeletedPostLength();
      }, error => {
        console.error(error); // Handle error appropriately
      });
  }
  
  onPageChange(pageNumber: number): void {
    if (this.currentPage == pageNumber) { return }
    this.currentPage = pageNumber;
    this.getAllPosts();
  }
  calculateTotalPages(): void {
    const postLimitPerPage = 12;
    this.totalPages = Math.ceil(this.totalLength / postLimitPerPage);
  }
  getPaginationControls(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }
}
