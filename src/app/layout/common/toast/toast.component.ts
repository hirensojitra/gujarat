import { Component } from '@angular/core';
import { ToastService } from 'src/app/common/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  constructor(public toastService: ToastService) { }
  removeToast(index: number): void {
    this.toastService.toasts.splice(index, 1);
  }
}
