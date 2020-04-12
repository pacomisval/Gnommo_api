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
import { ok } from 'assert';

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
  adminExits: boolean;
  

  verCookieRol: string;
  verCookieName: string;

  cukiJson;
  currentUser: string;



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

    //setTimeout(function(){ this.comprobarCookie; }, 500);
    this.getCookie("tokensiN");
    this.getCookie("tokensiR");
    
    

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

  comprobarCookie(cookie) {
    if(cookie != "admin") {
      this.currentUser = cookie;
    }
  } 

  getCookie(nombre) {
    let micookie = "";
    let i;

    var lista = document.cookie.split(";");
    for (i in lista) {
      var busca = lista[i].search(nombre);
      if (busca > -1) {
        micookie=lista[i];
        console.log(micookie);
      }
    }
    var igual = micookie.indexOf("=");
    var valor = micookie.substring(igual+1);

    if(valor == "admin") {
      this.CukiExits = true;
      this.adminExits = true;
      this.userService.currentUserType = valor;
      this.adminExits = this.userService.userAdmin();
    }
    console.log(nombre);
    console.log(valor);
    this.comprobarCookie(valor);
    return valor;
  }

  /*comprobarCookie() {
    const myCuki = this.cookieService.get('tokensiR');
    console.log("valor de myCuki:" + myCuki);
    if (myCuki) {
      this.CukiExits = true;
      this.cukiJson = JSON.parse(myCuki);

      console.log('Existe');

      console.log(this.cukiJson);
      console.log(this.cukiJson.id);
      console.log(this.cukiJson.Nombre);
      console.log(this.cukiJson.rol);
      console.log(this.cukiJson.token);
      this.userService.currentUserType = this.cukiJson;
      this.adminExits = this.userService.userAdmin();

    } else {
      console.log('No Existe');
      this.CukiExits = false;
      this.adminExits = false;
    }
  }
  */

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
    this.router.navigate(['home']).then
    (() =>  window.location.reload());
  }

}
