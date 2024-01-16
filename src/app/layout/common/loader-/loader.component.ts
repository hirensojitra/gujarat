import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LoaderService } from 'src/app/common/services/loader';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  title: string;
  constructor(public loaderService: LoaderService) {
    this.title = this.loaderService.getTitle();
  }
}
