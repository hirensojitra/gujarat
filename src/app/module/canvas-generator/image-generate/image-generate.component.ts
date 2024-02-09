import { Component, HostListener } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CircleProperties, EllipseProperties, ImageElement, LineProperties, PostDetails, RectProperties, SvgProperties, TextElement } from 'src/app/common/interfaces/image-element';

interface Data {
  title: string,
  rect?: RectProperties,
  circle?: CircleProperties,
  ellipse?: EllipseProperties,
  line?: LineProperties,
  text?: TextElement,
  image?: ImageElement
}
@Component({
  selector: 'app-image-generate',
  templateUrl: './image-generate.component.html',
  styleUrls: ['./image-generate.component.scss']
})
export class ImageGenerateComponent {
  updateValue(d: { data: Data, index: number }) {
    console.log(d)
    const value = this.postDetailsForm.get('data') as FormArray | null;
    if (value) {
      const t = value.at(d.index) as FormControl | null;
      if (t) {
        t.patchValue(d.data, { emitEvent: true});
      } else {
        console.error(`Form control at index ${d.index} not found.`);
      }
    } else {
      console.error(`Form array 'data' not found.`);
    }
  }

  getTitle(item: AbstractControl<any>): string | null {
    const title = ['rect', 'circle', 'ellipse', 'line', 'text', 'image'];
    let firstTitle: string | null = null;
    title.some(key => {
      if (item.get(key) !== null) {
        firstTitle = key;
        return true; // Exit the loop once the first existing key is found
      }
      return false;
    });
    return firstTitle;
  }

  postDetailsForm!: FormGroup;
  postDetails!: PostDetails;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.postDetails = {
      id: 1,
      deleted: false,
      h: 150,
      w: 150,
      title: "image",
      backgroundUrl: "https://images.unsplash.com/photo-1706211306706-8f36d91c8379?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      data: []
    }
    // Initialize the form
    this.postDetailsForm = this.fb.group({
      id: [this.postDetails.id, Validators.required],
      deleted: [this.postDetails.deleted, Validators.required],
      h: [this.postDetails.h, Validators.required],
      w: [this.postDetails.w, Validators.required],
      title: [this.postDetails.title, Validators.required],
      backgroundUrl: [this.postDetails.backgroundUrl, Validators.required],
      data: this.fb.array([])
    });
  }
  get dataArray() {
    return this.postDetailsForm.get('data') as FormArray;
  }
  addData(t: string) {
    let d: FormGroup = this.fb.group({})
    switch (t) {
      case 'rect':
        d = this.createRectFormGroup(this.rectData)
        break;
      case 'circle':
        d = this.createCircleFormGroup(this.circleData)
        break;
      case 'ellipse':
        d = this.createEllipseFormGroup(this.ellipseData)
        break;
      case 'line':
        d = this.createLineFormGroup(this.lineData)
        break;
      case 'text':
        d = this.createTextFormGroup(this.textData)
        break;
      case 'image':
        d = this.createImageFormGroup(this.imageData)
        break;
      default:
        console.error('Invalid type');
        break;
    }
    d && this.dataArray.push(d);
    this.postDetails = this.postDetailsForm.value;
  }
  removeData(index: number) {
    this.dataArray.removeAt(index);
    this.postDetails = this.postDetailsForm.value;
  }
  rectData = {
    title: "",
    rect: {
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      fill: "blue",
      opacity: 0.8,
      originX: 5,
      originY: 5,
      rotation: 45
    }
  };
  createRectFormGroup(r: { title: string, rect: RectProperties }): FormGroup {
    return this.fb.group({
      title: r.title,
      rect: this.fb.group({
        x: [r.rect.x, Validators.required],
        y: [r.rect.y, Validators.required],
        width: [r.rect.width, Validators.required],
        height: [r.rect.height, Validators.required],
        fill: [r.rect.fill, Validators.required],
        opacity: [r.rect.opacity, Validators.required],
        originX: [r.rect.originX, Validators.required],
        originY: [r.rect.originY, Validators.required],
        rotation: [r.rect.rotation, Validators.required]
      })
    });
  }
  circleData = {
    title: "Circle 1",
    circle: {
      cx: 50,
      cy: 50,
      r: 30,
      fill: "blue",
      opacity: 1,
      originX: 0,
      originY: 0
    }
  };

  createCircleFormGroup(c: { title: string, circle: CircleProperties }): FormGroup {
    return this.fb.group({
      title: c.title,
      circle: this.fb.group({
        cx: [c.circle.cx, Validators.required],
        cy: [c.circle.cy, Validators.required],
        r: [c.circle.r, Validators.required],
        fill: [c.circle.fill, Validators.required],
        opacity: [c.circle.opacity, Validators.required],
        originX: [c.circle.originX, Validators.required],
        originY: [c.circle.originY, Validators.required]
      })
    })
  }
  ellipseData = {
    title: "Ellipse 1",
    ellipse: {
      cx: 100,
      cy: 100,
      rx: 50,
      ry: 30,
      fill: "green",
      opacity: 0.8,
      originX: 0,
      originY: 0,
      rotation: 45
    }
  };
  createEllipseFormGroup(e: { title: string, ellipse: EllipseProperties }): FormGroup {
    return this.fb.group({
      title: e.title,
      ellipse: this.fb.group({
        cx: [e.ellipse.cx, Validators.required],
        cy: [e.ellipse.cy, Validators.required],
        rx: [e.ellipse.rx, Validators.required],
        ry: [e.ellipse.ry, Validators.required],
        fill: [e.ellipse.fill, Validators.required],
        opacity: [e.ellipse.opacity, Validators.required],
        originX: [e.ellipse.originX, Validators.required],
        originY: [e.ellipse.originY, Validators.required],
        rotation: [e.ellipse.rotation, Validators.required]
      })
    });
  }
  lineData = {
    title: "Line 1",
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
      rotation: 0
    }
  };

  createLineFormGroup(l: { title: string, line: LineProperties }): FormGroup {
    return this.fb.group({
      title: l.title,
      line: this.fb.group({
        x1: [l.line.x1, Validators.required],
        y1: [l.line.y1, Validators.required],
        x2: [l.line.x2, Validators.required],
        y2: [l.line.y2, Validators.required],
        stroke: [l.line.stroke, Validators.required],
        strokeWidth: [l.line.strokeWidth, Validators.required],
        opacity: [l.line.opacity, Validators.required],
        originX: [l.line.originX, Validators.required],
        originY: [l.line.originY, Validators.required],
        rotation: [l.line.rotation, Validators.required]
      })
    });
  }
  textData = {
    title: "Text 1",
    text: {
      x: 100,
      y: 100,
      fs: 150,
      fw: "normal",
      text: "Sample Text",
      color: "#FFFFFF",
      fontStyle: {
        italic: false,
        underline: false
      },
      textAlign: "left",
      rotate: 0,
      fontFamily: "Arial",
      textShadow: {
        color: "#FFFFFF",
        blur: 0,
        offsetX: 0,
        offsetY: 0
      },
      backgroundColor: "#ffffff",
      textEffects: {
        gradient: {
          startColor: "#ffffff",
          endColor: "#000000",
          direction: "horizontal"
        },
        outline: {
          color: "#FFFFFF",
          width: 2
        },
        glow: {
          color: "#ffffff",
          blur: 0
        }
      },
      textAlignment: "left",
      letterSpacing: 1,
      lineHeight: 1,
      textTransformation: "none"
    }
  };
  createTextFormGroup(t: { title: string, text: TextElement }): FormGroup {
    return this.fb.group({
      title: t.title,
      text: this.fb.group({
        x: [t.text.x, Validators.required],
        y: [t.text.y, Validators.required],
        fs: [t.text.fs, Validators.required],
        fw: [t.text.fw, Validators.required],
        text: [t.text.text, Validators.required],
        color: [t.text.color, Validators.required],
        fontStyle: this.fb.group({
          italic: [t.text.fontStyle.italic, Validators.required],
          underline: [t.text.fontStyle.underline, Validators.required]
        }),
        textAlign: [t.text.textAlign, Validators.required],
        rotate: [t.text.rotate, Validators.required],
        fontFamily: [t.text.fontFamily, Validators.required],
        textShadow: this.fb.group({
          color: [t.text.textShadow.color, Validators.required],
          blur: [t.text.textShadow.blur, Validators.required],
          offsetX: [t.text.textShadow.offsetX, Validators.required],
          offsetY: [t.text.textShadow.offsetY, Validators.required]
        }),
        backgroundColor: [t.text.backgroundColor, Validators.required],
        textEffects: this.fb.group({
          gradient: this.fb.group({
            startColor: [t.text.textEffects.gradient.startColor, Validators.required],
            endColor: [t.text.textEffects.gradient.endColor, Validators.required],
            direction: [t.text.textEffects.gradient.direction, Validators.required]
          }),
          outline: this.fb.group({
            color: [t.text.textEffects.outline.color, Validators.required],
            width: [t.text.textEffects.outline.width, Validators.required]
          }),
          glow: this.fb.group({
            color: [t.text.textEffects.glow.color, Validators.required],
            blur: [t.text.textEffects.glow.blur, Validators.required]
          })
        }),
        textAlignment: [t.text.textAlignment, Validators.required],
        letterSpacing: [t.text.letterSpacing, Validators.required],
        lineHeight: [t.text.lineHeight, Validators.required],
        textTransformation: [t.text.textTransformation, Validators.required]
      })
    });
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
    image: {
      r: 50,
      x: 100,
      y: 100,
      imageUrl: "https://example.com/image.jpg",
      borderColor: "#000000",
      borderWidth: 2,
      shape: "circle",
      origin: "center",
      placeholder: "Placeholder Text",
      svgProperties: {
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 2
      }
    }
  };
  createImageFormGroup(i: { title: string, image: ImageElement }): FormGroup {
    return this.fb.group({
      title: '',
      image: this.fb.group({
        r: [i.image.r, Validators.required],
        x: [i.image.x, Validators.required],
        y: [i.image.y, Validators.required],
        imageUrl: [i.image.imageUrl, Validators.required],
        borderColor: [i.image.borderColor, Validators.required],
        borderWidth: [i.image.borderWidth, Validators.required],
        shape: [i.image.shape, Validators.required],
        origin: [i.image.origin, Validators.required],
        placeholder: [i.image.placeholder, Validators.required],
        svgProperties: this.createSvgPropertiesFormGroup(i.image.svgProperties)
      })
    });
  }
}
