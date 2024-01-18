import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/common/services/authentication.service';
import { DevelopmentService } from 'src/app/common/services/development.service';
import { UserNewService } from 'src/app/common/services/user-new.service';
import { ToastService } from 'src/app/common/services/toast.service';
import { Md5 } from 'ts-md5';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class RegisterComponent {
  registrationForm!: FormGroup;
  constructor(
    private authService: AuthenticationService,
    private userService: UserNewService,
    private formBuilder: FormBuilder,
    private DS: DevelopmentService,
    private router: Router,
    private toast: ToastService) {
    this.registrationForm = this.formBuilder.group({
      username: ['', [Validators.required], [this.authService.checkUsernameAvailabilityValidator()]],
      password: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email], [this.authService.checkEmailAvailabilityValidator()]],
      roles: ['operator'],
      emailVerified: [false, Validators.required],
    });
  }

  ngOnInit(): void {
  }

  register(): void {
    const pass = this.registrationForm.get('password')?.value;
    const md5 = new Md5();
    this.registrationForm.get('password')?.setValue(md5.appendStr(pass).end() as string);
    if (this.registrationForm.valid) {
      const { username, password, email, roles, emailVerified } = this.registrationForm.value;
      this.authService.registerUser({ username, password, email, roles, emailVerified }).subscribe(
        response => {
          console.log('User registered successfully:', response);
          this.router.navigate(['/auth']);
          this.toast.show('User Registration Successfully.', { class: 'bg-success' });
        },
        error => {
          console.error('Error registering user:', error);
          // Handle error (display a message, etc.)
        }
      );
    } else {
      this.DS.markFormGroupTouched(this.registrationForm)
    }
    this.registrationForm.get('password')?.setValue(pass);
  }
}
