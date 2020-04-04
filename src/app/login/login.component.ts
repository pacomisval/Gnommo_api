import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  loginOpen = true;
  submittedLogin = false;
  submittedRegister = false;
  Administrador = false;
//  returnUrl: string;
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
    private cd: ChangeDetectorRef,
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['home']);
    }
  }
/** Parametros para validar los formularios
 *
 *
 * @memberof LoginComponent
 */
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
        image: ['', [Validators.required]],
        // image: ['', [Validators.required, requiredFileType('png')]],

      },
      {
        validators: MustMatch('password', 'passwordRepeat')
      }
    );
  // get return url from route parameters or default to '/'
  //  this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  /** Abreviatura de loginForm.controls
   *
   *
   * @readonly
   * @memberof LoginComponent
   */
  get lfc() { return this.loginForm.controls; }

  /** Abreviatura de registerForm.controls
   *
   *
   * @readonly
   * @memberof LoginComponent
   */
  get rfc() { return this.registerForm.controls; }

/**
 *
 *
 * @returns
 * @memberof LoginComponent
 */
onSubmit() {
    console.log('entra en summit');
    this.submittedLogin = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
//    this.loading = true;
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
            this.router.navigate(['home']).then
             (() =>  window.location.reload());
          }
        },
       error => {
        console.log('respuesta error');
        this.error = error;
        this.loading = false;
        });

  }
  abrirRegisterModal(registerModal: any) {
    // cierra ventana login
    this.loginOpen = false;
    // abre ventana register
    this.registerModal = this.modalService.open(registerModal, {
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  addUserDB() {
    this.submittedRegister = true;
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
      rol: 'user',
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
      this.router.navigate(['home']).then
      (() =>  window.location.reload());
    },
      error => {
        alert('usuario NO Agregado');
        console.log(error);
    });
  }
  get myForm() {
    return this.registerForm.get('rol');
  }

  onFileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      console.log(file);
      // reader.onload = () => {
      //   this.registerForm.patchValue({
      //     file: reader.result
      //  });
      // need to run CD since file load runs outside of zone
      //  this.cd.markForCheck();
      }
  }
  closeRegister() {
    // Cerrar modal Register
    this.modalService.dismissAll();
    // Abrir login
    this.loginOpen = true;
  }
  }

// }
