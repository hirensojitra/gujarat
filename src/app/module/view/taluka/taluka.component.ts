import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { District, Taluka } from 'src/app/common/interfaces/commonInterfaces';
import { DevelopmentService } from 'src/app/common/services/development.service';
import { DistrictService } from 'src/app/common/services/district.service';
import { TalukaService } from 'src/app/common/services/taluka.service';
import { ToastService } from 'src/app/common/services/toast.service';
declare const bootstrap: any;
@Component({
  selector: 'app-taluka',
  templateUrl: './taluka.component.html',
  styleUrls: ['./taluka.component.scss']
})
export class TalukaComponent implements OnInit, AfterViewInit {

  talukas: Taluka[] = [];
  districts: District[] = [];
  selectedDistrict!: District | null | any;
  newTaluka: any = { id: '', name: '' };
  filterTaluka!: FormGroup;
  talukaData!: Taluka | null;
  talukaForm: FormGroup;
  talukaUpdateForm: FormGroup;
  currentForm: FormGroup;
  needUpdate: boolean = false;
  needAdd: boolean = false;

  deletedTalukaCount!: number;
  deletedTalukaList!: any[];
  talukaToToggleId!: number;

  talukaModal: any;
  talukaModalElement: any;
  talukaModalOptions: any;
  talukaModalTitle!: string;

  talukaDeletedModal: any;
  talukaDeletedModalElement: any;
  talukaDeletedModalOptions: any;
  talukaDeletedModalTitle: string = "Deleted Taluka";

  constructor(
    private districtService: DistrictService,
    private talukaService: TalukaService,
    private fb: FormBuilder,
    private DS: DevelopmentService,
    private el: ElementRef,
    private toastService: ToastService
  ) {
    const newForm = this.fb.group({
      'name': ['', [Validators.required]],
      'gu_name': [''],
      district_id: ['', Validators.required],
      is_deleted: [false] // Default value
    })
    this.talukaForm = newForm;
    const updateForm = this.fb.group({
      'id': ['', [Validators.required]],
      name: ['', Validators.required],
      gu_name: [''],
      district_id: ['', Validators.required],
      is_deleted: [false] // Default value
    })
    this.talukaUpdateForm = updateForm
    this.currentForm = newForm;
    this.filterTaluka = this.fb.group({
      district: ['', Validators.required]
    });
  }
  ngAfterViewInit() {
    this.talukaModalElement = this.el.nativeElement.querySelector('#talukaModal');
    this.talukaModalOptions = {
      backdrop: true,
      keyboard: false
    };
    this.talukaModal = new bootstrap.Modal(this.talukaModalElement, this.talukaModalOptions);
    const talukaShowListener = () => {
      this.currentForm.get('district_id')?.setValue(this.selectedDistrict?.id)
    };

    const talukaHiddenListener = () => {
      this.talukaData = null;
      this.talukaModalTitle = "";
      this.currentForm.reset();
      this.talukaUpdateForm.reset();
      this.talukaForm.reset();
      this.needUpdate = false;
      this.needAdd = false;
    };

    const talukaHideListener = (data: any) => {
      console.log(data);
    };

    this.talukaModalElement.addEventListener('show.bs.modal', talukaShowListener);
    this.talukaModalElement.addEventListener('hidden.bs.modal', talukaHiddenListener);
    this.talukaModalElement.addEventListener('hide.bs.modal', talukaHideListener);


    this.talukaDeletedModalElement = this.el.nativeElement.querySelector('#talukaDeletedModal');
    this.talukaDeletedModalOptions = {
      backdrop: true,
      keyboard: false
    };
    this.talukaDeletedModal = new bootstrap.Modal(this.talukaDeletedModalElement, this.talukaDeletedModalOptions);
    const talukaDeletedShowListener = () => {

    };

    const talukaDeletedHiddenListener = () => { };
    const talukaDeletedHideListener = () => { };

    this.talukaDeletedModalElement.addEventListener('show.bs.modal', talukaDeletedShowListener);
    this.talukaDeletedModalElement.addEventListener('hidden.bs.modal', talukaDeletedHiddenListener);
    this.talukaDeletedModalElement.addEventListener('hide.bs.modal', talukaDeletedHideListener);
  }
  editTaluka(d: Taluka) {
    this.currentForm = this.talukaUpdateForm;
    this.currentForm.reset()
    this.talukaData = d;
    this.talukaModalTitle = "Edit " + d.name;
    this.currentForm.get('id')?.setValue(d.id);
    this.currentForm.get('name')?.setValue(d.name);
    this.currentForm.get('gu_name')?.setValue(d.gu_name);
    this.currentForm.get('district_id')?.setValue(d.district_id);
    this.talukaModal.show();
    this.needUpdate = true;
  }
  addTaluka() {
    this.currentForm = this.talukaForm;
    this.currentForm.reset()
    this.needAdd = true;
    this.talukaModalTitle = "Add Taluka";
    this.talukaModal.show();
  }
  saveTaluka() {
    this.DS.markFormGroupTouched(this.currentForm)
    if (this.currentForm.valid) {
      if (this.needUpdate) {
        this.updateTaluka(this.currentForm.value)
      }
      if (this.needAdd) {
        this.newTaluka = this.currentForm.value
        this.addNewTaluka()
      }
      this.talukaModal.hide();
    } else {
      console.log(this.currentForm.value)
      const msg = this.needUpdate ? "Please enter valid data to update 'Taluka'" : "Please enter valid data for 'New Taluka'";
      this.toastService.show(msg, { class: 'bg-danger' });
    }
  }
  ngOnInit(): void {
    this.loadDistrict();
    this.filterTaluka.get('district')?.valueChanges.subscribe((value) => {
      this.districtService.getDistrictById(value).subscribe((value) => {
        if (value) {
          this.loadTaluka();
          this.selectedDistrict = value;
          this.loadDeletedTalukaLength();
        }
      });
    })
  }
  loadDistrict(): void {
    this.districtService.getDistrict().subscribe((data) => {
      this.districts = data;
      if (data.length) {
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        this.selectedDistrict = data[0];
        this.filterTaluka.get('district')?.setValue(this.selectedDistrict?.id);
      }
    });
  }
  loadTaluka(): void {
    this.talukaService.getTalukaByDistrict(this.filterTaluka.get('district')?.value).subscribe((data) => {
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      this.talukas = data;
    });
  }
  addNewTaluka(): void {
    this.talukaService.addTaluka(this.newTaluka).subscribe((data) => {
      console.log('Taluka added successfully:', data);
      this.loadTaluka();
    });
  }
  deleteTaluka(id: string): void {
    this.talukaService.deleteTaluka(id).subscribe((data) => {
      console.log('Taluka deleted successfully:', data);
      this.loadTaluka();
      this.loadDeletedTalukaLength();
    });
  }
  updateTaluka(value: Taluka): void {
    const talukaId = value.id;
    const updatedData = {
      name: value.name,
      gu_name: value.gu_name,
      district_id: value.district_id,
      is_deleted: value.is_deleted
    };
    console.log(talukaId, updatedData)
    this.talukaService.updateTaluka(talukaId, updatedData).subscribe(
      response => {
        console.log('Taluka updated successfully:', response);
        this.loadTaluka(); // Refresh the taluka data after updating
      },
      error => {
        console.error('Error updating taluka:', error);
        // Handle error, e.g., show an error message to the user
      }
    );
  }
  loadDeletedTalukaLength(): void {
    const districtId = this.selectedDistrict?.id;
    if (districtId) {
      this.talukaService.getDeletedTalukaLength(districtId).subscribe(
        (data) => {
          this.deletedTalukaCount = data.deletedTalukasLength;
          (!data.deletedTalukasLength) ? this.talukaDeletedModal.hide() : false;
        },
        (error) => {
          console.error('Error loading deleted talukas count:', error);
        }
      );
    }
  }

  loadDeletedTaluka(): void {
    const districtId = this.selectedDistrict?.id; // Replace this with the actual way you get the district ID
    this.talukaService.getDeletedTaluka(districtId).subscribe(
      (data) => {
        this.deletedTalukaList = data;
      },
      (error) => {
        console.error('Error loading deleted talukas:', error);
      }
    );
  }

  toggleTalukaActive(id: number): void {
    this.talukaService.toggleTalukaActive(id).subscribe(
      (response) => {
        this.loadDeletedTalukaLength();
        this.loadDeletedTaluka();
        this.loadTaluka();
      },
      (error) => {
        console.error('Error toggling taluka active state:', error);
      }
    );
  }

  openDeletedModal() {
    this.loadDeletedTaluka();
    this.talukaDeletedModal.show();
  }
}
