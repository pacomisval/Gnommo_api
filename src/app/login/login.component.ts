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
        //image: ['', [Validators.required]],
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

  comprobarRegistro(){
   var res =true;
   var reg : RegExp = /^[0-9-a-zA-Z]+$/;
    var reg2 : RegExp = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,}$/;
    var reg3 : RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;

   if (this.rfc.userName.value.length>70){
    this.information = "Has superado el límite de carácteres máximos en el campo usuario \n";
    res=false;
  }else if(reg.test(this.rfc.userName.value)==false){
    this.information = "El campo usuario solo puede contener letras y numeros \n";
    res=false;
  }

  if(this.rfc.email.value.length>100){
    this.information = "Has superado el límite de carácteres máximos en el campo email \n";
    res=false;
  }else if(reg2.test(this.rfc.email.value)==false){
    this.information = "Asegurese de estar introduciendo un email válido \n";
    res=false;
  }

  if(reg3.test(this.rfc.password.value)==false){
    this.information = "La contraseña tiene que tener como mínimo una mayuscula, un número y una mínuscula, ademas tiene que tener como mínimo 6 carácteres \n";
    res=false;
  }else if(this.rfc.password.value != this.rfc.passwordRepeat.value){
    this.information = "Las contraseñas tienen que coincidir \n";
    res=false;
  }
  
  if(!res){
    this.openInformationWindows();
  }
    return res;
  }

  addUserDB() {
    if(this.comprobarRegistro()){
      this.comprobarRegistro();
      this.submittedRegister = true;
      console.log('registrando');
      if (this.registerForm.invalid) {
        console.log("formulario invalido")
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
