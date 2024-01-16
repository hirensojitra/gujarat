import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router'; // Import ActivatedRouteSnapshot
import { BreadcrumbService } from '../common/services/breadcrumb';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  layout: string | undefined;
  breadcrumbs: { label: string, link: string }[] = [];

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.data.subscribe((data) => {
      this.layout = data['layout'] || 'empty';
    });
  }

  ngOnInit() {

  }
}
