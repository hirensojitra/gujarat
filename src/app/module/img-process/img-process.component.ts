import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { District } from 'src/app/common/interfaces/commonInterfaces';
import { DistrictService } from 'src/app/common/services/district.service';
import { VillageService } from 'src/app/common/services/village.service';

@Component({
  selector: 'app-img-process',
  templateUrl: './img-process.component.html',
  styleUrls: ['./img-process.component.scss']
})
export class ImgProcessComponent implements OnInit {
  district!: any;
  village: any;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private villageService: VillageService,
    private districtService: DistrictService,
    private el:ElementRef
  ) { }

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
        this.villageService.getVillageById(villageId).subscribe(
          (data) => {
            console.log(data)
            this.village = data;
            if (this.village) {
              this.drawOnCanvas();
            }
          },
          (error) => {

          }
        );
      } else {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { district: '15' },
          queryParamsHandling: 'merge'
        });
      }
    });
  }
  user:any;
  private drawOnCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const user = localStorage.getItem('user');
    if (user){
      this.user = JSON.parse(user);
      this.user.firstName = "Hiren";
      this.user.lastName = "Sojitra";
    }
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    const mainImage = new Image();
    mainImage.src = 'https://images.unsplash.com/photo-1682685796063-d2604827f7b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    mainImage.onload = () => {
      canvas.width = mainImage.width;
      canvas.height = mainImage.height;
      ctx!.drawImage(mainImage, 0, 0);
      ctx!.font = '20px Hind Vadodara';
      ctx!.fillStyle = 'red';
      if (this.district) {
        ctx!.fillText(`District: ${this.district.name}`, 10, 20);
      }
      if (this.village) {
        ctx!.fillStyle = 'rgba(0,0,0,0.9)';
        ctx!.fillRect(0, canvas.height-180, canvas.width, 150);
        ctx!.fillStyle = '#FFF';
        (this.village.village_name) && ctx!.fillText(`${this.user.firstName+' '+this.user.lastName}`, 10, 40);
        ctx!.font = '40px Hind Vadodara';
        (this.village.taluka_name) && ctx!.fillText(`${this.village.taluka_name}`, 10, 100);
        ctx!.font = '20px Hind Vadodara';
        (this.village.district_name) && ctx!.fillText(`${this.village.district_name}`, 10, 140);
      }

      // Load the profile-1.jpeg image
      const profileImage = new Image();
      profileImage.src = 'assets/images/jpeg/profile-1.jpeg';
      profileImage.onload = () => {
        ctx!.beginPath();
        ctx!.arc(70, 210, 60, 0, 2 * Math.PI);

        // Set shadow properties
        ctx!.shadowColor = 'rgba(0, 0, 0, 1)';  // Shadow color (black with 50% opacity)
        ctx!.shadowBlur = 10;  // Shadow blur radius
        ctx!.shadowOffsetX = 15;  // Horizontal shadow offset
        ctx!.shadowOffsetY = 15;  // Vertical shadow offset

        ctx!.clip();
        ctx!.drawImage(profileImage, 10, 150, 120, 120);

        // Reset shadow properties if needed for other drawing operations
        ctx!.shadowColor = 'rgba(0, 0, 0, 1)';  // Shadow color (black with 50% opacity)
        ctx!.shadowBlur = 10;  // Shadow blur radius
        ctx!.shadowOffsetX = 15;  // Horizontal shadow offset
        ctx!.shadowOffsetY = 15; 
      };
    };
  }

}
