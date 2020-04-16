import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';
import {
  NgbModal,
  NgbActiveModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../services/user.service';
import { MustMatch } from '../_helpers';
import { CookieService } from 'ngx-cookie-service';

/**
 * Complemento para Login, Logout, Registration
 *
 * @export
 * @class LoginComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerModal: NgbModalRef;
  registerForm: FormGroup;

  loading = false;
  loginOpen = true;
  submittedLogin = false;
  submittedRegister = false;
  Administrador = false;
  error: string;

  user = {
    userName: '',
    email: '',
    password: '',
    rol: '',
    token: '',
  };
  information: string;
  /**
   * View child Ventana Modal con un mensaje
   */
  @ViewChild('modalInformation', { static: false })
  modalInformation: TemplateRef<any>;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private userService: UserService,
    private cookieService: CookieService,
    private cd: ChangeDetectorRef
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['home']);
    }
  }
  /**
   * Parametros para validar los formularios
   *
   * @memberof LoginComponent
   */
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
        validators: MustMatch('password', 'passwordRepeat'),
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
  get lfc() {
    return this.loginForm.controls;
  }

  /** Abreviatura de registerForm.controls
   *
   *
   * @readonly
   * @memberof LoginComponent
   */
  get rfc() {
    return this.registerForm.controls;
  }

  /**
   * Valida al usuario
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
    this.authenticationService
      .login(this.lfc.email.value, this.lfc.password.value)
      // .pipe(first())
      .subscribe(
        (results) => {
          console.log('respuesta');
<<<<<<< HEAD
          console.log(results);

           /* if (results.id == 0) {
            // error
            console.log('id =0');
            // PENDIENTE MOSTRAR MODALES CON ERRORES
          } else {
            console.log('id distinto 0');
            // no error
            const cukiUser = JSON.stringify(results);
            console.log("valor de cukiUser: " + cukiUser);
            // this.cookieService.set(
            //   'cuki',
            //   cukiUser,
            //   1
            // );  
            this.router.navigate(['home']).then
             (() =>  window.location.reload());
          } */ 
          this.router.navigate(['home']).then(() =>  window.location.reload());
        },
       error => {
        console.log('respuesta error');
        this.error = error;
        this.loading = false;
        });

=======
          console.log(results.body);
          if (results.body.id == 0) {
            // error
            console.log('id =0');
            this.information = results.body.rol;
            this.openInformationWindows();
          } else {
            // no error
            console.log('id distinto 0');
            localStorage.setItem('Nombre', results.body.Nombre)
            localStorage.setItem('token', results.body.token)

            this.router.navigate(['home'])
               .then(() => {
                 window.location.reload();
               });
          }
        },
        (error) => {
          this.information = 'No podemos logear al usuario';
          this.openInformationWindows();
        }
      );
>>>>>>> origin/jose
  }
  /**
   * Muestra formulario registrar
   *
   * @param {*} registerModal
   * @memberof LoginComponent
   */
  abrirRegisterModal(registerModal: any) {
    // cierra ventana login
    this.loginOpen = false;
    // abre ventana register
    this.registerModal = this.modalService.open(registerModal, {
      ariaLabelledBy: 'modal-basic-title',
    });
  }
  /**
   * Añade usuario a la BD
   *
   * @returns
   * @memberof LoginComponent
   */
  addUserDB() {
    this.submittedRegister = true;
    console.log('registrando');
    if (this.registerForm.invalid) {
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
    this.userService.createUser(data).subscribe(
      (results) => {
        alert('usuario Agregado');
        console.log(results);
        const cukiUser = JSON.stringify(results);
        console.log(cukiUser);
        this.cookieService.set('cuki', cukiUser, 1);
        this.userService.currentUserType = data.rol;
        this.registerModal.dismiss();
        this.router.navigate(['home']).then(() => window.location.reload());
      },
      (error) => {
        alert('usuario NO Agregado');
        console.log(error);
      }
    );
  }

  // get myForm() {
  //   return this.registerForm.get('rol');
  // }

  onFileChange(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      console.log(file);
      reader.onload = () => {
        this.registerForm.patchValue({
          file: reader.result,
        });
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }
  /**
   * Cierra ventanas modales
   *
   * Muestra pagina Login
   *
   * @memberof LoginComponent
   */
  closeRegister() {
    // Cerrar modal Register
    this.modalService.dismissAll();
    // Abrir login
    this.loginOpen = true;
  }

  /**
   * Abre Ventana Modal informativa
   *
   * @memberof ListarComponent
   */
  openInformationWindows() {
    this.modalService.open(this.modalInformation);
  }
}

// }
