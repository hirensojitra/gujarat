import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { District, Taluka, Village } from 'src/app/common/interfaces/commonInterfaces';
import { DevelopmentService } from 'src/app/common/services/development.service';
import { DistrictService } from 'src/app/common/services/district.service';
import { TalukaService } from 'src/app/common/services/taluka.service';
import { VillageService } from 'src/app/common/services/village.service';
import { ToastService } from 'src/app/common/services/toast.service';
import { MemberService } from 'src/app/common/services/member.service';
declare const bootstrap: any;
@Component({
  selector: 'app-village',
  templateUrl: './village.component.html',
  styleUrls: ['./village.component.scss']
})
export class VillageComponent implements OnInit, AfterViewInit {

  villages: Village[] = [];
  talukas: Taluka[] = [];
  districts: District[] = [];
  selectedDistrict!: District | null;
  selectedTaluka!: Taluka | null;
  newVillage!: Village;
  filterVillage!: FormGroup;
  villageData!: Village | null;
  villageForm: FormGroup;
  villageUpdateForm: FormGroup;
  currentForm: FormGroup;
  needUpdate: boolean = false;
  needAdd: boolean = false;

  villageModal: any;
  villageModalElement: any;
  villageModalOptions: any;
  villageModalTitle!: string;

  villageDeletedModal: any;
  villageDeletedModalElement: any;
  villageDeletedModalOptions: any;
  villageDeletedModalTitle!: string;

  deletedVillageCount: any;
  deletedVillageList: any;

  constructor(
    private districtService: DistrictService,
    private talukaService: TalukaService,
    private villageService: VillageService,
    private fb: FormBuilder,
    private DS: DevelopmentService,
    private el: ElementRef,
    private toastService: ToastService,
    private memberService: MemberService
  ) {
    const newForm = this.fb.group({
      name: ['', [Validators.required]],
      gu_name: [''],
      district_id: ['', Validators.required],
      taluka_id: ['', Validators.required],
      is_deleted: [false] // Default value
    })
    this.villageForm = newForm;

    const updateForm = this.fb.group({
      'id': ['', [Validators.required]],
      name: ['', Validators.required],
      gu_name: [''],
      district_id: ['', Validators.required],
      taluka_id: ['', Validators.required],
      is_deleted: [false]
    })
    this.villageUpdateForm = updateForm
    this.currentForm = newForm;
    this.filterVillage = this.fb.group({
      district: ['', Validators.required],
      taluka: ['', Validators.required]
    })
  }
  ngAfterViewInit() {
    this.villageModalElement = this.el.nativeElement.querySelector('#villageModal');
    this.villageModalOptions = {
      backdrop: false,
      keyboard: false
    };
    this.villageModal = new bootstrap.Modal(this.villageModalElement, this.villageModalOptions);
    const showListener = () => {
      this.currentForm.get('district_id')?.setValue(this.selectedDistrict?.id)
      this.currentForm.get('taluka_id')?.setValue(this.selectedTaluka?.id)
    };

    const hiddenListener = () => {
      this.villageData = null;
      this.villageModalTitle = "";
      this.currentForm.reset();
      this.needUpdate = false;
      this.needAdd = false;
    };

    const hideListener = (data: any) => {
      console.log(data);
    };

    this.villageModalElement.addEventListener('show.bs.modal', showListener);
    this.villageModalElement.addEventListener('hidden.bs.modal', hiddenListener);
    this.villageModalElement.addEventListener('hide.bs.modal', hideListener);


    this.villageDeletedModalElement = this.el.nativeElement.querySelector('#villageDeletedModal');
    this.villageDeletedModalOptions = {
      backdrop: false,
      keyboard: false
    };
    this.villageDeletedModal = new bootstrap.Modal(this.villageDeletedModalElement, this.villageDeletedModalOptions);
    const villageDeletedShowListener = () => { };
    const villageDeletedHiddenListener = () => { };
    const villageDeletedHideListener = (data: any) => {
    };

    this.villageDeletedModalElement.addEventListener('show.bs.modal', villageDeletedShowListener);
    this.villageDeletedModalElement.addEventListener('hidden.bs.modal', villageDeletedHiddenListener);
    this.villageDeletedModalElement.addEventListener('hide.bs.modal', villageDeletedHideListener);
  }
  editVillage(d: Village) {
    this.currentForm = this.villageUpdateForm;
    this.currentForm.reset()
    this.villageData = d;
    this.villageModalTitle = "Edit " + d.name;
    this.currentForm.get('id')?.setValue(d.id);
    this.currentForm.get('name')?.setValue(d.name);
    this.currentForm.get('gu_name')?.setValue(d.gu_name);
    this.currentForm.get('is_deleted')?.setValue(d.is_deleted);
    this.villageModal.show();
    this.needUpdate = true;
  }
  addVillage() {
    this.currentForm = this.villageForm;
    this.currentForm.reset()
    alert(this.selectedTaluka?.id)
    this.currentForm.get('taluka_id')?.setValue(this.selectedTaluka?.id);
    this.currentForm.get('is_deleted')?.setValue(false);
    this.needAdd = true;
    this.villageModalTitle = "Add Village";
    this.villageModal.show();
  }
  saveVillage() {
    this.DS.markFormGroupTouched(this.currentForm)
    if (this.currentForm.valid) {
      if (this.needUpdate) {
        this.updateVillage(this.currentForm.value)
      }
      if (this.needAdd) {
        this.newVillage = this.currentForm.value
        this.addNewVillage()
      }
      this.villageModal.hide();
    } else {
      const msg = this.needUpdate ? "Please enter valid data to update 'Village'" : "Please enter valid data for 'New Village'";
      this.toastService.show(msg, { class: 'bg-danger' });
    }
  }
  ngOnInit(): void {
    this.loadDistrict();
    this.filterVillage.get('district')?.valueChanges.subscribe((data) => {
      if (data) {
        this.districtService.getDistrictById(data).subscribe((value) => {
          if (value) {
            this.selectedDistrict = value;
          }
        });
        this.loadTaluka();
      }
    })
    this.filterVillage.get('taluka')?.valueChanges.subscribe((data) => {
      console.log(data)
      if (data) {
        this.talukaService.getTalukaById(data).subscribe((value) => {
          if (value) {
            this.selectedTaluka = value.data[0];
            console.log(this.selectedTaluka)
          }
        });
        this.loadVillage();
      }
    })
  }
  loadDistrict(): void {
    this.districtService.getDistrict().subscribe((data) => {
      this.districts = data;
      if (data.length) {
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        this.selectedDistrict = data[0];
        this.filterVillage.get('district')?.setValue(this.selectedDistrict?.id)
      }
    });
  }
  loadTaluka(): void {
    const value = this.filterVillage.get('district')?.value
    this.talukaService.getTalukaByDistrict(value).subscribe((response) => {
      this.talukas = response;
      response.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      this.selectedTaluka = response[0];
      this.filterVillage.get('taluka')?.setValue(this.selectedTaluka?.id)
    }, (error) => {
      this.filterVillage.get('taluka')?.setValue('')
      this.talukas = [];
      this.villages = [];
    });
  }
  loadVillage(): void {
    const talukaId = this.filterVillage.get('taluka')?.value;
    const districtId = this.filterVillage.get('district')?.value;
    this.villages = [];
    if (districtId && talukaId) {
      this.villageService.getVillageByTaluka(talukaId).subscribe(
        (response) => {
          response.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          this.villages = response;
        }
      );
    }
    this.loadDeletedVillageLength();
  }
  addNewVillage(): void {
    debugger;
    this.villageService.addVillage(this.newVillage).subscribe(
      (response) => {
        console.log('Village name updated successfully:', response);
        this.loadVillage();
      },
      (error) => {
        console.error(error);
        // Handle error, e.g., show an error message to the user
      }
    );
  }
  deleteVillage(id: string): void {
    this.villageService.deleteVillage(id).subscribe((response) => {
      this.loadVillage();
      this.loadDeletedVillageLength();
    }, (error) => {

    });
  }
  updateVillage(value: Village): void {
    const villageId = value.id;
    this.villageService.updateVillageName(villageId, value).subscribe(
      response => {
        console.log('Village name updated successfully:', response);
        this.loadVillage();
      },
      error => {
        console.error('Error updating village name:', error);
        // Handle error, e.g., show an error message to the user
      }
    );
  }
  loadDeletedVillageLength(show?: boolean): void {
    const districtId = this.selectedDistrict?.id;
    const talukaId = this.selectedTaluka?.id;
    if (districtId && talukaId) {
      this.villageService.getDeletedVillageLength(districtId, talukaId).subscribe(
        (data) => {
          this.deletedVillageCount = data.deletedVillageCount;
          (!data.deletedVillagesLength) ? this.villageDeletedModal.hide() : false;
          if (show) {
            this.openDeletedModal();
          }
        },
        (error) => {
          console.error('Error loading deleted village count:', error);
        }
      );
    }
  }
  loadDeletedVillage(): void {
    const talukaId = this.selectedTaluka?.id;
    this.villageService.getDeletedVillage(talukaId).subscribe(
      (data) => {
        this.deletedVillageList = data;
      },
      (error) => {
        this.deletedVillageList = null;
      }
    );
  }
  toggleVillageActive(id: number): void {
    this.villageService.toggleVillageActive(id).subscribe(
      (response) => {
        this.loadDeletedVillageLength(true);
        this.loadDeletedVillage();
        this.loadVillage();
        console.log(response)
      },
      (error) => {
        console.error('Error toggling village active state:', error);
      }
    );
  }
  openDeletedModal() {
    this.loadDeletedVillage();
    this.villageDeletedModal.show();
  }
}
