import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LoaderService } from 'src/app/common/services/loader';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('true', style({ opacity: 1, height: '100%' })),
      state('false', style({ opacity: 0, height:0 })),
      transition('false => true', animate('0ms ease-in')),
      transition('true => false', animate('100ms ease-in-out'))
    ]),
  ]
})
export class LoaderComponent {
  title: string;
  constructor(public loaderService: LoaderService, private titleService: Title) {
    this.title = this.loaderService.getTitle();
    this.setTitle(this.title);
  }
  private setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
