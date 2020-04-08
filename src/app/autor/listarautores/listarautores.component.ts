import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Author } from 'src/app/models/author';
/**
 * Componente Lista de autores READ & DELETE
 *
 * @export
 * @class ListarautoresComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-listarautores',
  templateUrl: './listarautores.component.html',
  styleUrls: ['./listarautores.component.css'],
})
export class ListarautoresComponent implements OnInit {
  /**
   * View child Ventana Modal con un mensaje
   */
  @ViewChild('modalInformation', { static: false })
  modalInformation: TemplateRef<any>;
  /**
   * Boolean para describir rol del usuario
   *
   * rol user boolean=false
   *
   * rol admin boolean=true
   *
   * @memberof ListarComponent
   */
  admin = false;
  /**
   * Lista de autores
   *
   * @type {Author[]}
   * @memberof ListarautoresComponent
   */
  authors: Author[];
  /**
   * autor
   *
   * @type {Author}
   * @memberof ListarautoresComponent
   */
  author: Author;

  //  id: number;
  /**
   * Mensaje en ventana modal
   */
  message = '';

 /**
  * Creates an instance of ListarautoresComponent.
  * @param {Router} router Para rutas
  * @param {ActivatedRoute} activatedRoute Para rutas
  * @param {NgbModal} modalService Para Ventanas Modales
  * @param {AuthorService} authorService Servicio de Author
  * @param {BookService} bookService Servicio de Book
  * @param {UserService} userService Servicio de User
  * @memberof ListarautoresComponent
  */
 constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private authorService: AuthorService,
    private bookService: BookService,
    private userService: UserService
  ) { }

  /**
   * Obtiene la lista de authors
   *
   * Obtiene el rol usuario
   *
   * @memberof ListarautoresComponent
   */
  ngOnInit() {
    this.getAll();
    this.admin = this.userService.userAdmin();
  }

  /**
   * Da valor a la lista de Autores
   *
   * @returns
   * @memberof ListarautoresComponent
   */
  getAll() {
    this.authorService.getAll().subscribe(
      (result) => {
        // console.log('respuesta authors');
        // console.log(result);
        // console.log('authors');
        this.authors = result;
      },
      (error) => {
        // console.log('respuesta error authors');
        // console.log(error);
        this.message = 'No se ha cargado la lista de authors';
        this.openInformationWindows();
      }
    );
  }

  // getAutor() {
  //   this.authorService.getAutor(this.id).subscribe(
  //     (result) => {
  //       console.log(result.response);
  //       this.authors = result.response;
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  //   return this.authors;
  // }

 // addAuthor() {}

  /**
   * Borra un Autor
   *
   * @param {*} author objeto a borrar
   * @memberof ListarautoresComponent
   */
  deleteAuthor(author: Author ) {
     // console.log(author.id);
    this.bookService.getBookFromAutor(author.id).subscribe(
      (result) => {
       // console.log(result);
        if (result != null) {
          this.message = 'No se puede eliminar un autor que tiene libros en la biblioteca';
          this.openInformationWindows();
        } else {
          console.log('estoy en el else');
          this.authorService.deleteAutor(author.id).subscribe((result) => {
            this.message = 'El autor se ha eliminado correctamente';
            this.openInformationWindows();
            this.getAll();
          });
        }
      },
      (error) => {
        this.message = 'El autor no se ha eliminado';
        this.openInformationWindows();
      }
    );
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
