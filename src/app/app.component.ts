import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

import { MustMatch } from './_helpers';
import { UserService } from './services/user.service';
import { AuthenticationService } from './services/authentication.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  cookieMessage = 'Estamos obligados a darte el coñazo con esto de las cukis';
  cookieDismiss = 'Cerrar';
  cookieLinkText = 'Vea que las cukis solo guardan informacion util para ti';

  title = 'Biblioteca de Gnomo';
 // titulo = 'Biblioteca';
  registerForm: FormGroup;
  registerModal: NgbModalRef;

  loading = false;
  submitted = false;
  CukiExits: boolean;
  cukiJson;
  currentUser;



  constructor(
    private router: Router,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService
  ) {

    console.log('entra constructor' );
    this.currentUser = this.authenticationService.currentUserValue;
  }
  /**
   * Valida campos input
   *
   * @memberof AppComponent
   */
  ngOnInit() {
    console.log('entra oninit' );
    this.politicaCukis();

    this.comprobarCookie();

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
  politicaCukis() {
    let cc = window as any;
    cc.cookieconsent.initialise({
      palette: {
        popup: {
          background: '#164969'
        },
        button: {
          background: '#ffe000',
          text: '#164969'
        }
      },
      theme: 'classic',
      content: {
        message: this.cookieMessage,
        dismiss: this.cookieDismiss,
        link: this.cookieLinkText,
        href: 'https://developers.de/privacy-policy/'
        // environment.Frontend + "/dataprivacy"
      }
    });

  }

  comprobarCookie() {
    const myCuki = this.cookieService.get('cuki');
    console.log(myCuki);
    if (myCuki) {
      this.CukiExits = true;
      console.log('Existe');
      this.cukiJson = JSON.parse(myCuki);
      console.log(this.cukiJson);
      console.log(this.cukiJson.id);
      console.log(this.cukiJson.Nombre);
      console.log(this.cukiJson.rol);
      console.log(this.cukiJson.token);
    } else {
      console.log('No Existe');
    }
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
  login() {
    this.router.navigate(['login']);
  }
  logout() {
    this.authenticationService.logout();
    window.location.reload();
    this.router.navigate(['/']);
  }

}
