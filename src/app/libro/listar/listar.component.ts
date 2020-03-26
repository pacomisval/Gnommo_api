import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from 'src/app/services/book.service';
import { Book } from 'src/app/models/book';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/models/author';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css']
})
export class ListarComponent implements OnInit {
  @Input() book;
  author: Author;
  books: Book[];
  editBookForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private bookService: BookService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private authorService: AuthorService
  ) {}

  ngOnInit() {
    this.getLibros();
    this.editBookForm = this.formBuilder.group(
      {
       nombre: ['', Validators.required],
       isbn: ['', Validators.required],
       first_name: ['', [Validators.required]],
       last_name: ['', Validators.required],
      }
    );
  }
/** abreviatura de this.editBookForm.controls
 *
 * @readonly
 * @memberof ListarComponent
 */
  get ebfc() { return this.editBookForm.controls; }

  /**  Obtiene la lista de todos los libros
   *
   *
   * @memberof ListarComponent
   */
  getLibros() {
    this.bookService.getAll().subscribe(
      result => {
        console.log('respuesta libros');
        console.log(result);
        this.books = result;
      },
      error => {
        console.log(error);
      }
    );
  }

  /** Muestra un libro en ventana Modal
   *
   *
   * @param {*} modalGetBook identificador ventana modal
   * @param {*} book
   * @memberof ListarComponent
   */
  getBook(modalGetBook, book: Book) {
    this.book = book;
    this.modalService.open(modalGetBook, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true
    });
  }

  /** Muestra formulario "editBookForm" en ventana Modal
   *
   *
   * @param {*} editBookModal
   * @param {*} book
   * @memberof ListarComponent
   */
  openEditBookModal(editBookModal, book: Book) {
    console.log(book);
    this.book = book;
    this.modalService.open(editBookModal, {
      ariaLabelledBy: 'modal-basic-title'
    });
  }

/** Guarda las modificaciones del libro provenientes
 * del formulario de su ventana modal
 *
 * @param {*} book
 * @memberof ListarComponent
 */
  editBook(book: Book) {
    this.submitted = true;
    console.log(book);
     // const datos = {
    //   id: this.book.id,
    //   nombre: this.ebfc.nombre.value,
    //   isbn: this.ebfc.isbn.value,
    //   idAutor: this.book.idAutor,
    //   first_name: this.ebfc.first_name.value,
    //   last_name: this.ebfc.last_name.value,
    // };
    const datosAutor = {
      id: this.book.idAutor,
      first_name: this.ebfc.first_name.value,
      last_name: this.ebfc.last_name.value,
    };

    const datosLibro = {
      id: this.book.id,
      nombre: this.ebfc.nombre.value,
      isbn: this.ebfc.isbn.value,
      idAutor: this.book.idAutor,
    };
   // console.log(data);
    this.authorService.putAutor(datosAutor).subscribe(
      result => {
        console.log('autor modificado');
        console.log(result);
      },
      error => {
        console.log(error);
      }
    );

    this.bookService.updateBook(datosLibro).subscribe(
      result => {
        console.log('respuesta editingBook');
        console.log(result);
      },
      error => {
        console.log(error);
      }
    );
  }



  deleteBook(modalName, book: Book) {
    this.book = book;
    this.modalService.open(modalName, { ariaLabelledBy: 'modal-basic-title' });
  }

  delete(modalName, book: Book) {
    this.book = book;
    this.bookService
      .deleteBook(this.book.id)
      .toPromise()
      .then(res => {
        this.modalService.open(modalName, {
          ariaLabelledBy: 'modal-basic-title'
        });
        this.getLibros();
      })
      .catch(err => {
        console.log(err);
      });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      console.log('modificar libro');
      return `with: ${reason}`;
    }
  }

}
