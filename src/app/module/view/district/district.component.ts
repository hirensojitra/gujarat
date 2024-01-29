import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { District } from 'src/app/common/interfaces/commonInterfaces';
import { DevelopmentService } from 'src/app/common/services/development.service';
import { DistrictService } from 'src/app/common/services/district.service';
import { ToastService } from 'src/app/common/services/toast.service';
declare const bootstrap: any;
@Component({
  selector: 'app-district',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.scss']
})
export class DistrictComponent implements OnInit, AfterViewInit {
  districts: District[] = [];
  newDistrict: any = { name: '', is_deleted: false };

  districtData!: District | null;
  districtForm: FormGroup;
  districtUpdateForm: FormGroup;
  currentForm: FormGroup;
  needUpdate: boolean = false;
  needAdd: boolean = false;

  deletedDistrictCount!: number;
  deletedDistrictList!: any[];
  districtToToggleId!: number;

  districtModal: any;
  districtModalElement: any;
  districtModalOptions: any;
  districtModalTitle!: string;

  districtDeletedModal: any;
  districtDeletedModalElement: any;
  districtDeletedModalOptions: any;
  districtDeletedModalTitle: string = "Deleted District";

  constructor(
    private districtService: DistrictService,
    private fb: FormBuilder,
    private DS: DevelopmentService,
    private el: ElementRef,
    private toastService: ToastService
  ) {
    const newForm = this.fb.group({
      'is_deleted': [false, [Validators.required]],
      'name': ['', [Validators.required]],
      'gu_name': ['']
    })
    this.districtForm = newForm;

    const updateForm = this.fb.group({
      'id': ['', [Validators.required]],
      'is_deleted': [false, [Validators.required]],
      'name': ['', [Validators.required]],
      'gu_name': ['']
    })
    this.districtUpdateForm = updateForm
    this.currentForm = newForm;
  }
  ngAfterViewInit() {
    this.districtModalElement = this.el.nativeElement.querySelector('#districtModal');
    this.districtModalOptions = {
      backdrop: false,
      keyboard: false
    };
    this.districtModal = new bootstrap.Modal(this.districtModalElement, this.districtModalOptions);
    const districtShowListener = () => {
      // Do something when the modal is shown
      // this.calculateBillAmount();
    };

    const districtHiddenListener = () => {
      this.districtData = null;
      this.districtModalTitle = "";
      this.currentForm.reset();
      this.needUpdate = false;
      this.needAdd = false;
    };

    const districtHideListener = (data: any) => {
      console.log(data);
    };

    this.districtModalElement.addEventListener('show.bs.modal', districtShowListener);
    this.districtModalElement.addEventListener('hidden.bs.modal', districtHiddenListener);
    this.districtModalElement.addEventListener('hide.bs.modal', districtHideListener);

    this.districtDeletedModalElement = this.el.nativeElement.querySelector('#districtDeletedModal');
    this.districtDeletedModalOptions = {
      backdrop: false,
      keyboard: false
    };
    this.districtDeletedModal = new bootstrap.Modal(this.districtDeletedModalElement, this.districtModalOptions);
    const districtDeletedShowListener = () => { };
    const districtDeletedHiddenListener = () => { };
    const districtDeletedHideListener = () => { };

    this.districtDeletedModalElement.addEventListener('show.bs.modal', districtDeletedShowListener);
    this.districtDeletedModalElement.addEventListener('hidden.bs.modal', districtDeletedHiddenListener);
    this.districtDeletedModalElement.addEventListener('hide.bs.modal', districtDeletedHideListener);
  }
  editDistrict(d: District) {
    this.currentForm = this.districtUpdateForm;
    this.currentForm.reset()
    this.districtData = d;
    this.districtModalTitle = "Edit " + d.name;
    this.currentForm.get('is_deleted')?.setValue(d.is_deleted ? true : false);
    this.currentForm.get('id')?.setValue(d.id);
    this.currentForm.get('name')?.setValue(d.name);
    this.currentForm.get('gu_name')?.setValue(d.gu_name || '');
    this.districtModal.show();
    this.needUpdate = true;
  }
  addDistrict() {
    this.currentForm = this.districtForm;
    this.currentForm.reset();
    this.currentForm.get('is_deleted')?.setValue(false);
    this.needAdd = true;
    this.districtModalTitle = "Add District";
    this.districtModal.show();
  }
  saveDistrict() {
    this.DS.markFormGroupTouched(this.currentForm)
    if (this.currentForm.valid) {
      if (this.needUpdate) {
        this.updateDistrict(this.currentForm.value)
      }
      if (this.needAdd) {
        this.newDistrict = this.currentForm.value
        this.addNewDistrict()
      }
      this.districtModal.hide();
    } else {
      const msg = this.needUpdate ? "Please enter valid data to update 'District'" : "Please enter valid data for 'New District'";
      this.toastService.show(msg, { class: 'bg-danger' });
    }
  }
  ngOnInit(): void {
    this.loadDistrict();
    this.loadDeletedDistrictLength();
  }
  loadDistrict(): void {
    this.districtService.getDistrict().subscribe((data) => {
      this.districts = data.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) {
          return -1; // Name A comes before name B
        }
        if (nameA > nameB) {
          return 1; // Name A comes after name B
        }
        return 0; // Names are equal
      });
    });
  }
  addNewDistrict(): void {
    console.log(this.newDistrict)
    this.districtService.addDistrict(this.newDistrict).subscribe((data) => {
      console.log('District added successfully:', data);
      this.loadDistrict();
    });
  }
  deleteDistrict(id: string): void {
    this.districtService.deleteDistrict(id).subscribe((data) => {
      console.log('District deleted successfully:', data);
      this.loadDistrict();
      this.loadDeletedDistrictLength();
    });
  }
  updateDistrict(value: District): void {
    const districtId = value.id;
    this.districtService.updateDistrict(districtId, value).subscribe(
      response => {
        if (response.success) {
          this.loadDistrict()
        } else {
          console.error('Failed to update district:', response.message);
        }
      },
      error => {
        console.error('Error:', error);
      }
    );
  }
  loadDeletedDistrictLength(): void {
    this.districtService.getDeletedDistrictLength().subscribe(
      (data) => {
        this.deletedDistrictCount = data.deletedDistrictCount;
        (!data.deletedDistrictCount) ? this.districtDeletedModal.hide() : false;
      },
      (error) => {
        console.error('Error loading deleted districts count:', error);
      }
    );
  }

  loadDeletedDistrict(): void {
    this.districtService.getDeletedDistrict().subscribe(
      (data) => {
        this.deletedDistrictList = data;
      },
      (error) => {
        console.error('Error loading deleted districts:', error);
      }
    );
  }

  toggleDistrictActive(id: number): void {
    this.districtService.toggleDistrictActive(id).subscribe(
      (response) => {
        this.loadDeletedDistrictLength();
        this.loadDeletedDistrict();
        this.loadDistrict();
      },
      (error) => {
        console.error('Error toggling district active state:', error);
      }
    );
  }
  openDeletedModal() {
    this.loadDeletedDistrict();
    this.districtDeletedModal.show();
  }
}
