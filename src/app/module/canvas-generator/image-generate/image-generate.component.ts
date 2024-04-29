import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CircleProperties, EllipseProperties, ImageElement, LineProperties, PostDetails, RectProperties, SvgProperties, TextElement } from 'src/app/common/interfaces/image-element';
import { ColorService } from 'src/app/common/services/color.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { PostDetailService } from 'src/app/common/services/post-detail.service';
import { FontService } from 'src/app/common/services/fonts.service';
declare const bootstrap: any;

interface Data {
  title: string;
  editable: boolean;
  boxed: boolean;
  rect?: RectProperties;
  circle?: CircleProperties;
  ellipse?: EllipseProperties;
  line?: LineProperties;
  text?: TextElement;
  image?: ImageElement;
}
interface ShapeControl {
  id: string,
  title: string;
  active: boolean;
  icon: string;
}

interface ShapeControls {
  rect: ShapeControl[];
  circle: ShapeControl[];
  ellipse: ShapeControl[];
  line: ShapeControl[];
  text: ShapeControl[];
  image: ShapeControl[];
}
@Component({
  selector: 'app-image-generate',
  templateUrl: './image-generate.component.html',
  styleUrls: ['./image-generate.component.scss']
})
export class ImageGenerateComponent implements OnInit, AfterViewInit {
  @ViewChild('controlGroup') controlGroup!: ElementRef;
  isExpanded: boolean = false;
  selectedElement: number | null = null;
  colorSet: string[] = [];
  controlSet: ShapeControl[][] = [];
  controlValues: ShapeControls = {
    rect: [
      { id: 'fill', title: 'Fill', icon: 'fa-x-fill', active: false },
      { id: 'dimension', title: 'Dimension', icon: 'fa-x-dimension', active: false },
      { id: 'opacity', title: 'Opacity', icon: 'fa-x-opacity', active: false },
      { id: 'rotate', title: 'Rotation', icon: 'fa-x-rotation', active: false },
      { id: 'origin', title: 'Origin', icon: 'fa-x-origin', active: false },
      { id: 'position', title: 'Position', icon: 'fa-x-position', active: false },
      { id: 'control', title: 'Control', icon: 'fa-x-control', active: false }
    ],
    circle: [
      { id: 'fill', title: 'Fill', icon: 'fa-x-fill', active: false },
      { id: 'dimension', title: 'Dimension', icon: 'fa-x-dimension', active: false },
      { id: 'opacity', title: 'Opacity', icon: 'fa-x-opacity', active: false },
      { id: 'origin', title: 'Origin', icon: 'fa-x-origin', active: false },
      { id: 'position', title: 'Position', icon: 'fa-x-position', active: false },
      { id: 'control', title: 'Control', icon: 'fa-x-control', active: false }],
    ellipse: [
      { id: 'position', title: 'Position', icon: 'fa-x-position', active: false },
      { id: 'dimension', title: 'Dimension', icon: 'fa-x-dimension', active: false },
      { id: 'fill', title: 'Fill', icon: 'fa-x-fill', active: false },
      { id: 'opacity', title: 'opacity', icon: 'fa-x-opacity', active: false },
      { id: 'originX', title: 'originX', icon: 'fa-', active: false },
      { id: 'originY', title: 'originY', icon: 'fa-', active: false },
      { id: 'rotate', title: 'rotate', icon: 'fa-', active: false },
      { id: 'control', title: 'Control', icon: 'fa-x-control', active: false }],
    line: [
      { id: 'position', title: 'Position', icon: 'fa-x-position', active: false },
      { id: 'dimension', title: 'Dimension', icon: 'fa-x-dimension', active: false },
      { id: 'fill', title: 'Fill', icon: 'fa-x-fill', active: false },
      { id: 'opacity', title: 'opacity', icon: 'fa-x-opacity', active: false },
      { id: 'originX', title: 'originX', icon: 'fa-', active: false },
      { id: 'originY', title: 'originY', icon: 'fa-', active: false },
      { id: 'rotate', title: 'rotate', icon: 'fa-', active: false },
      { id: 'control', title: 'Control', icon: 'fa-x-control', active: false }
    ],
    text: [
      { id: 'edit', title: 'Edit', icon: 'fa-x-edit', active: false },
      { id: 'fill', title: 'Fill', icon: 'fa-x-fill', active: false },
      { id: 'fontSize', title: 'Size', icon: 'fa-x-font-size', active: false },
      { id: 'fontStyle', title: 'Style', icon: 'fa-italic', active: false },
      { id: 'textAlign', title: 'Alignment', icon: 'fa-align-left', active: false },
      { id: 'fontFamily', title: 'Font', icon: 'fa-font', active: false },
      { id: 'fontWeight', title: 'Weight', icon: 'fa-bold', active: false },
      { id: 'textShadow', title: 'Shadow', icon: 'fa-eye-slash', active: false },
      { id: 'textBackground', title: 'Background', icon: 'fa-x-text-background', active: false },
      { id: 'textEffects', title: 'Effects', icon: 'fa-magic', active: false },
      { id: 'letterSpacing', title: 'Spacing', icon: 'fa-arrows-h', active: false },
      { id: 'lineHeight', title: 'Line Height', icon: 'fa-arrows-v', active: false },
      { id: 'textTransformation', title: 'Transformation', icon: 'fa-text-width', active: false },
      { id: 'opacity', title: 'Opacity', icon: 'fa-x-opacity', active: false },
      { id: 'position', title: 'Position', icon: 'fa-x-position', active: false },
      { id: 'dimension', title: 'Dimension', icon: 'fa-x-dimension', active: false },
      { id: 'control', title: 'Control', icon: 'fa-x-control', active: false },
      { id: 'rotate', title: 'Rotation', icon: 'fa-x-rotation', active: false }
    ],
    image: [
      { id: 'position', title: 'Position', icon: 'fa-x-position', active: false },
      { id: 'edit', title: 'Edit', icon: 'fa-x-edit', active: false },
      { id: 'dimension', title: 'Dimension', icon: 'fa-x-dimension', active: false },
      { id: 'fill', title: 'Fill', icon: 'fa-x-fill', active: false },
      { id: 'opacity', title: 'opacity', icon: 'fa-x-opacity', active: false },
      { id: 'origin', title: 'Origin', icon: 'fa-x-origin', active: false },
      { id: 'rotate', title: 'rotate', icon: 'fa-x-rotation', active: false },
      { id: 'url', title: 'URL', icon: 'fa-link', active: false },
      { id: 'control', title: 'Control', icon: 'fa-x-control', active: false },
    ]

  }

  fontFamilies:{ family: string; variables: string[]; names: string[]; }[] = []
  postDetailsForm: FormGroup | undefined = undefined;
  imgParam: any;
  postDetails: PostDetails = {
    "id": null,
    "deleted": false,
    "download_counter": 0,
    "h": 1024,
    "w": 1024,
    "title": "image",
    "info": "",
    "info_show": true,
    "backgroundurl": "https://images.unsplash.com/photo-1564053489984-317bbd824340?q=80&w=2096&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "data": [
      {
        "title": "Text 1",
        "editable": true,
        "boxed": true,
        "text": {
          "x": 706,
          "y": 955,
          "fs": 40,
          "fw": "normal",
          "text": "Sample Text",
          "color": "#FFFFFF",
          "fontStyle": {
            "italic": false,
            "underline": false
          },
          "textAlign": "left",
          "rotate": 0,
          "fontFamily": "Noto Sans Gujarati",
          "textShadow": {
            "enable": false,
            "color": "#FFFFFF",
            "blur": 0,
            "offsetX": 0,
            "offsetY": 0
          },
          "backgroundColor": "#FFFFFF",
          "textEffects": {
            "enable": false,
            "gradient": {
              "enable": false,
              "startColor": "#ffffff",
              "endColor": "#000000",
              "direction": "horizontal"
            },
            "outline": {
              "enable": false,
              "color": "#FFFFFF",
              "width": 2
            },
            "glow": {
              "enable": false,
              "color": "#ffffff",
              "blur": 0
            }
          },
          "textAnchor": "start",
          "alignmentBaseline": "start",
          "letterSpacing": 0,
          "lineHeight": 1.5,
          "textTransformation": "none",
          "opacity": 100,
          "originX": 0,
          "originY": 0
        }
      }
    ]
  }
  confirmDelete: any;
  constructor(
    private fb: FormBuilder,
    private colorService: ColorService,
    private route: ActivatedRoute,
    private PS: PostDetailService,
    private fontService: FontService
  ) {
    this.route.queryParams.subscribe(params => {
      this.imgParam = params['img'];
    });
    this.fontFamilies = this.fontService.fontFamilies
  }
  async getColors(image: string, colorCounts: number) {
    try {
      this.colorSet = await this.colorService.getColors(image, colorCounts);
    } catch (error) {
      console.error("Error updating colors:", error);
    }
  }
  getColorClass(isActive: boolean): string {
    if (isActive) {
      return '';
    } else {
      return 'shadow border border-light border-3';
    }
  }
  updateColor(event: any, control: any) {
    const value = (event.target as HTMLInputElement).value;
    control?.setValue(value);
  }
  updateValue(d: { data: Data, index: number }) {
    const value = this.postDetailsForm?.get('data') as FormArray | null;
    if (value) {
      const t = value.at(d.index) as FormControl | null;
      if (t) {
        t.patchValue(d.data, { emitEvent: true });
      } else {
        console.error(`Form control at index ${d.index} not found.`);
      }
    } else {
      console.error(`Form array 'data' not found.`);
    }
  }
  getSelected(d: { index: number }) {
    this.selectedElement = d.index;
  }

  getPostById(postId: any): void {
    this.PS.getPostById(postId)
      .subscribe(
        post => {
          if (post) {
            this.postDetails = post;
            this.initForm();
          } else {
          }
        },
        error => {
          console.error('Error fetching post:', error);
        }
      );
  }

  initForm() {
    this.postDetailsForm = this.fb.group({
      id: [this.postDetails.id],
      deleted: [this.postDetails.deleted, Validators.required],
      h: [this.postDetails.h, Validators.required],
      w: [this.postDetails.w, Validators.required],
      title: [this.postDetails.title, Validators.required],
      backgroundurl: [this.postDetails.backgroundurl, Validators.required],
      download_counter: [this.postDetails.download_counter, Validators.required],
      info: [this.postDetails.info || '', Validators.required],
      info_show: [this.postDetails.info_show || '', Validators.required],
      data: this.fb.array([])
    });
    this.postDetailsForm?.get('backgroundurl')?.valueChanges.subscribe((value: PostDetails) => {
      this.getColors(this.postDetails.backgroundurl, 10);
    });
    this.getColors(this.postDetails.backgroundurl, 10);
    this.postDetails.data.forEach((d) => {
      d.rect && this.addData('rect', d);
      d.circle && this.addData('circle', d);
      d.ellipse && this.addData('ellipse', d);
      d.line && this.addData('line', d);
      d.text && this.addData('text', d);
      d.image && this.addData('image', d);
    })
    this.rebuild(this.postDetails.data)
  }
  get dataArray() {
    return this.postDetailsForm?.get('data') as FormArray;
  }
  addData(t: string, value?: Data) {
    let d: FormGroup = this.fb.group({})
    switch (t) {
      case 'rect':
        d = this.createRectFormGroup(value || this.rectData);
        this.controlSet.push(this.controlValues.rect);
        break;
      case 'circle':
        d = this.createCircleFormGroup(value || this.circleData);
        this.controlSet.push(this.controlValues.circle);
        break;
      case 'ellipse':
        d = this.createEllipseFormGroup(value || this.ellipseData);
        this.controlSet.push(this.controlValues.ellipse);
        break;
      case 'line':
        d = this.createLineFormGroup(value || this.lineData);
        this.controlSet.push(this.controlValues.line);
        break;
      case 'text':
        d = this.createTextFormGroup(value || this.textData);
        this.controlSet.push(this.controlValues.text);
        break;
      case 'image':
        d = this.createImageFormGroup(value || this.imageData);
        this.controlSet.push(this.controlValues.image);
        break;
      default:
        console.error('Invalid type');
        break;
    }
    d && this.dataArray.push(d);
    this.postDetails = this.postDetailsForm?.value;
    this.selectedElement = this.dataArray.length;
  }
  removeData(index: number) {
    this.dataArray.removeAt(index);
    this.postDetails = this.postDetailsForm?.value;
    this.rebuild(this.postDetails.data);
  }
  rectData = {
    title: "Rect",
    editable: false,
    boxed: true,
    rect: {
      x: 30,
      y: 30,
      width: 100,
      height: 50,
      fill: "#FFFFFF",
      opacity: 0.8,
      originX: 5,
      originY: 5,
      rotate: 0,
    }
  };
  createRectFormGroup(r: Data): FormGroup {
    return this.fb.group({
      title: [r.title || '', Validators.required],
      editable: [r.editable || false],
      boxed: [r.boxed || false],
      rect: this.fb.group({
        x: [r.rect?.x || 0, Validators.required],
        y: [r.rect?.y || 0, Validators.required],
        width: [r.rect?.width || 150, Validators.required],
        height: [r.rect?.height || 150, Validators.required],
        fill: [r.rect?.fill || '#000000', Validators.required],
        opacity: [r.rect?.opacity || '1', Validators.required],
        originX: [r.rect?.originX || 0, Validators.required],
        originY: [r.rect?.originY || 0, Validators.required],
        rotate: [r.rect?.rotate || 0, Validators.required]
      })
    });
  }

  circleData = {
    title: "Circle 1",
    editable: false,
    boxed: true,
    circle: {
      cx: 50,
      cy: 50,
      r: 30,
      fill: "#FFFFFF",
      opacity: 1,
      originX: 0,
      originY: 0
    }
  };

  createCircleFormGroup(c: Data): FormGroup {
    return this.fb.group({
      title: [c.title, Validators.required],
      editable: [c.editable],
      boxed: [c.boxed],
      circle: this.fb.group({
        cx: [c.circle?.cx, Validators.required],
        cy: [c.circle?.cy, Validators.required],
        r: [c.circle?.r, Validators.required],
        fill: [c.circle?.fill, Validators.required],
        opacity: [c.circle?.opacity, Validators.required],
        originX: [c.circle?.originX, Validators.required],
        originY: [c.circle?.originY, Validators.required]
      })
    })
  }
  ellipseData = {
    title: "Ellipse 1",
    editable: false,
    boxed: true,
    ellipse: {
      cx: 100,
      cy: 100,
      rx: 50,
      ry: 30,
      fill: "green",
      opacity: 0.8,
      originX: 0,
      originY: 0,
      rotate: 0
    }
  };
  createEllipseFormGroup(e: Data): FormGroup {
    return this.fb.group({
      title: [e.title, Validators.required],
      editable: [e.editable],
      boxed: [e.boxed],
      ellipse: this.fb.group({
        cx: [e.ellipse?.cx, Validators.required],
        cy: [e.ellipse?.cy, Validators.required],
        rx: [e.ellipse?.rx, Validators.required],
        ry: [e.ellipse?.ry, Validators.required],
        fill: [e.ellipse?.fill, Validators.required],
        opacity: [e.ellipse?.opacity, Validators.required],
        originX: [e.ellipse?.originX, Validators.required],
        originY: [e.ellipse?.originY, Validators.required],
        rotate: [e.ellipse?.rotate, Validators.required]
      })
    });
  }
  lineData = {
    title: "Line 1",
    editable: false,
    boxed: true,
    line: {
      x1: 50,
      y1: 50,
      x2: 150,
      y2: 150,
      stroke: "black",
      strokeWidth: 2,
      opacity: 1,
      originX: 0,
      originY: 0,
      rotate: 0
    }
  };

  createLineFormGroup(l: Data): FormGroup {
    return this.fb.group({
      title: [l.title, Validators.required],
      editable: [l.editable],
      boxed: [l.boxed],
      line: this.fb.group({
        x1: [l.line?.x1, Validators.required],
        y1: [l.line?.y1, Validators.required],
        x2: [l.line?.x2, Validators.required],
        y2: [l.line?.y2, Validators.required],
        stroke: [l.line?.stroke, Validators.required],
        strokeWidth: [l.line?.strokeWidth, Validators.required],
        opacity: [l.line?.opacity, Validators.required],
        originX: [l.line?.originX, Validators.required],
        originY: [l.line?.originY, Validators.required],
        rotate: [l.line?.rotate, Validators.required]
      })
    });
  }
  textData: { title: string, editable: boolean, boxed: boolean, text: TextElement } = {
    title: "Text 1",
    editable: true,
    boxed: true,
    text: {
      x: 100,
      y: 100,
      fs: 40,
      fw: "normal",
      text: "Sample Text",
      color: "#FFFFFF",
      fontStyle: {
        italic: false,
        underline: false
      },
      textAlign: "left",
      rotate: 0,
      fontFamily: "Noto Sans Gujarati",
      textShadow: {
        enable: false,
        color: "#FFFFFF",
        blur: 0,
        offsetX: 0,
        offsetY: 0
      },
      backgroundColor: "#FFFFFF",
      textEffects: {
        enable: false,
        gradient: {
          enable: false,
          startColor: "#ffffff",
          endColor: "#000000",
          direction: "horizontal"
        },
        outline: {
          enable: false,
          color: "#FFFFFF",
          width: 2
        },
        glow: {
          enable: false,
          color: "#ffffff",
          blur: 0
        }
      },
      textAnchor: "start",
      alignmentBaseline: 'middle',
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransformation: "none",
      opacity: 100,
      originX: 0,
      originY: 0
    }
  };
  createTextFormGroup(t: Data): FormGroup {
    return this.fb.group({
      title: [t.title, Validators.required],
      editable: [t.editable],
      boxed: [t.boxed],
      text: this.fb.group({
        x: [t.text?.x, Validators.required],
        y: [t.text?.y, Validators.required],
        fs: [t.text?.fs, Validators.required],
        fw: [t.text?.fw, Validators.required],
        text: [t.text?.text, Validators.required],
        color: [t.text?.color, Validators.required],
        fontStyle: this.fb.group({
          italic: [t.text?.fontStyle.italic, Validators.required],
          underline: [t.text?.fontStyle.underline, Validators.required]
        }),
        textAlign: [t.text?.textAlign, Validators.required],
        rotate: [t.text?.rotate, Validators.required],
        fontFamily: [t.text?.fontFamily, Validators.required],
        textShadow: this.fb.group({
          enable: [t.text?.textShadow.enable],
          color: [t.text?.textShadow.color],
          blur: [t.text?.textShadow.blur],
          offsetX: [t.text?.textShadow.offsetX],
          offsetY: [t.text?.textShadow.offsetY]
        }),
        backgroundColor: [t.text?.backgroundColor, Validators.required],
        textEffects: this.fb.group({
          enable: [false],
          gradient: this.fb.group({
            enable: [false],
            startColor: [t.text?.textEffects.gradient.startColor, Validators.required],
            endColor: [t.text?.textEffects.gradient.endColor, Validators.required],
            direction: [t.text?.textEffects.gradient.direction, Validators.required]
          }),
          outline: this.fb.group({
            enable: [false],
            color: [t.text?.textEffects.outline.color, Validators.required],
            width: [t.text?.textEffects.outline.width, Validators.required]
          }),
          glow: this.fb.group({
            enable: [false],
            color: [t.text?.textEffects.glow.color, Validators.required],
            blur: [t.text?.textEffects.glow.blur, Validators.required]
          })
        }),
        textAnchor: [t.text?.textAnchor],
        alignmentBaseline: [t.text?.textAnchor],
        letterSpacing: [t.text?.letterSpacing, Validators.required],
        lineHeight: [t.text?.lineHeight, Validators.required],
        textTransformation: [t.text?.textTransformation, Validators.required],
        opacity: [t.text?.opacity, Validators.required],
        originX: [t.text?.originX],
        originY: [t.text?.originY]
      })
    });
  }
  updateFontWeights(c: AbstractControl<any, any>) {
    let selectedFontFamily = c.value;
    const parentFormGroup = c.parent;
    const f = this.fontFamilies.find(family => family.family === selectedFontFamily);
    if (!f) {
      selectedFontFamily = ('Noto Sans Gujarati')
    }
    if (selectedFontFamily && parentFormGroup) {
      const font = this.fontFamilies.find(f => f.family === selectedFontFamily);
      const fontWeights = font ? font.variables : [];
      const currentValue = parentFormGroup.get('fw')?.value;
      if (!fontWeights.includes(currentValue)) {
        parentFormGroup.get('fw')?.patchValue(fontWeights[0] || '400');
      }
    }
  }
  getWeight(c: AbstractControl<any, any>) {
    const selectedFontFamily = c.value;
    const f = this.fontFamilies.find(family => family.family === selectedFontFamily);
    if (f) {
      return f.variables;
    } else {
      return []
    }
  }
  createSvgPropertiesFormGroup(svg: SvgProperties): FormGroup {
    return this.fb.group({
      fill: [svg.fill, Validators.required],
      stroke: [svg.stroke, Validators.required],
      strokeWidth: [svg.strokeWidth, Validators.required]
    });
  }
  imageData = {
    title: "Image 1",
    editable: true,
    boxed: true,
    image: {
      r: 50,
      x: 100,
      y: 100,
      imageUrl: "assets/images/svg/upload-img.svg",
      borderColor: "#000000",
      borderWidth: 2,
      shape: "circle",
      origin: "center",
      placeholder: "Placeholder Text",
      svgProperties: {
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2
      },
      rotate: 0
    }
  };
  createImageFormGroup(i: Data): FormGroup {
    return this.fb.group({
      title: [i.title, Validators.required],
      editable: [i.editable],
      boxed: [i.boxed],
      image: this.fb.group({
        r: [i.image?.r, Validators.required],
        x: [i.image?.x, Validators.required],
        y: [i.image?.y, Validators.required],
        imageUrl: [i.image?.imageUrl, Validators.required],
        borderColor: [i.image?.borderColor, Validators.required],
        borderWidth: [i.image?.borderWidth, Validators.required],
        shape: [i.image?.shape, Validators.required],
        origin: [i.image?.origin, Validators.required],
        placeholder: [i.image?.placeholder, Validators.required],
        svgProperties: this.createSvgPropertiesFormGroup(i.image?.svgProperties!),
        rotate: [i.image?.rotate]
      })
    });
  }
  drop(event: CdkDragDrop<string[]>) {
    const dataArray = this.postDetailsForm?.get('data')?.value; // Retrieve the array of data
    if (dataArray) {
      moveItemInArray(dataArray, event.previousIndex, event.currentIndex);
    }
    this.rebuild(dataArray)
  }
  setActiveControl(rectIndex: number, controlIndex: number) {
    this.controlSet[rectIndex].forEach((control, index) => {
      control.active = index === controlIndex;
    });
  }
  getActiveControl(rectIndex: number, controlId: string): boolean {
    const controls = this.controlSet[rectIndex];
    const activeControl = controls.find(control => control.id === controlId && control.active);
    return activeControl ? true : false;
  }
  toggleExpand(event: Event) {
    event.stopPropagation();
    this.isExpanded = !this.isExpanded;
  }
  scaleFactor = 1;
  // offsetX = 0;
  // offsetY = 0;

  // @HostListener('wheel', ['$event'])
  // onWheel(event: WheelEvent) {
  //   event.preventDefault();
  //   const delta = Math.sign(event.deltaY);
  //   const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  //   const mouseX = event.clientX - rect.left;
  //   const mouseY = event.clientY - rect.top;
  //   const scaleFactorChange = delta * 0.1;
  //   this.zoomAt(mouseX, mouseY, scaleFactorChange);
  // }

  onTouch(event: TouchEvent) {
    //   event.preventDefault();
    //   if (event.touches.length === 2) {
    //     const touch1 = event.touches[0];
    //     const touch2 = event.touches[1];
    //     const distance = Math.sqrt(
    //       Math.pow(touch2.clientX - touch1.clientX, 2) +
    //       Math.pow(touch2.clientY - touch1.clientY, 2)
    //     );
    //     if (distance > 10) {
    //       const centerX = (touch1.clientX + touch2.clientX) / 2;
    //       const centerY = (touch1.clientY + touch2.clientY) / 2;
    //       const scaleFactorChange = distance / 100;
    //       this.zoomAt(centerX, centerY, scaleFactorChange);
    //     }
    //   }
  }

  // zoomAt(x: number, y: number, scaleFactorChange: number) {
  //   const prevScaleFactor = this.scaleFactor;
  //   this.scaleFactor += scaleFactorChange;
  //   const deltaX = (x - this.offsetX) * (1 - this.scaleFactor / prevScaleFactor);
  //   const deltaY = (y - this.offsetY) * (1 - this.scaleFactor / prevScaleFactor);
  //   this.offsetX -= deltaX;
  //   this.offsetY -= deltaY;
  // }
  moveDown(index: number) {
    const data = this.postDetailsForm?.get('data')?.value;
    if (index > 0) {
      let temp = data[index - 1];
      data[index - 1] = data[index];
      data[index] = temp;
      this.selectedElement = index - 1;
    }
    this.rebuild(data);
    return false;
  }
  moveUp(index: number) {
    const data = this.postDetailsForm?.get('data')?.value;
    if (index < data.length - 1) {
      const temp = data[index];
      data[index] = data[index + 1];
      data[index + 1] = temp;
      this.selectedElement = index + 1;
    }
    this.rebuild(data);
    return false;
  }

  moveToBack(index: number) {
    const data = this.postDetailsForm?.get('data')?.value;
    if (index > 0) {
      const temp = data[index];
      data.splice(index, 1);
      data.unshift(temp);
      this.selectedElement = 0;
    }
    this.rebuild(data);
    return false;
  }
  moveToTop(index: number) {
    const data = this.postDetailsForm?.get('data')?.value;
    if (index < data.length - 1) {
      const temp = data[index];
      data.splice(index, 1);
      data.push(temp);
      this.selectedElement = data.length - 1;
    }
    this.rebuild(data);
    return false;
  }
  rebuild(dataArray: Data[]) {
    this.dataArray.clear();
    this.controlSet = [];
    for (let i = 0; i < dataArray.length; i++) {
      const item = dataArray[i];
      (item.rect) && this.dataArray.push(this.createRectFormGroup(item));
      (item.rect) && this.controlSet.push(this.controlValues.rect);
      (item.circle) && this.dataArray.push(this.createCircleFormGroup(item));
      (item.circle) && this.controlSet.push(this.controlValues.circle);
      (item.ellipse) && this.dataArray.push(this.createEllipseFormGroup(item));
      (item.ellipse) && this.controlSet.push(this.controlValues.ellipse);
      (item.line) && this.dataArray.push(this.createLineFormGroup(item));
      (item.line) && this.controlSet.push(this.controlValues.line);
      (item.text) && this.dataArray.push(this.createTextFormGroup(item));
      (item.text) && this.controlSet.push(this.controlValues.text);
      (item.image) && this.dataArray.push(this.createImageFormGroup(item));
      (item.image) && this.controlSet.push(this.controlValues.image);
    }
    this.postDetailsForm?.get('data')?.setValue(dataArray);
  }
  centerActiveButton() {
    setTimeout(() => {
      const btnGroup: HTMLElement = this.controlGroup.nativeElement;
      const activeButton: HTMLElement | null = btnGroup.querySelector('.btn.active');
      if (activeButton) {
        const scrollLeft: number = activeButton.offsetLeft;
        btnGroup.scrollLeft = scrollLeft;
      }
    }, 500);
  }
  scrollToCenter(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const btnGroup: HTMLElement = this.controlGroup.nativeElement;
    const scrollLeft: number = target.offsetLeft;
    btnGroup.scrollLeft = scrollLeft;
  }
  onSubmit() {
    if (this.postDetailsForm?.valid) {
      const formData = this.postDetailsForm?.value;
      if (formData.id === null) {
        const { id, ...formDataWithoutId } = formData;
        this.addPost(formDataWithoutId);
      } else {
        this.updatePost(formData);
      }
    } else {
      // If the form is invalid, mark all fields as touched to display validation errors
      this.postDetailsForm?.markAllAsTouched();
    }
  }
  addPost(newPostData: PostDetails): void {
    this.PS.addPost(newPostData)
      .subscribe(
        (response: PostDetails) => {
          const addedDataId = response.id;
          console.log('Added data ID:', addedDataId);
          this.postDetailsForm?.get('id')?.setValue(addedDataId);
          this.postDetails.id = addedDataId
        },
        error => {
          console.error(error); // Handle error appropriately
        }
      );
  }

  updatePost(newData: PostDetails): void {
    this.PS.updatePost(newData)
      .subscribe(response => {

      }, error => {
        console.error(error); // Handle error appropriately
      });
  }
  softDelete(): void {
    const id = this.postDetailsForm?.get('id')?.value;
    id && this.PS.softDeletePost(id)
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

  hardDelete(): void {
    const id = this.postDetailsForm?.get('id')?.value;
    id && this.PS.hardDeletePost(id)
      .subscribe(
        response => {
          console.log('Hard deletion successful:', response);
        },
        error => {
          console.error('Error during hard deletion:', error);
        }
      );
  }
  onScroll(event: any) {
    const element = event.target;
    // Synchronize the horizontal scroll position with the vertical scroll position
    element.scrollLeft = element.scrollLeft;
  }

  onWheel(event: any) {
    const delta = Math.max(-1, Math.min(1, (event.deltaY || -event.detail)));
    // Horizontal scrolling only
    this.controlGroup.nativeElement.scrollLeft -= (delta * 40);
    event.preventDefault();
  }
  ngAfterViewInit(): void {

  }
  ngOnInit(): void {
    this.confirmDelete = new bootstrap.Modal(document.getElementById('confirmDelete')!, { focus: false, keyboard: false, static: false });
    this.confirmDelete._element.addEventListener('hide.bs.modal', () => {
    });
    this.confirmDelete._element.addEventListener('show.bs.modal', () => {
    });
    this.confirmDelete._element.addEventListener('shown.bs.modal', () => {
    });
    this.imgParam && this.getPostById(this.imgParam);
    !this.imgParam && this.initForm();
  }
}
