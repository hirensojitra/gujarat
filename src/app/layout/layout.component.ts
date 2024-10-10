import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
