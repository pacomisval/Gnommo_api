import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';
import {
  NgbModal,
  NgbActiveModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../services/user.service';
import { MustMatch } from '../_helpers';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error: string;
  registerModal: NgbModalRef;
  registerForm: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private modalService: NgbModal,


    public activeModal: NgbActiveModal,

    private userService: UserService,

  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.registerForm = this.formBuilder.group(
      {
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordRepeat: ['', Validators.required]
      },
      {
        validators: MustMatch('password', 'passwordRepeat')
      }
    );
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }


  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService.login(this.f.username.value, this.f.password.value);
    // .pipe(first())
    // .subscribe(
    //     data => {
    //         this.router.navigate([this.returnUrl]);
    //     },
    //     error => {
    //         this.error = error;
    //         this.loading = false;
    //     });
    // eliminar cuando tengamos respuesta
    // this.router.navigate([this.returnUrl]);
    window.location.reload();
    this.router.navigate(['/']);

  }
  abrirRegisterModal(modalName: any) {
    this.registerModal = this.modalService.open(modalName, {
      ariaLabelledBy: 'modal-basic-title'
    });
  }
  get rfc() {
    return this.registerForm.controls;
  }
}
