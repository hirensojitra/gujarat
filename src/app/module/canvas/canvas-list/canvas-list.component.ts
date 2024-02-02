import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl, FormControl, Validators } from '@angular/forms';
import { selectKey, User } from 'src/app/common/interfaces/commonInterfaces';
import { AvatarDetails, Post, TextDetails, TextGroupDetails } from 'src/app/common/interfaces/post';
import { PostService } from 'src/app/common/services/post.service';
import { UserService } from 'src/app/common/services/user.service';
import { VillageService } from 'src/app/common/services/village.service';
declare const ColorThief: any;

@Component({
  selector: 'app-canvas-list',
  templateUrl: './canvas-list.component.html',
  styleUrls: ['./canvas-list.component.scss']
})

export class CanvasListComponent implements OnInit, AfterViewInit {
  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement | HTMLElement>;
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
  constructor(private renderer: Renderer2, private fb: FormBuilder, private postService: PostService,
    private US: UserService,
    private VS: VillageService) {
    this.US.getUser().subscribe(async (value) => {
      if (value) {
        this.user = value;
        console.log(this.user)
        this.userFullName = this.user.firstname + ' ' + this.user.lastname;
        this.getVillage(this.user.taluka_id);
      }
    })
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
    this.initForm();
    this.getAllPosts();
    this.getTotalPostLength();
    this.getTotalDeletedPostLength();
  }
  ngOnInit() {
    this.CT = new ColorThief();
  }
  showControl(control: string, id?: string) {
    // Reset all flags to false initially
    this.editImage = false;
    this.addImage = false;
    this.showList = false;
    this.postForm.reset();
    // Set the flag based on the control parameter
    if (control === 'edit') {
      this.editImage = true;
      id && this.getPostById(id);
      console.log(id)
    } else if (control === 'add') {
      this.addImage = true;
    } else if (control === 'list') {
      this.showList = true;
    }
    return false
  }

  initForm() {
    this.postForm = this.fb.group({
      id: [],
      type: ['post'],
      avatar: [false],
      name: [false],
      address: [false],
      deleted_at: [false],
      text_group: [false],
      details: this.fb.group({
        w: [1024, Validators.required],
        h: [1024, Validators.required],
        backgroundUrl: ['', Validators.required],
        data: this.fb.array([])
      })
    });
    // Subscribe to value changes for avatar, name, address, and text_group
    ['avatar', 'name', 'address', 'text_group'].forEach(controlName => {
      this.postForm.get(controlName)?.valueChanges.subscribe(value => {
        if (value) {
          this.addControlsByType(controlName);
        } else {
          this.removeControlsByType(controlName);
        }
      });
    });
    this.postForm.valueChanges.subscribe((data: Post) => {
      this.makeDataForImage(data);
    })
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
          return {
            index: index,
            type: 'text_group',
            data: (item as TextGroupDetails).data.map((textItem: TextDetails, index) => {
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
                textAlign: textItem.textAlign || ''
              };
            })
          };
        } else if (item.type === 'avatar') {
          return {
            index: index,
            type: 'avatar',
            r: (item as AvatarDetails).r || 0,
            borderwidth: (item as AvatarDetails).borderwidth || 0,
            bordercolor: (item as AvatarDetails).bordercolor || '',
            imageUrl: this.user.image || 'assets/images/jpeg/profile-1.jpeg',
            x: (item as AvatarDetails).x || 0,
            y: (item as AvatarDetails).y || 0
          };
        } else if (item.type === 'name' || item.type === 'address') {
          return {
            index: index,
            type: item.type,
            x: item.x,
            y: item.y,
            fs: item.fs,
            text: item.type == 'name' ? this.userFullName : item.type == 'address' ? this.address : item.type,
            fw: item.fw,
            fontStyle: {
              italic: item.fontStyle?.italic || false,
              underline: item.fontStyle?.underline || false
            },
            textAlign: item.textAlign || ''
          };
        } else {
          return {
            index: index,
          };
        }
      }).filter(item => item !== null)
    };
    this.drawSVG(e);
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

  async drawSVG(e: any) {
    const { svgWidth, svgHeight, background, viewBox, elements } = e;
    const backgroundUrl = await this.getImageDataUrl(background);

    const svg = this.imageDraw.nativeElement;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    this.renderer.setAttribute(svg, 'viewBox', viewBox);
    const b = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
    this.renderer.setAttribute(b, 'x', '0');
    this.renderer.setAttribute(b, 'y', '0');
    this.renderer.setAttribute(b, 'width', '100%'); // Set width to 100%
    this.renderer.setAttribute(b, 'height', '100%'); // Set height to 100%
    this.renderer.setAttribute(b, 'preserveAspectRatio', 'xMidYMid slice'); // Use slice to cover and maintain aspect ratio
    this.renderer.setAttribute(b, 'href', backgroundUrl);
    this.renderer.appendChild(svg, b);
    elements.forEach((element: any) => {
      if (element.type === 'name' || element.type === 'address') {
        const text = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
        const textAttributes = {
          'data-type': element.type,
          'x': element.x.toString(),
          'y': element.y.toString(),
          'font-size': element.fs,
          'fill': '#FFF',
          'text-anchor': this.textPosition(element.textAlign),
          'dominant-baseline': 'reset-size',
        };
        let textDecoration = '';
        let fontstyle = '';
        if (element.fontStyle.underline) {
          textDecoration += 'underline ';
        }
        if (element.fontStyle.italic) {
          fontstyle += 'italic ';
        }
        const textStyles = {
          '-webkit-user-select': 'none',
          'font-family': "'Hind Vadodara', sans-serif",
          'font-weight': element.fw.toString(),
          'text-decoration': textDecoration.trim(),
          'font-style': fontstyle.trim(),
        };
        Object.entries(textAttributes).forEach(([key, value]) => this.renderer.setAttribute(text, key, value));
        Object.entries(textStyles).forEach(([key, value]) => {this.renderer.setStyle(text, key, value)});

        if (element.text) {
          this.renderer.appendChild(text, this.renderer.createText(element.text));
        }
        this.renderer.appendChild(svg, text);
      } else if (element.type === 'avatar') {
        const circle = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(circle, 'data-type', 'avatar');
        this.renderer.setAttribute(circle, 'cx', element.x.toString());
        this.renderer.setAttribute(circle, 'cy', element.y.toString());
        this.renderer.setAttribute(circle, 'r', element.r.toString());
        this.renderer.setAttribute(circle, 'fill', 'url(#image-pattern)');
        this.renderer.setAttribute(circle, 'stroke', element.bordercolor);
        this.renderer.setAttribute(circle, 'stroke-width', element.borderwidth);
        this.renderer.setStyle(circle, 'cursor', 'grab');
        this.renderer.setStyle(circle, 'filter', 'url(#shadow)');
        this.renderer.appendChild(svg, circle);
        const imagePattern = this.renderer.createElement('pattern', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(imagePattern, 'id', 'image-pattern');
        this.renderer.setAttribute(imagePattern, 'x', '0%');
        this.renderer.setAttribute(imagePattern, 'y', '0%');
        this.renderer.setAttribute(imagePattern, 'height', '100%');
        this.renderer.setAttribute(imagePattern, 'width', '100%');
        this.renderer.setAttribute(imagePattern, 'viewBox', '0 0 100 100');

        const image = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(image, 'x', '0');
        this.renderer.setAttribute(image, 'y', '0');
        this.renderer.setAttribute(image, 'width', '100');
        this.renderer.setAttribute(image, 'height', '100');
        this.renderer.setAttribute(image, 'href', element.imageUrl);

        this.renderer.appendChild(imagePattern, image);
        this.renderer.appendChild(svg, imagePattern);
      }
    })
    this.addDraggableBehavior(svgWidth, svgHeight, elements);

  }
  get detailsData(): FormArray {
    return this.postForm.get('details')?.get('data') as FormArray;
  }
  
  private addAvatarControls() {
    const avatarFormGroup = this.fb.group({
      type: ['avatar'],
      r: [100, Validators.required],
      borderwidth: [10, Validators.required],
      bordercolor: ['#FFF', Validators.required],
      x: [300, Validators.required],
      y: [300, Validators.required]
    });
    const dataFormArray = this.postForm.get('details.data') as FormArray;
    dataFormArray.push(avatarFormGroup);
  }
  private addNameControls() {
    const nameFormGroup = this.fb.group({
      type: ['name'],
      x: [10, Validators.required],
      y: [10, Validators.required],
      fs: [30, Validators.required],
      fw: '400',
      fontStyle: this.fb.group({
        italic: [false],
        underline: [false]
      }),
      textAlign: ['center', Validators.required]
    });
    const dataFormArray = this.postForm.get('details.data') as FormArray;
    dataFormArray.push(nameFormGroup);
  }
  private addAddressControls() {
    const addressFormGroup = this.fb.group({
      type: ['address'],
      x: [10, Validators.required],
      y: [10, Validators.required],
      fs: [30, Validators.required],
      fw: '400',
      fontStyle: this.fb.group({ // Add fontStyle group
        italic: [false],
        underline: [false]
      }),
      textAlign: ['center', Validators.required]
    });
    const dataFormArray = this.postForm.get('details.data') as FormArray;
    dataFormArray.push(addressFormGroup);
  }
  private addTextGroupControls() {
    const textGroupFormGroup = this.fb.group({
      type: ['text_group'],
      data: this.fb.array([
        this.fb.group({
          type: ['name'],
          x: [10, Validators.required],
          y: [10, Validators.required],
          fs: [30, Validators.required],
          fw: '400',
          fontStyle: this.fb.group({
            italic: [false],
            underline: [false]
          }),
          textAlign: ['center', Validators.required]
        }),
        this.fb.group({
          type: ['address'],
          x: [10, Validators.required],
          y: [10, Validators.required],
          fs: [30, Validators.required],
          fw: '400',
          fontStyle: this.fb.group({
            italic: [false],
            underline: [false]
          }),
          textAlign: ['center', Validators.required]
        })
      ])
    });

    const dataFormArray = this.postForm.get('details.data') as FormArray;
    dataFormArray.push(textGroupFormGroup);
  }
  private removeControls(type: string) {
    const dataFormArray = this.postForm.get('details.data') as FormArray;
    for (let i = dataFormArray.length - 1; i >= 0; i--) {
      const dataFormGroup = dataFormArray.at(i) as FormGroup;
      if (dataFormGroup.get('type')?.value === type) {
        dataFormArray.removeAt(i);
      }
    }
  }
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
      case 'text_group':
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
      case 'text_group':
        this.removeControls('text_group');
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
  formArray(control: any) {
    return control as FormArray;
  }

  getAllPosts(): void {
    this.postService.getAllPosts(this.currentPage)
      .subscribe(posts => {
        this.posts = posts;
        console.log(this.imageDraw)
      });
  }
  getPostById(postId: any): void {

    this.postService.getPostById(postId)
      .subscribe(post => {
        this.postEdit = post;
        this.showControl('add');
        this.postForm.reset();
        this.postForm.setValue(this.postEdit);
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

  addPost(newPostData: any): void {
    this.postService.addPost(newPostData)
      .subscribe(response => {
        console.log(response); // Log success message or handle response accordingly
        // After adding, refresh the post list
        this.getAllPosts();
        this.getTotalPostLength(); // Refresh total post count
      }, error => {
        console.error(error); // Handle error appropriately
      });
  }

  updatePost(newData: Post): void {
    this.postService.updatePost(newData)
      .subscribe(response => {
        console.log(response); // Log success message or handle response accordingly
        // After updating, refresh the post list
        this.getAllPosts();
      }, error => {
        console.error(error); // Handle error appropriately
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
  onSubmit() {
    if (this.postForm.valid) {
      const formData = this.postForm.value;
      if (formData.id === null) {
        // If id is null, it's a new post, so add it
        const { id, ...formDataWithoutId } = formData; // Destructure id and get formDataWithoutId
        this.addPost(formDataWithoutId);
      } else {
        this.updatePost(formData);
      }
      console.log('Form submitted!', formData);
      // You can also call a service to send the form data to the server
    } else {
      // If the form is invalid, mark all fields as touched to display validation errors
      this.postForm.markAllAsTouched();
    }
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
  async getImageDataUrl(imageUrl: string): Promise<string> {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert the blob to a data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching or converting image:', error);
      throw error;
    }
  }
  selectedElement: any;
  elementForm!: FormGroup | null;
  offsetX = 0;
  offsetY = 0;
  addDraggableBehavior(svgWidth: number,
    svgHeight: number, elements: any): void {
    elements.forEach((element: any) => {
      const svgElement = this.imageDraw.nativeElement as SVGSVGElement;
      const draggableElement = svgElement.querySelector(`[data-type="${element.type}"]`);
      if (draggableElement) {
        let isDragging = false;
        this.renderer.setAttribute(draggableElement, 'cursor', 'grab');
        const onMouseDown = (event: MouseEvent) => {
          this.selectedElement = element;
          isDragging = true;
          console.log(event);
          const svgPoint = this.getMousePosition(event, svgElement);
          const clickedX = svgPoint.x;
          const clickedY = svgPoint.y;
          let elementX;
          let elementY;
          if (element.type === 'avatar') {
            elementX = parseFloat(draggableElement.getAttribute('cx') || '0');
            elementY = parseFloat(draggableElement.getAttribute('cy') || '0');
          } else {
            elementX = parseFloat(draggableElement.getAttribute('x') || '0');
            elementY = parseFloat(draggableElement.getAttribute('y') || '0');
          }
          this.offsetX = elementX - clickedX;
          this.offsetY = elementY - clickedY;
          this.renderer.setAttribute(draggableElement, 'cursor', 'grabbing');
        };

        const onMouseMove = (event: MouseEvent) => {
          if (isDragging) {
            const svgPoint = this.getMousePosition(event, svgElement);
            const draggableElement = svgElement.querySelector(`[data-type="${element.type}"]`) as SVGGraphicsElement;
            if (draggableElement) {
              let x, y;
              let r = 0;
              if (element.type === 'avatar') {
                x = parseFloat(draggableElement.getAttribute('cx') || '0');
                y = parseFloat(draggableElement.getAttribute('cy') || '0');
                r = parseFloat(draggableElement.getAttribute('r') || '0');
              } else {
                x = parseFloat(draggableElement.getAttribute('x') || '0');
                y = parseFloat(draggableElement.getAttribute('y') || '0');
              }
              if (x && y) {
                const oX = svgPoint.x - x + this.offsetX;
                const oY = svgPoint.y - y + this.offsetY;
                const newX = x + oX;
                const newY = y + oY;
                let minX = 30 + r;
                let minY = 30 + r;
                let maxX = svgWidth - (draggableElement.getBBox().width + minX) + 2 * r;
                let maxY = svgHeight - (draggableElement.getBBox().height + minY) + 2 * r;
                const textAnchor = draggableElement.getAttribute('text-anchor');
                if (textAnchor) {
                  console.log(draggableElement.getBBox())
                  minY += draggableElement.getBBox().height / 2;
                  maxY += draggableElement.getBBox().height;
                  switch (textAnchor) {
                    case 'middle':
                      minX += draggableElement.getBBox().width / 2;
                      maxX += draggableElement.getBBox().width / 2;
                      break;
                    case 'start':

                      break;
                    case 'end':
                      minX += draggableElement.getBBox().width;
                      maxX += draggableElement.getBBox().width;
                      break;
                    default:
                      // Handle other cases if needed
                      break;
                  }
                }

                const adjustedX = Math.floor(Math.min(Math.max(newX, minX), maxX));
                const adjustedY = Math.floor(Math.min(Math.max(newY, minY), maxY));
                element.x = adjustedX;
                element.y = adjustedY;

                if (element.type === 'avatar') {
                  this.renderer.setAttribute(draggableElement, 'cx', adjustedX.toString());
                  this.renderer.setAttribute(draggableElement, 'cy', adjustedY.toString());
                } else {
                  this.renderer.setAttribute(draggableElement, 'x', adjustedX.toString());
                  this.renderer.setAttribute(draggableElement, 'y', adjustedY.toString());
                }

                this.setData(element);

              }
            }
          }
        };
        const onMouseUp = () => {
          isDragging = false;
          this.renderer.setAttribute(draggableElement, 'cursor', 'grab');
        };
        this.renderer.listen(draggableElement, 'mousedown', onMouseDown);
        this.renderer.listen(draggableElement, 'touchstart', onMouseDown);
        this.renderer.listen(svgElement, 'mousemove', onMouseMove);
        this.renderer.listen(svgElement, 'touchmove', onMouseMove);
        this.renderer.listen(svgElement, 'mouseup', onMouseUp);
        this.renderer.listen(svgElement, 'mouseleave', onMouseUp);
        this.renderer.listen(svgElement, 'touchend', onMouseUp);
      }
    });
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

  setData(element: any) {
    const dataControl = this.postForm.get('details')?.get('data');
    if (dataControl instanceof FormArray) {
      const e = dataControl.controls[element.index];
      e.get('x')?.patchValue(element.x, { emitEvent: false });
      e.get('y')?.patchValue(element.y, { emitEvent: false });
    }
  }
}
