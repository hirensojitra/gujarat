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
  textProperties = [{
    text: 'Properties',
    child: {
      "x": "value",
      "y": "value",
      "fs": "value",
      "fw": "value",
      "text": "value",
      "color": "value",
      "textAlign": "value",
      "rotate": "value",
      "fontFamily": "value",
      "textShadow": {
        text: 'Text Shadow',
        child: {
          "color": "value",
          "blur": "value",
          "offsetX": "value",
          "offsetY": "value"
        }
      },
      "backgroundColor": "value",
      "textAlignment": "value",
      "letterSpacing": "value",
      "lineHeight": "value",
      "textTransformation": "value"
    }
  },
  {
    text: "Font Style",
    child: {
      "italic": "value",
      "underline": "value"
    }
  }]
  constructor() { }
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }
  getPropertyChildArray(property: any): any[] {
    return Object.keys(property).map(key => ({ key, value: property[key] }));
  }
  
}
