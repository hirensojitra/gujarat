import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { District, Taluka, Village } from 'src/app/common/interfaces/commonInterfaces';
import { DistrictService } from 'src/app/common/services/district.service';
import { TalukaService } from 'src/app/common/services/taluka.service';
import { VillageService } from 'src/app/common/services/village.service';

@Component({
  selector: 'app-locality-selector',
  templateUrl: './locality-selector.component.html',
  styleUrls: ['./locality-selector.component.scss']
})
export class LocalitySelectorComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() localityChange = new EventEmitter<any>();

  districts!: District[];
  talukas!: Taluka[];
  villages!: Village[];

  constructor(
    private fb: FormBuilder,
    private districtService: DistrictService,
    private talukaService: TalukaService,
    private villageService: VillageService,
  ) { }

  ngOnInit(): void {
    if (this.parentForm) {
      this.parentForm.addControl('locality', this.fb.group({
        district: ['', Validators.required],
        taluka: ['', Validators.required],
        village: ['', Validators.required],
      }));

      this.loadDistricts();

      this.parentForm.get('locality.district')?.valueChanges.subscribe(() => {
        this.loadTalukas();
        this.localityChange.emit(this.parentForm.get('locality')?.value);
      });

      this.parentForm.get('locality.taluka')?.valueChanges.subscribe(() => {
        this.loadVillages();
        this.localityChange.emit(this.parentForm.get('locality')?.value);
      });
    }
  }

  loadDistricts(): void {
    this.districtService.getDistrict().subscribe((data) => {
      this.districts = data;
      // Additional logic if needed
    });
  }

  loadTalukas(): void {
    const districtId = this.parentForm.get('locality.district')?.value;
    this.talukaService.getTalukaByDistrict(districtId).subscribe((data) => {
      this.talukas = data;
      // Additional logic if needed
    });
  }

  loadVillages(): void {
    const talukaId = this.parentForm.get('locality.taluka')?.value;
    const districtId = this.parentForm.get('locality.district')?.value;
    this.villageService.getVillageByTaluka(districtId,talukaId).subscribe((data) => {
      this.villages = data;
      // Additional logic if needed
    });
  }
}
