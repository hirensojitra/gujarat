import { ViewEncapsulation, Component } from '@angular/core';
import { ABSService } from 'projects/angular-bootstrap-sidebar/src/public-api';
import { User } from 'src/app/common/interfaces/commonInterfaces';
import { AuthenticationService } from 'src/app/common/services/authentication.service';
import { BreadcrumbService } from 'src/app/common/services/breadcrumb';
import { UserService } from 'src/app/common/services/user.service';
export interface MenuItem {
  label: string;
  icon?: string;
  link?: string;
  title?: string;
  subItems?: MenuItem[];
}
@Component({
  selector: 'main-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class HeaderComponent {
  menuStatus: any = false;
  // *****************************************************
  // ************ DON'T DELETE THIS COMMENT **************
  // *****************************************************
  // menu: MenuItem[] = [
  //   {
  //     label: 'Cloud Requisition',
  //     icon: 'fa-cloud',
  //     link: '/admin/cloud-requisition',
  //     subItems: [
  //       {
  //         label: 'Requisition Details',
  //         link: '/admin/cloud-requisition/cloud-requisition-data'
  //       },
  //       {
  //         label: 'Add Requisition Details',
  //         link: '/admin/cloud-requisition/cloud-requisition-form'
  //       }
  //     ]
  //   }, {
  //     label: 'Project Details',
  //     icon: 'fa-support',
  //     link: '/admin/project-details'
  //   }, {
  //     label: 'Support',
  //     icon: 'fa-support',
  //     link: '/admin/support',
  //     subItems: [{
  //       label: 'Request',
  //       link: '/admin/support/support-request',
  //     }]
  //   }, {
  //     label: 'User Management',
  //     icon: 'fa-user',
  //     link: '/admin/user-management',
  //     subItems: [{
  //       label: 'User Approval',
  //       link: '/admin/user-management/user-approval',
  //     }, {
  //       label: 'Application User',
  //       link: '/admin/user-management/application-user',
  //     }]
  //   }
  // ];
  menu: MenuItem[] = [
    {
      label: 'Master Data',
      icon: 'fa-database',
      link: '/view',
      subItems: [{
        label: 'Districts',
        link: '/view/district',
      }, {
        label: 'Talukas',
        link: '/view/taluka',
      }, {
        label: 'Villages',
        link: '/view/village',
      }]
    }, {
      label: 'Canvas Generator',
      icon: 'fa-image',
      link: '/canvas-generator'
    }, {
      label: 'User Profile',
      icon: 'fa-user',
      link: '/user-profile'
    }, {
      label: 'Images',
      icon: 'fa-image',
      link: '/img'
    }
  ];
  user!: User;
  breadcrumbs: { label: string, link: string }[] = [];
  userFullName: string = "User Name";
  constructor(
    private breadcrumbService: BreadcrumbService,
    public ABSService: ABSService,
    private authService: AuthenticationService,
    private US: UserService
  ) {
    this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
    });
    if (this.menuStatus == true) {
      ABSService.toggleMenu();
      this.menuStatus = ABSService.getMenuStatus()
    }
  }
  toggleMenu() {
    this.ABSService.toggleMenu();
    this.menuStatus = this.ABSService.getMenuStatus();
  }
  logout(): void {
    this.authService.logout().subscribe(
      (success) => {
        if (success) {

        } else {
        }
      },
      (error) => {
        console.error('Logout failed:', error);
      }
    );
  }
  validateImage(imageUrl: string): string {
    return imageUrl || `https://dummyimage.com/300x300/F4F4F4/000000&text=${this.imageText()}`;
  }
  imageText(): string {
    if (this.user && this.user.firstName && this.user.lastName) {
      const firstCharFirstName = this.user.firstName.charAt(0);
      const firstCharLastName = this.user.lastName.charAt(0);
      return `${firstCharFirstName}${firstCharLastName}`;
    } else {
      return 'USER';
    }
  }
  ngOnInit(): void {
    this.US.getUser().subscribe((value) => {
      if (value) {
        this.user = value;
        this.userFullName = this.user.firstName+' '+this.user.lastName;
      }
    })
  }
}
