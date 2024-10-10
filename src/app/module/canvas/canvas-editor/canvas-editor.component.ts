
import { Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { selectKey, User } from 'src/app/common/interfaces/commonInterfaces';
import { Post } from 'src/app/common/interfaces/post';
import { PostService } from 'src/app/common/services/post.service';
import { SVGImageService } from 'src/app/common/services/svgimage-service.service';
import { UserService } from 'src/app/common/services/user.service';
import { VillageService } from 'src/app/common/services/village.service';
import ColorThief from 'colorthief';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-canvas-editor',
  templateUrl: './canvas-editor.component.html',
  styleUrls: ['./canvas-editor.component.scss']
})
export class CanvasEditorComponent {

  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement | HTMLElement>;

  postEdit!: Post;
  user!: User;
  userFullName!: string;
  addressList: any;
  address: string = "Enter Address";

  postForm!: FormGroup;
  types!: selectKey[];

  selectedElement: any;
  offsetX = 0;
  offsetY = 0;
  title: string | undefined = "Add Image";
  breadcrumb: any | undefined = "Add Image";
  routeData: any;

  colorSet: string[] = [];
  imgParam: any;
  constructor(
    private renderer: Renderer2,
    private fb: FormBuilder,
    private postService: PostService,
    private US: UserService,
    private VS: VillageService,
    private IMG: SVGImageService,
    private route: ActivatedRoute
  ) {

    this.initForm();
    this.route.queryParams.subscribe(params => {
      this.imgParam = params['img'];
    });
    this.US.getUser().subscribe(async (value) => {
      if (value) {
        this.user = value;
        this.userFullName = this.user['firstname'] + ' ' + this.user['lastname'];
        this.getVillage(this.user['taluka_id']);
      }
    });
  }
  isAccordionOpen: boolean[] = [];
  toggleAccordion(index: number) {
    this.isAccordionOpen[index] = !this.isAccordionOpen[index];
  }
  getPostById(postId: any): void {
    this.postService.getPostById(postId)
      .subscribe(
        post => {
          if (post) {
            this.postEdit = post;
            this.postForm.reset();
            const dataArray = this.postForm.get('details')?.get('data') as FormArray;
            dataArray.clear(); // Clear any existing controls before setting new values
            // this.postEdit.details.data.forEach((dataItem: any) => {
            //   const dataGroup: { [key: string]: any } = {};
            //   Object.entries(dataItem).forEach(([key, value]) => {
            //     dataGroup[key] = [value]; // Create a form control for each key-value pair
            //   });
            //   const formDataGroup = this.fb.group(dataGroup);
            //   dataArray.push(formDataGroup);
            // });
            this.postEdit.details.data.forEach((dataItem: any) => {
              const formDataGroup = this.createFormGroup(dataItem);
              dataArray.push(formDataGroup); // Push the new group into the FormArray
            });
            this.processPostEdit(this.postEdit)
            this.postForm?.setValue(this.postEdit, { emitEvent: false });
          } else {
          }
        },
        error => {
          console.error('Error fetching post:', error);
          this.initForm();
          this.routeData['title'] = "Add Image";
          this.routeData['breadcrumb'] = "Add Image";
        }
      );
  }
  createFormGroup(dataItem: any): FormGroup {
    const group: { [key: string]: any } = {};

    Object.entries(dataItem).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        group[key] = this.fb.array([]); // Create a FormArray for nested arrays
        value.forEach((arrayItem: any) => {
          (group[key] as FormArray).push(this.createFormGroup(arrayItem)); // Recursively create FormGroup for each array item
        });
      } else if (typeof value === 'object' && value !== null) {
        group[key] = this.createFormGroup(value); // Recursively create FormGroup for nested objects
      } else {
        group[key] = [value]; // Create a form control for each key-value pair
      }
    });

    return this.fb.group(group);
  }
  async getVillage(id: any) {
    this.VS.getVillageById(id).subscribe(
      (data) => {
        this.addressList = data.data;
        this.address = this.addressList.gu_name + ", તાલુકા : " + this.addressList.taluka_gu_name + ", જિલ્લા : " + this.addressList.district_gu_name;
        this.processPostEdit(this.postForm.value)
      },
      (error: any) => {

      }
    )
  }
  removeProperties(formData: any, types: string[]) {
    if (formData && formData.details && formData.details.data) {
      types.forEach(type => {
        this.removePropertiesRecursive(formData.details.data, type);
      });
    }
  }
  removePropertiesRecursive(data: any[], type: string) {
    data.forEach((item: any) => {
      if (item.type === type) {
        if (item.text !== undefined) {
          item.text = '';
        }
        if (item.imageUrl !== undefined) {
          item.imageUrl = '';
        }
      }
      if (item.data) {
        this.removePropertiesRecursive(item.data, type);
      }
    });
  }
  onSubmit() {
    if (this.postForm.valid) {
      const formData = this.postForm.value;
      this.removeProperties(formData, ['name', 'avatar']);
      if (formData.id === null) {
        // If id is null, it's a new post, so add it
        const { id, ...formDataWithoutId } = formData; // Destructure id and get formDataWithoutId
        this.addPost(formDataWithoutId);
      } else {
        this.updatePost(formData);
      }
    } else {
      // If the form is invalid, mark all fields as touched to display validation errors
      this.postForm.markAllAsTouched();
    }
  }
  addPost(newPostData: Post): void {
    this.postService.addPost(newPostData)
      .subscribe(response => {

      }, error => {
        console.error(error); // Handle error appropriately
      });
  }
  updatePost(newData: Post): void {
    this.postService.updatePost(newData)
      .subscribe(response => {

      }, error => {
        console.error(error); // Handle error appropriately
      });
  }
  softDeletePost(postId: string): void {
    this.postService.softDeletePost(postId)
      .subscribe(response => {
      }, error => {
        console.error(error); // Handle error appropriately
      });
  }
  hardDeletePost(postId: string): void {
    this.postService.hardDeletePost(postId)
      .subscribe(response => {
      }, error => {
        console.error(error); // Handle error appropriately
      });
  }
  formArray(control: any) {
    return control as FormArray;
  }
  get detailsData(): FormArray {
    return this.postForm.get('details')?.get('data') as FormArray;
  }
  updateTextAndImageUrl(data: Post) {
    const d: any = data.details;
    for (let i = 0; i < d.data.length; i++) {
      const item = d.data[i];
      if (item.type === 'name' || item.type === 'address') {
        item.text = item.type == 'name' ? this.userFullName : item.type == 'address' ? this.address : item.type;
      } else if (item.type === 'avatar') {
        item.imageUrl = this.user.image || 'assets/images/svg/upload-img.svg';
      }
    }
    data.details = d;
    return data;
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
        backgroundurl: ['', Validators.required],
        data: this.fb.array([])
      })
    });
    // Subscribe to value changes for avatar, name, address, and text_group
    ['avatar', 'name', 'address', 'text_group'].forEach(controlName => {
      this.postForm.get(controlName)?.valueChanges.subscribe(value => {
        if (value) {
          this.IMG.addControlsByType(controlName, this.postForm.get('details') as FormGroup);
        } else {
          this.IMG.removeControlsByType(controlName, this.postForm.get('details') as FormGroup);
        }
      });
    });
    this.postForm?.valueChanges.subscribe((data: Post) => {
      this.processPostEdit(data);
    })
  }
  async drawSVG(e: any) {
    const { svgWidth, svgHeight, background, viewBox, elements } = e;
    const backgroundurl = await this.getImageDataUrl(background);
    await this.getColors(backgroundurl);
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
    this.renderer.setAttribute(b, 'href', backgroundurl);
    this.renderer.appendChild(svg, b);
    elements.forEach((element: any, index: number) => {
      if (element.type === 'name' || element.type === 'address') {
        const text = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
        const textAttributes = {
          'data-type': element.type,
          'x': element.x.toString(),
          'y': element.y.toString(),
          'font-size': element.fs,
          'fill': element.color || '#FFF',
          'text-anchor': this.IMG.textPosition(element.textAlign),
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
        Object.entries(textStyles).forEach(([key, value]) => { this.renderer.setStyle(text, key, value) });
        if (element.text) {
          this.renderer.appendChild(text, this.renderer.createText(element.text));
          this.renderer.listen(text, 'click', () => {
            this.toggleAccordion(index);
            console.log(index)
          });
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
          const svgPoint = this.IMG.getMousePosition(event, svgElement);
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
            const svgPoint = this.IMG.getMousePosition(event, svgElement);
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
                this.IMG.setData(element, this.postForm.get('details')?.get('data') as FormArray);
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
  async getImageDataUrl(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const convertedImageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return convertedImageUrl;
    } catch (error) {
      console.error('Error fetching or converting image:', error);
      throw error;
    }
  }

  async getColors(image: string): Promise<void> {
    try {
      const colorThief = new ColorThief();
      const img = new Image();
      img.src = image;
      img.crossOrigin = "Anonymous";
      let colorCounts = 10;
      img.onload = () => {
        const dominantColors = colorThief.getPalette(img, colorCounts);
        this.colorSet = dominantColors.map((rgb: number[]) => this.rgbToHex(rgb[0], rgb[1], rgb[2]));
        this.colorSet.unshift('#000000', '#FFFFFF');
      };
      // img.onerror = (error) => {
      //     console.error("Error loading image:", error);
      // };
    } catch (error) {
      console.error("Error getting colors:", error);
    }
  }
  rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  getColorClass(isActive: boolean): string {
    if (isActive) {
      return '';
    } else {
      return 'shadow border border-light border-3';
    }
  }
  selectColor(color: string, control: FormControl) {
    control?.setValue(color);
  }

  updateColor(event: any, control: AbstractControl<any, any>) {
    const value = (event.target as HTMLInputElement).value;
    control?.setValue(value);
  }
  processPostEdit(postEdit: Post): void {
    const updatedData = this.updateTextAndImageUrl(postEdit);
    const e = this.IMG.makeDataForImage(updatedData);
    this.drawSVG(e);
  }
  ngOnInit() {
    this.types = [
      { id: 'post', name: 'Post' }
    ];
  }
  ngAfterViewInit() {
    this.imgParam && this.getPostById(this.imgParam);
  }
}
