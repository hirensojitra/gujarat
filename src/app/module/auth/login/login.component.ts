import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/common/services/authentication.service';
import { DevelopmentService } from 'src/app/common/services/development.service';
import { ToastService } from 'src/app/common/services/toast.service';
import { Md5 } from 'ts-md5';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  captchaCode: string | null | undefined;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private DS: DevelopmentService,
    private router: Router,
    private toast: ToastService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }
  login() {
    const pass = this.loginForm.get('password')?.value;
    this.loginForm.get('password')?.setValue(pass as string);
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      console.log("Username:", username);
      console.log("Password:", password);

      this.authService.login(username, password).subscribe(
        (success) => {
          if (success) {
            this.router.navigate(['/view']);
          } else {
            console.error("Login failed, check credentials");
          }
        },
        (error) => {
          console.log("Subscription error:", error);
        }
      );
    } else {
      this.DS.markFormGroupTouched(this.loginForm);
    }
    this.loginForm.get('password')?.setValue(pass);
  }
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      // Redirect to the 'view' route
      this.router.navigate(['/view']);
    }
  }
}
