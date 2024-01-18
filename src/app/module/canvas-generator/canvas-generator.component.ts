// canvas-generator.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/common/interfaces/commonInterfaces';
import { UserService } from 'src/app/common/services/user.service';
import { VillageService } from 'src/app/common/services/village.service';

@Component({
  selector: 'app-canvas-generator',
  templateUrl: './canvas-generator.component.html',
  styleUrls: ['./canvas-generator.component.scss']
})
export class CanvasGeneratorComponent implements OnInit {
  userSubscription!: Subscription;
  user: any;
  village: any;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDragging = false;

  private dragStartX = 0;
  private dragStartY = 0;

  private avatarX = 150;
  private avatarY = 150;
  private avatarDrag = false;
  private avatarImage = new Image();

  private detailsX = 120;
  private detailsY = 80;
  private detailsDrag = false;

  private background = new Image();
  scaleFactor: number = 1; // Initial scale factor
  // Sample data, you can replace it with dynamic data
  private userData = {
    name: 'John Doe',
    address: '123 Main St',
    designation: 'Software Developer',
    // ... other details
  };
  constructor(
    private US: UserService,
    private VS: VillageService
  ) { }
  ngOnInit(): void {
    this.userSubscription = this.US.getUser().subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        this.getVillage(user.village_id);
      }
    });
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.drawCanvas();
    this.loadAvatarImage();
    this.setupCanvasEventListeners();
  }

  drawCanvas(): void {
    this.background.crossOrigin = 'anonymous';
    this.background.src = 'https://images.unsplash.com/photo-1682685796063-d2604827f7b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    this.background.onload = () => {
      if (this.ctx !== null) {
        const aspectRatio = this.background.width / this.background.height;
        const canvasAspectRatio = this.canvas.nativeElement.width / this.canvas.nativeElement.height;
        let drawWidth = 0;
        let drawHeight = 0;
        let drawX = 0;
        let drawY = 0;
        if (aspectRatio < canvasAspectRatio) {
          // Image is wider than the canvas
          drawWidth = this.canvas.nativeElement.width;
          drawHeight = drawWidth / aspectRatio;
          drawY = (this.canvas.nativeElement.height - drawHeight) / 2;
        } else {
          // Image is taller than or equal to the canvas
          drawHeight = this.canvas.nativeElement.height;
          drawWidth = drawHeight * aspectRatio;
          drawX = (this.canvas.nativeElement.width - drawWidth) / 2;
        }
        this.ctx.drawImage(this.background, drawX, drawY, drawWidth, drawHeight);
      }
    };
  }
  loadAvatarImage(): void {
    this.avatarImage.crossOrigin = 'anonymous';
    this.avatarImage.src = this.user.image || 'assets/images/jpeg/profile-1.jpeg';
    this.avatarImage.onload = () => {
      this.drawAvatar(); // Initial drawing
    };
  }
  drawBackgroundImage(): void {
    if (this.ctx !== null) {
      const aspectRatio = this.background.width / this.background.height;
      const canvasAspectRatio = this.canvas.nativeElement.width / this.canvas.nativeElement.height;

      let drawWidth = 0;
      let drawHeight = 0;
      let drawX = 0;
      let drawY = 0;

      if (aspectRatio < canvasAspectRatio) {
        // Image is wider than the canvas
        drawWidth = this.canvas.nativeElement.width;
        drawHeight = drawWidth / aspectRatio;
        drawY = (this.canvas.nativeElement.height - drawHeight) / 2;
      } else {
        // Image is taller than or equal to the canvas
        drawHeight = this.canvas.nativeElement.height;
        drawWidth = drawHeight * aspectRatio;
        drawX = (this.canvas.nativeElement.width - drawWidth) / 2;
      }
      this.ctx.drawImage(this.background, drawX, drawY, drawWidth, drawHeight);
    }

  }
  drawBasicDetails(): void {
    if (this.ctx !== null) {
      this.ctx.font = '16px "Hind Vadodara", sans-serif';
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText((this.user.firstName && this.user.lastName) ? this.user.firstName + ' ' + this.user.lastName : this.userData.name, this.detailsX, this.detailsY);
      this.ctx.fillText(this.userData.address, this.detailsX, this.detailsY + 20);
      this.ctx.fillText(this.userData.designation, this.detailsX, this.detailsY + 40);
    }
  }
  drawAvatar(): void {
    if (this.ctx !== null) {
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.drawBackgroundImage();
      this.drawBasicDetails();
      this.drawCircleImage(this.avatarImage, this.avatarX, this.avatarY, 50 * this.scaleFactor); // Adjust radius as needed
    }
  }
  drawCircleImage(image: HTMLImageElement, x: number, y: number, radius: number): void {
    if (this.ctx !== null) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
      this.ctx.strokeStyle = '#FFFFFF'; // Border color
      this.ctx.lineWidth = 5; // Border width
      this.ctx.shadowColor = '#000000'; // Shadow color
      this.ctx.shadowBlur = 10; // Shadow blur
      this.ctx.stroke();
      this.ctx.clip();
      this.ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2);
      this.ctx.restore();
    }
  }

  downloadImage(): void {
    const canvasDataUrl = this.canvas.nativeElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = canvasDataUrl;
    link.download = 'generated_image.png';
    link.click();
  }
  private setupCanvasEventListeners(): void {
    this.canvas.nativeElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.nativeElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.nativeElement.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.nativeElement.addEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  handleMouseDown(event: MouseEvent): void {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (this.isPointInsideCircle(mouseX, mouseY, this.avatarX, this.avatarY, 50 * this.scaleFactor)) {
      this.avatarDrag = true;
    } else if (this.isPointInsideText(mouseX, mouseY, this.detailsX, this.detailsY, 16 * 3, 20 * 3)) {
      this.detailsDrag = true;
    } else {
      this.isDragging = true;
    }

    this.dragStartX = mouseX;
    this.dragStartY = mouseY;
  }

  handleMouseUp(): void {
    this.isDragging = false;
    this.avatarDrag = false;
    this.detailsDrag = false;
  }

  handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (this.isDragging) {
      const deltaX = mouseX - this.dragStartX;
      const deltaY = mouseY - this.dragStartY;

      this.avatarX += deltaX;
      this.avatarY += deltaY;
      this.detailsX += deltaX;
      this.detailsY += deltaY;

      this.dragStartX = mouseX;
      this.dragStartY = mouseY;

      this.drawAvatar();
    } else if (this.avatarDrag) {
      this.avatarX = mouseX;
      this.avatarY = mouseY;
      this.drawAvatar();
    } else if (this.detailsDrag) {
      this.detailsX = mouseX;
      this.detailsY = mouseY;
      this.drawAvatar();
    }
  }

  handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.avatarDrag = false;
    this.detailsDrag = false;
  }

  isPointInsideCircle(x: number, y: number, circleX: number, circleY: number, radius: number): boolean {
    const distance = Math.sqrt(Math.pow(x - circleX, 2) + Math.pow(y - circleY, 2));
    return distance <= radius;
  }

  isPointInsideText(x: number, y: number, textX: number, textY: number, textWidth: number, textHeight: number): boolean {
    return x >= textX && x <= textX + textWidth && y >= textY && y <= textY + textHeight;
  }
  getVillage(id: any) {
    this.VS.getVillageById(id).subscribe(
      (data) => {
        this.village = data.data;
      },
      (error) => {

      }
    )
  }
}
