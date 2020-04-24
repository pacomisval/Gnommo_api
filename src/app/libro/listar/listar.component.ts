import {
  Component,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from 'src/app/services/book.service';
import { Book } from 'src/app/models/book';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/models/author';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
/**
 * Componente actua sobre los libros haciendo
 * READ UPDATE y DELETE
 * @export
 * @class ListarComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css'],
})
export class ListarComponent implements OnInit {
  /**
   * Decorador para recoger los datos del libro
   *
   * @memberof ListarComponent
   */
  @Input() book: any;
  /**
   * View child Ventana Modal con un mensaje
   */
  @ViewChild('modalInformation', { static: false })
  modalInformation: TemplateRef<any>;

  /**
   * Recoge el autor actual
   *
   * @type {Author}
   * @memberof ListarComponent
   */
  author: Author;
  /**
   * Recoge el autor antes de modificar
   *
   * @type {Author}
   * @memberof ListarComponent
   */
  authorOld: Author;
  /**
   * Recoge la lista de libros
   *
   * @type {Book[]}
   * @memberof ListarComponent
   */
  books: Book[];
  /**
   * Nombre formulario para editar libros
   *
   * @type {FormGroup}
   * @memberof ListarComponent
   */
  editBookForm: FormGroup;
  isbnRepetido;
  /**
   * Boolean para confirmar la ventana modal de editar
   *
   * @memberof ListarComponent
   */
  submittedEditBook = false;
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
   * Mensaje en ventana modal
   */
  information = '';

  /**
   * Creando una instancia de ListarComponent.
   * @param {FormBuilder} formBuilder Necesario para formularios
   * @param {Router} router Necesario para enrutar
   * @param {NgbModal} modalService Servicio para ventanas modales
   * @param {NgbActiveModal} activeModal Necesario para ventanas modales
   * @param {BookService} bookService Servicio para book
   * @param {AuthorService} authorService Servicio para author
   * @param {UserService} userService Servicio para user
   * @memberof ListarComponent
   */
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private bookService: BookService,
    private authorService: AuthorService,
    private userService: UserService
  ) {}

  /**
   * Da valor a la variable admin del usuario
   * Parametros de validar editBookForm
   * Dar valor a la lista de libros
   *
   * @memberof ListarComponent
   */
  ngOnInit() {
    this.getLibros();
    this.admin = this.userService.userAdmin();
    this.editBookForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      isbn: ['', Validators.required],
      first_name: ['', [Validators.required]],
      last_name: ['', Validators.required],
    });
  }

  /**
   * abreviatura de this.editBookForm.controls
   * @readonly
   * @memberof ListarComponent
   */
  get ebfc() {
    return this.editBookForm.controls;
  }

  /**
   * Obtiene la lista de todos los libros
   *
   * @memberof ListarComponent
   */
  getLibros() {
    this.bookService.getAll().subscribe(
      (result) => {
        this.books = result;
           console.log('respuesta libros');
           console.log(result);
      },
      (error) => {
        this.information = 'No se ha cargado la lista de libros';
        this.openInformationWindows();
        //  console.log(error);
      }
    );
  }

  /**
   * Muestra un libro en ventana Modal
   *
   * @param {*} modalGetBook identificador ventana modal
   * @param {*} book libro a mostrar
   * @memberof ListarComponent
   */
  getBook(modalGetBook: any, book: Book) {
    this.book = book;
    this.modalService.open(modalGetBook, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
    });
  }

  /**
   * Muestra formulario en ventana Modal "editBookForm"
   *
   * @param {*} editBookModal identificador ventana modal
   * @param {*} book libro a editar
   * @memberof ListarComponent
   */
  openEditBookModal(editBookModal: any, book: Book) {
    console.log(book);
    this.book = book;
    this.authorOld = {
      id: this.book.idAutor,
      first_name: this.book.first_name,
      last_name: this.book.last_name,
    };

    this.modalService.open(editBookModal, {
      ariaLabelledBy: 'modal-basic-title',
    });
    this.isbnRepetido = this.book.isbn;
    console.log(this.book.isbn + " Rafitaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1");
  }

  /**
   * Recoge las modificaciones del formulario
   *
   * Modifica el autor
   *
   * Modifica el libro
   *
   * @param {*} book libro a guardar
   * @memberof ListarComponent
   */

  comprobacionFinal(results){
    console.log("entraaa rafa");
    var res=true;
    var sololetras : RegExp = /^[A-Za-z\s]+$/;


    if(this.book.first_name.length>50){
      this.information = "-Has superado el límite de carácteres máximos permitidos en el campo nombre";
      res=false;
    }else if(sololetras.test(this.book.first_name)==false){
      this.information = "-En el campo nombre solo se permiten letras";
      res=false;
    }

    if (this.book.last_name.length>50){
      this.information = "-Has superado el límite de carácteres máximos permitidos en el campo apellido";
      res=false;
    }else if(sololetras.test(this.book.last_name)==false){
      this.information = "-En el campo apellido solo se permiten letras";
      res=false;
    }

    var reg : RegExp = /^[0-9-a-zA-Z]+$/;

  if(this.book.nombre.length>50){
    this.information = "Has superado el límite de carácteres máximos en el campo titulo \n";
    res=false;
  }

if(this.isbnRepetido == this.book.isbn){
  this.information = "Asegurese de estar cambiando el ISBN \n";
  res=false;
}else{
  if (this.book.isbn.length>15){
    this.information = "Has superado el límite de carácteres máximos en el campo isbn \n";
    res=false;
  }else if(reg.test(this.book.isbn)==false){
    this.information = "Asegurese de estar introduciendo un ISBN correcto \n";
    res=false;
  }else{
    for (var i=0;i<results.length;i++){

      if(results[i].isbn == this.book.isbn){
        this.information = "El libro que intenta introducir ya existe \n";
       res=false;
      }
    }
  }
}
    if(!res){
      this.openInformationWindows();
    }
    return res;
   }

  editBook(book: Book, modalInformationDelete: any) {

    this.bookService.getAll().subscribe(
      (results) => {
        console.log(results[1].isbn+"  holaRafa");

      if(this.comprobacionFinal(results)){
    //  console.log(book);
    console.log(this.book.nombre+" aquiiiii23");
    console.log(this.book.isbn+" aquiiiii23");
    console.log(this.book.first_name +" aquiiiii23");
    console.log(this.book.last_name+" aquiiiii23");
    this.submittedEditBook = true;
    const datosAutor = {
      id: this.book.idAutor,
      first_name: this.ebfc.first_name.value,
      last_name: this.ebfc.last_name.value,
    };
    if (JSON.stringify(this.authorOld) === JSON.stringify(datosAutor)) {
      this.updateBookDB();
      //  console.log('autor sin modificador');
      //  console.log('compara');
      //  console.log(this.authorOld);
      //  console.log(datosAutor);
    } else {
      // /////////// Modificar el autor ///////////////////////
      //  console.log('autor a modificar');
      //  console.log(this.authorOld);
      //  console.log(datosAutor);
      this.authorService
        .modificarAuthor(datosAutor)
        .toPromise()
        .then((result) => {
          //      console.log('autor modificado');
          this.information = 'Se ha modificado el autor';
          this.openInformationWindows();
          // //////Cuando ha Modificado el autor entonces Modifica el libro //////////
          this.updateBookDB();
        })
        .catch((err) => {
          //     console.log('Error en autor modificado');
          //     console.log('respuesta updateBook error');
          console.log("Error en editBook: " + err);
          this.information = 'No se ha modificado el autor';
          this.openInformationWindows();
        });
    }
  }(err) => {
    console.log("nada")
   }
  }
);
  }

  /**
   * Guarda las modificaciones del libro en BD
   *
   * @memberof ListarComponent
   */
  updateBookDB() {
    const datosLibro = {
      id: this.book.id,
      nombre: this.ebfc.nombre.value,
      isbn: this.ebfc.isbn.value,
      idAutor: this.book.idAutor,
    };
    this.bookService
      .updateBook(datosLibro)
      .toPromise()
      .then((value) => {
        //    console.log('respuesta updateBook correcto');
        this.modalService.dismissAll();
        this.information = 'Se han guardado las modificaciones';
        this.openInformationWindows();
      })
      .catch((err) => {
        //    console.log('respuesta updateBook error');
        console.log("Error en updateBook: " + err);
        this.information = 'No se han podido efectuar las modificaciones';
        this.openInformationWindows();
      });
  }

  /**
   * Ventana Modal para confirmar el libro a eliminar
   *
   * @param {*} confirmDeleteBookModal Identificador de la ventana modal
   * @param {Book} book Libro a eliminar
   * @memberof ListarComponent
   */
  confirmDeleteBook(confirmDeleteBookModal: any, book: Book) {
    this.book = book;
    this.modalService.open(confirmDeleteBookModal, {ariaLabelledBy: 'modal-basic-title',});
  }

  /**
   * Borra del libro de la BD,
   *
   * Informa del resultado en Ventana Modal
   *
   * @param {*} inforDeleteBook Nombre de la ventana modal
   * @param {Book} book Libro a borrar
   * @memberof ListarComponent
   */
  deleteBook(book: Book) {
    this.book = book;
    this.bookService
      .deleteBook(this.book.id)
      .toPromise()
      .then((res) => {
        this.information = 'el libro se ha eliminado';
        this.openInformationWindows();
        this.getLibros();
      })
      .catch((err) => {
        console.log("Error en deleteBook: " + err);
        this.information = 'el libro no se ha eliminado';
        this.openInformationWindows();
      });
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
