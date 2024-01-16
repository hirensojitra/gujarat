import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { District, Taluka, Village } from 'src/app/common/interfaces/commonInterfaces';
import { DevelopmentService } from 'src/app/common/services/development.service';
import { DistrictService } from 'src/app/common/services/district.service';
declare const bootstrap: any;
@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss']
})
export class StateComponent implements OnInit, AfterViewInit {

  constructor(
    
  ) {
    
  }
  ngAfterViewInit() {}
  
  
  


  ngOnInit(): void {
  }
}
