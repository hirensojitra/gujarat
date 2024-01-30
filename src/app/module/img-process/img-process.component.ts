import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { District, User } from 'src/app/common/interfaces/commonInterfaces';
import { DistrictService } from 'src/app/common/services/district.service';
import { UserService } from 'src/app/common/services/user.service';
import { VillageService } from 'src/app/common/services/village.service';

@Component({
  selector: 'app-img-process',
  templateUrl: './img-process.component.html',
  styleUrls: ['./img-process.component.scss']
})
export class ImgProcessComponent implements OnInit, AfterViewInit {
  district!: any;
  village: any;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  userSubscription!: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private villageService: VillageService,
    private districtService: DistrictService,
    private el: ElementRef,
    private US: UserService
  ) {

  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.userSubscription = this.US.getUser().subscribe((user: User | null) => {
        if (user) {
          this.user = user;
          this.getVillage(user.village_id);
        }
      });
    }, 1500);
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      const districtId = params['district'];
      const villageId = params['village'];
      if (districtId) {
        // District parameter is present, fetch data
        this.districtService.getDistrictById(districtId).subscribe(
          (data) => {
            this.district = data;
            console.log('District Data:', this.district);
          },
          (error) => {

          }
        );
      }
      if (villageId) {

      } else {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { district: '15' },
          queryParamsHandling: 'merge'
        });
      }
    });
  }
  user: any;
  private drawOnCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    const mainImage = new Image();
    mainImage.src = 'https://images.unsplash.com/photo-1682685796063-d2604827f7b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    mainImage.onload = () => {
      canvas.width = mainImage.width;
      canvas.height = mainImage.height;
      const w = canvas.width;
      const h = canvas.height;
      ctx!.drawImage(mainImage, 0, 0);
      ctx!.font = '20px "Hind Vadodara", sans-serif';
      ctx!.fillStyle = 'red';
      if (this.district) {
        ctx!.fillText(`District: ${this.district.name}`, 10, 20);
      }
      if (this.village) {
        const rectX = w / 3;
        const rectY = h - 300;
        const rectWidth = w / 1.5;
        const rectHeight = 150;

        ctx!.fillStyle = 'rgba(0,0,0,0.7)';
        ctx!.fillRect(rectX, rectY, rectWidth, rectHeight);

        ctx!.fillStyle = '#FFF';
        let textX = rectX + 10; // Adjust the initial X position
        let textY = rectY + 40; // Adjust the initial Y position

        if (this.user.firstname && this.user.lastname) {
          ctx!.font = '40px "Hind Vadodara", sans-serif';
          ctx!.fillText(`${this.user.firstname} ${this.user.lastname}`, textX, textY);
          textY += 30; // Move to the next line
        }

        if (this.village.gu_name) {
          ctx!.font = '20px "Hind Vadodara", sans-serif'; // Use the desired font size
          ctx!.fillText(`${this.village.gu_name}`, textX, textY);
          textX += ctx!.measureText(`${this.village.gu_name}`).width + 15; // Move to the next position
        }

        if (this.village.taluka_name) {
          ctx!.font = '20px "Hind Vadodara", sans-serif'; // Use the desired font size
          ctx!.fillText(`${this.village.taluka_name}`, textX, textY);
          textX += ctx!.measureText(`${this.village.taluka_name}`).width + 20; // Move to the next position
        }

        if (this.village.district_name) {
          ctx!.font = '20px "Hind Vadodara", sans-serif'; // Use the desired font size
          ctx!.fillText(`${this.village.district_name}`, textX, textY);
        }

        // Calculate the Y position for vertical centering
        const centerY = rectY + ((rectHeight * 1.5) / 2);

        // Adjust Y position for arc and drawImage to be vertically centered
        const profileY = centerY - (rectHeight * 1.5) / 2; // 60 is the radius of the circle

        // Draw the arc
        ctx!.beginPath();
        ctx!.arc(w - rectHeight, profileY + (rectHeight * 1.5) / 4, (rectHeight * 1.5) / 2, 0, 2 * Math.PI);
        ctx!.fillStyle = '#FFF';
        ctx!.fill();
        // Set shadow properties
        ctx!.shadowColor = 'rgba(0, 0, 0, 1)';  // Shadow color (black with 50% opacity)
        ctx!.shadowBlur = 10;  // Shadow blur radius
        ctx!.shadowOffsetX = 15;  // Horizontal shadow offset
        ctx!.shadowOffsetY = 15;  // Vertical shadow offset

        ctx!.clip();
        const profileImage = new Image();
        profileImage.src = 'assets/images/jpeg/profile-1.jpeg';
        ctx!.drawImage(profileImage, w - rectHeight, profileY + (rectHeight * 1.5) / 4, rectHeight * 1.5, rectHeight * 1.5);

        // Reset shadow properties if needed for other drawing operations
        ctx!.shadowColor = 'rgba(0, 0, 0, 1)';  // Shadow color (black with 50% opacity)
        ctx!.shadowBlur = 10;  // Shadow blur radius
        ctx!.shadowOffsetX = 15;  // Horizontal shadow offset
        ctx!.shadowOffsetY = 15;
      }
    };
  }
  getVillage(id: any) {
    this.villageService.getVillageById(id).subscribe(
      (data) => {
        this.village = data.data;
        this.drawOnCanvas();
      },
      (error) => {

      }
    )
  }
}
