import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { BreadcrumbService } from 'src/app/common/services/breadcrumb';
export interface MenuItem {
  label: string;
  icon?: string;
  link?: string;
  title?: string;
  subItems?: MenuItem[];
}
@Component({
  selector: 'dense-layout',
  templateUrl: './dense-layout.component.html',
  styleUrls: ['./dense-layout.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class DenseLayoutComponent implements OnDestroy {
  private breadcrumbSubscription: Subscription;
  breadcrumbs: { label: string, link: string }[] = [];
  menu: MenuItem[] = [
    {
      label: 'Cloud Requisition',
      icon: 'fa-cloud',
      link: '/admin/cloud-requisition',
      subItems: [
        {
          label: 'Cloud Requisition Form',
          link: '/admin/cloud-requisition/cloud-requisition-form'
        },
        { label: 'CM Dashboard', link: '/admin/dashboard/cm-dashboard' }
      ]
    }, {
      label: 'User Management',
      icon: 'fa-user',
      link: '/admin/user-management',
      subItems: [{
        label: 'User Approval',
        link: '/admin/user-approval',
      }, {
        label: 'Application User',
        link: '/admin/application-user',
      }]
    }
  ];
  menuActive: any = true;
  onMenuActiveChange(newMenuStatus: boolean) {
    // Update the menuStatus in the parent component with the new value
    this.menuActive = newMenuStatus;
    // You can perform other actions in response to this change if needed.
  }
  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbSubscription = this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
    });
  }
  ngOnDestroy() {
    this.breadcrumbSubscription.unsubscribe();
  }
}
