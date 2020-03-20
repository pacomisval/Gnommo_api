import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  NgbModal,
  NgbActiveModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { MustMatch } from './helpers/mustmach.validator';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'appApiNode';
  titulo = 'Biblioteca';
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  registerModal: NgbModalRef;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}
 /**
  * Valida campos input
  *
  * @memberof AppComponent
  */
 ngOnInit() {
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
  }

  listar() {
    this.router.navigate(['listar']);
  }
  listarAutores() {
    this.router.navigate(['listarAutores']);
  }
  newAuthor() {
    this.router.navigate(['agregarAutores']);
  }
  newBook() {
    this.router.navigate(['agregarLibro']);
  }
  /**
   * Abrir ventana para registrarse
   *
   * @param {*} modalName
   * @memberof AppComponent
   */
  abrirRegisterModal(modalName: any) {
    this.registerModal = this.modalService.open(modalName, {
      ariaLabelledBy: 'modal-basic-title'
    });
  }

  /**
   * Abreviatura de this.registerForm.controls
   *
   * @readonly
   * @memberof AppComponent
   */
  get rfc() {
    return this.registerForm.controls;
  }

  onSubmit() {
    console.log('guardar usuario');
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    // display form values on success
    // alert(
    //   'SUCCESS!! :-)\n\n' + JSON.stringify(this.registerForm.value, null, 4)
    // );
    this.loading = true;
    const data = this.registerForm.value;
    delete data.passwordRepeat;
    const rol = 'rol';
    const token = 'token';
    data[rol] = 'admin';
    data[token] = 'elToken';
    // this.userService.register(this.registerForm.value)
    alert('SUCCESS!! :-)\n\n' + JSON.stringify(data, null, 4));
    this.userService
      .createUser(this.registerForm.value)
      // .pipe(first())
      .subscribe(
        results => {
          this.registerModal.close();
          alert('Registration successful');
          // this.alertService.success('Registration successful', true);
          //           this.router.navigate(['/']);
        },
        error => {
          alert('Registration unsuccessful');
          // this.alertService.error(error);
          this.loading = false;
        }
      );
  }
}
