import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  NgbModal,
  NgbActiveModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

import { MustMatch } from './_helpers';
import { UserService } from './services/user.service';
import { AuthenticationService } from './services/authentication.service';
import { CookieService } from 'ngx-cookie-service';
import { ok } from 'assert';
import { AuthorService } from './services/author.service';
import { Author } from './models/author';
import { BookService } from './services/book.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isCollapsed = true;
  cookieMessage = 'Estamos obligados a darte el coñazo con esto de las cukis';
  cookieDismiss = 'Cerrar';
  cookieLinkText = 'Vea que las cukis solo guardan informacion util para ti';

  title = 'Gnomo Librery';
  registerForm: FormGroup;
  registerModal: NgbModalRef;
  textoBusqueda = 'Nombre del Autor';
  loading = false;
  submitted = false;
  CukiExits: boolean;
  adminExits: boolean;
  currentUser: string;
  currentUserName: string;
  buscarXautor = true;
  rol;
  token;
  books;
  findForm: FormGroup;
  authors: Author[];
  constructor(
    private router: Router,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    private autorService: AuthorService,
    private bookService: BookService,
  ) {
    console.log('entra constructor');
    this.currentUser = this.authenticationService.currentUserValue;
    console.log(this.currentUser);
  }

  /**
   * Valida campos input
   *
   * @memberof AppComponent
   */
  ngOnInit() {
  //  console.log('entra oninit');
    this.politicaCukis();
    this.getCookie('tokensiN');
    this.getCookie('tokensiR');
    this.getCookie('tokensiT');
    this.getAllAutor();

    this.registerForm = this.formBuilder.group(
      {
        userName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordRepeat: ['', Validators.required],
      },
      {
        validators: MustMatch('password', 'passwordRepeat'),
      }
    );
    this.currentUser = this.authenticationService.currentUserValue;
  //  console.log(this.currentUser);
    this.findForm = new FormGroup({
    filtro: new FormControl(),
    texto: new FormControl()
    });
    this.findForm.patchValue({ filtro: "autor" });
  }

  politicaCukis() {
    const cc = window as any;
    cc.cookieconsent.initialise({
      palette: {
        popup: {
          background: '#164969',
        },
        button: {
          background: '#ffe000',
          text: '#164969',
        },
      },
      theme: 'classic',
      content: {
        message: this.cookieMessage,
        dismiss: this.cookieDismiss,
        link: this.cookieLinkText,
        href: 'https://developers.de/privacy-policy/',
        // environment.Frontend + "/dataprivacy"
      },
    });
  }

  comprobarCookie(nombre, cookie) {
    switch (nombre) {
      case 'tokensiI':

      break;
      case 'tokensiN':
        this.currentUserName = atob(cookie);
        console.log(this.currentUserName);
        break;
      case 'tokensiR':
        this.rol = atob(cookie);
        console.log(this.rol);

        if (this.rol == 'admin') {
          this.CukiExits = true; // este valor deberia cambiar cuando expira la cookie o el token para que se vea solo login
          this.adminExits = true;
          this.userService.currentUserType = this.rol;
          this.adminExits = this.userService.userAdmin();
        }

        break;
      case 'tokensiT':
        this.token = atob(cookie);
        console.log(this.token);
        break;
      default:
        console.log('No existe esa cookie');
    }

  }

  getCookie(nombre) {
    let micookie = '';
    const lista = document.cookie.split(';');
    lista.forEach((value) => {
      console.log(value);
      const busca = value.search(nombre);
      if (busca > -1) {
        micookie = value;
        console.log(micookie);
      }
    });
    const igual = micookie.indexOf('=');
    const clave = micookie.substring(1, igual);
    const valor = micookie.substring(igual + 1);

    this.comprobarCookie(clave, valor);
    return valor;
  }

// TODO Borrar Comentarios
  // listar() {
  //   this.router.navigate(['libros']);
  // }
  // listarAutores() {
  //   this.router.navigate(['autores']);
  // }
  // newAuthor() {
  //   this.router.navigate(['agregarAutores']);
  // }
  // newBook() {
  //   this.router.navigate(['agregarLibro']);
  // }
  // login() {
  //   this.router.navigate(['login']);
  // }
  logout() {
    this.authenticationService.logout();
    this.router.navigate(['home']).then(() => window.location.reload());
  }
/////////////////////////////
// TODO
cambiarBusqueda() {
  const opcion = this.findForm.value.filtro;
  if (opcion == 'autor') {
    this.textoBusqueda = 'Nombre del Autor';
    this.buscarXautor = true;
  }else{
  this.textoBusqueda = 'Titulo del libro';
  this.buscarXautor = false;
   }
}

  buscar() {
    const opcion = this.findForm.value.filtro;
    console.log("Opcion:", opcion);
    if (opcion == 'autor') {
      const texto = this.findForm.value.texto.replace(/\s+/g, ' ').split(' ', (this.findForm.value.texto.length));
      if (texto.length > 2) {
        //  this.information = 'Asegurese de estar escribiendo el nombre y el apellido';
        //  this.openInformationWindows();
      } else {
        const data = { nombre: texto[0], apellido: texto[1] };

        console.log(data.nombre);
        this.bookService.obtenerLibrosPorAutor(data).subscribe(
          (result) => {
            this.books = result;
            console.log("libros de un autor", result);
          },
          (error) => {
            //   this.information = 'No se ha cargado la lista de libros';
            //   this.openInformationWindows();
            console.log(error);
          }
        );
      }
    }
  }
  /**
   * Da valor a la lista de Autores
   *
   * @returns
   * @memberof ListarautoresComponent
   */
  getAllAutor() {
    this.autorService.getAll().subscribe(
      (result) => {
        this.authors = result;
        // console.log('respuesta authors');
        // console.log(result);
         console.log('authors',this.authors);
      },
      (error) => {
    //    this.message = 'No se ha cargado la lista de authors';
    //    this.openInformationWindows();
        // console.log('respuesta error authors');
        // console.log(error);
      }
    );
  }
}
