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
import { CookieService } from 'ngx-cookie-service';



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
  user = {
    userName: '',
    email: '',
    password: '',
    rol: '',
    token: '',
  };


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private cookieService: CookieService,
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.registerForm = this.formBuilder.group(
      {
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordRepeat: ['', Validators.required],
        rol: ['', Validators.required],
      },
      {
        validators: MustMatch('password', 'passwordRepeat')
      }
    );
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convenience getter for easy access to form fields
  get lfc() { return this.loginForm.controls; }
  get rfc() { return this.registerForm.controls;
  }

  onSubmit() {
    console.log('entra en summit');
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService.login(this.lfc.email.value, this.lfc.password.value)
    // .pipe(first())
      .subscribe(
       results => {
         console.log('respuesta');
         console.log(results.id);
         if (results.id == 0) {
            // error
            console.log('id =0');
            // PENDIENTE MOSTRAR MODALES CON ERRORES
          } else {
            console.log('id distinto 0');
            // no error
            const cukiUser = JSON.stringify(results);
            console.log(cukiUser);
            this.cookieService.set(
              'cuki',
              cukiUser,
              1
            );

            // this.router.navigate([this.returnUrl]);
            window.location.reload();
            this.router.navigate(['/']);
          }
        },
       error => {
        console.log('respuesta error');
        this.error = error;
        this.loading = false;
        });

  }
  abrirRegisterModal(registerModal: any) {
    this.registerModal = this.modalService.open(registerModal, {
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  addUserDB() {
    console.log('registrando');
    if (this.registerForm.invalid) {
      console.log('formulario invalido');
      return;
    }
    this.loading = true;
    const data = {
      id: '',
      nombre: this.rfc.userName.value,
      password: this.rfc.password.value,
      email: this.rfc.email.value,
      rol: this.rfc.rol.value,
      tok: '',
    };
    console.log('data');
    console.log(data);
    this.userService.createUser(data).subscribe(results => {
      alert('usuario Agregado');
      console.log(results);
      const cukiUser = JSON.stringify(results);
      console.log(cukiUser);
      this.cookieService.set(
        'cuki',
        cukiUser,
        1
      );

      this.userService.currentUserType = data.rol;

      this.registerModal.dismiss();
      window.location.reload();
      this.router.navigate(['/']);
    },
      error => {
        alert('usuario NO Agregado');
        console.log(error);
    });
  }
}
