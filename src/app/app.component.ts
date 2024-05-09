import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

import { LoaderService } from './common/services/loader';
import { Title } from '@angular/platform-browser';
import { BreadcrumbService } from './common/services/breadcrumb';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('true', style({ opacity: 1, height: '100%' })),
      state('false', style({ opacity: 0, height:0 })),
      transition('false => true', animate('0ms ease-in')),
      transition('true => false', animate('100ms ease-in-out'))
    ]),
  ]
})
export class AppComponent implements OnInit{
  title = 'Village Directory';
  breadcrumbs: { label: string, link: string }[] = [];
  pressedKeysArray!: string[];
  constructor(private breadcrumbService: BreadcrumbService, private titleService: Title, public loaderService: LoaderService,
    private router: Router) {
    this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
      this.updateTitle();
    });
  }
  private updateTitle() {
    if (this.breadcrumbs.length > 0) {
      this.title = this.breadcrumbs.map(breadcrumb => breadcrumb.label).join(' - ')+` | Village Server` ;
    } else {
      this.title = 'ભગવાન પરશુરામજી - સહિયારી શોભાયાત્રા'; // Default title when there are no breadcrumbs
    }
  }
  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loaderService.show(0);
      } else if (event instanceof NavigationEnd || event instanceof NavigationError) {
        this.loaderService.hide();
      }
    })
  }
  
  public pressedKeys: Set<string> = new Set<string>();
  @HostListener('document:keydown', ['$event'])
  handleKeyDownEvent(event: KeyboardEvent) {
    this.pressedKeys.add(event.key);
    this.handleMultipleKeys();
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUpEvent(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

  handleMultipleKeys() {
    this.pressedKeys.size == 3;
    this.pressedKeysArray = Array.from(this.pressedKeys);
  }
}
