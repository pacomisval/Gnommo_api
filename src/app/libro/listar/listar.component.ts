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
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Globals } from './../../Global';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser'; // para imagen libro en local
import { SecurityContext } from '@angular/compiler/src/core';
import { UploadService } from 'src/app/services/upload.service';
// import { UploadService } from './../../services/upload.service';
/** Componente actua sobre los libros haciendo
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
  oldAuthor: Author;
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
  imgBook;
  oldIsbn: string;
  filechange = false;
  // Cambiarfile = false;
  oldFile: any;
  oldNombre: any;
  findForm: FormGroup;
  buscarXautor: boolean;
  textoBusqueda = 'Nombre del Autor';
  authors: any;

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
    private userService: UserService,
    private uploadService: UploadService,
    private autorService: AuthorService,
  ) { }

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
      imgBook: [''],
    });
    this.findForm = new FormGroup({
      filtro: new FormControl(),
      texto: new FormControl()
    });
    this.getAllAutor();
    this.findForm.patchValue({ filtro: '' });
  }

  cambiarBusqueda() {
    const opcion = this.findForm.value.filtro;
    if (opcion == 'autor') {
      this.textoBusqueda = 'Nombre del Autor';
      this.buscarXautor = true;
    } else {
      this.textoBusqueda = 'Titulo del libro';
      this.buscarXautor = false;
    }
  }

  buscar() {
    console.log('busca', this.findForm.value);

    if(this.findForm.value.texto=="" || this.findForm.value.texto==null || this.findForm.value.texto==undefined){
      this.getLibros();
    }
    if (this.findForm.value.texto != null) {
    const opcion = this.findForm.value.filtro;
    console.log(opcion);
    if (opcion == 'autor') {
          const texto = this.findForm.value.texto.replace(/\s+/g, ' ').split(' ', (this.findForm.value.texto.length));
       // const texto = this.findForm.value.texto;
          if (texto.length > 2) {
          this.information = 'Asegurese de estar escribiendo el nombre y el apellido';
          this.openInformationWindows();
        } else {
          const data = { nombre: texto[0], apellido: texto[1] };
          console.log(data.nombre);
          this.bookService.obtenerLibrosPorAutor(data).subscribe(
            (result) => {
              this.books = result;
              console.log(result);
            },
            (error) => {
              this.information = 'No se ha cargado la lista de libros';
              this.openInformationWindows();
              console.log(error);
            }
          );
        }
      } else if (opcion == 'libro') {
        console.log('opcion LIBRO');
        const texto = this.findForm.value.texto.replace(/\s+/g, ' ');
        const data = { nombre: texto };
        console.log(texto);
        this.bookService.obtenerLibro(data).subscribe(
          (result) => {
            this.books = result;
            console.log(result);
          },
          (error) => {
            this.information = 'No se ha cargado la lista de libros';
            this.openInformationWindows();
            console.log(error);
          }
        );
      }
    }
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
    // console.log("libro",this.book)
    this.modalService.open(modalGetBook, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
    });
    this.imgBook = Globals.imagenBookURL + this.book.portada;
  }

  /**
   * Muestra formulario en ventana Modal "editBookForm"
   *
   * @param {*} editBookModal identificador ventana modal
   * @param {*} book libro a editar
   * @memberof ListarComponent
   */
  openEditBookModal(editBookModal: any, book: Book) {
    console.log('libro: ', book);
    this.book = book;
    this.imgBook = Globals.imagenBookURL + this.book.portada;
    this.oldAuthor = {
      id: this.book.idAutor,
      first_name: this.book.first_name,
      last_name: this.book.last_name,
    };
    this.oldFile = this.book.portada;
    this.oldIsbn = this.book.isbn;
    this.oldNombre = this.book.nombre;
    console.log('isbn: ', this.oldIsbn);
    this.modalService.open(editBookModal, {
      ariaLabelledBy: 'modal-basic-title',
    });
  }

  editBook(book: Book, modalInformationDelete: any) {
    this.submittedEditBook = true;
    const okFields = this.checkFields();
    const datosAutor = {
      id: this.book.idAutor,
      first_name: this.ebfc.first_name.value,
      last_name: this.ebfc.last_name.value,
    };
    if (okFields) {
      if (JSON.stringify(this.oldAuthor) === JSON.stringify(datosAutor)) {
        this.updateBookDB();
      } else {
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
            console.log('Error en editBook: ' + err);
            this.information = 'No se ha modificado el autor';
            this.openInformationWindows();
          });
      }
    } else {
      this.information = 'Error indocumentado en algun campo';
      this.openInformationWindows();
    }
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
        if (this.filechange) {  // si hay cambio de fichero
          this.uploadFile();
        }

        this.modalService.dismissAll();
        this.uploadFile();
        this.information = 'Se han guardado las modificaciones';
        this.openInformationWindows();
      })
      .catch((err) => {
        //    console.log('respuesta updateBook error');
        console.log('Error en updateBook: ' + err);
        this.information = 'No se han podido efectuar las modificaciones';
        this.openInformationWindows();
      });
  }
  uploadFile() {
    console.log('entra en uploadFile');
    console.log('entra en uploadFile');
    const formData = new FormData();

    formData.append('uploadFile', this.uploadService.file);
    formData.append('fileName', '33');

    console.log('valor formData upload:', formData);

    this.uploadService.upload(formData).subscribe(
      (res) => {
        //  this.uploadResponse = res;
        console.log('valor de res: ' + res);
      },
      (err) => {
        // this.error = err;
        console.log('valor de error: ' + err[0]);
      }
    );
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
    this.modalService.open(confirmDeleteBookModal, {
      ariaLabelledBy: 'modal-basic-title',
    });
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
        console.log('Error en deleteBook: ' + err);
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

  onFileChange(event) {
    this.filechange = true;

    this.uploadService.onFileChange(event);
    this.preview(this.uploadService.file);
    console.log('this.oldFile________', this.oldFile);
    console.log('newFile_____________ ', this.uploadService.archivo.fileName);

    if (this.oldFile != this.uploadService.archivo.fileName) {
      console.log('son distintos ');
      this.filechange = true;
    } else {
      console.log('son iguales ');
      this.filechange = false;
    }
  }
  preview(file) {
    console.log('Entra en preview');

    if (file.type.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imgBook = reader.result;
      console.log(
        'newFile____result_________ ',
        this.uploadService.archivo.fileName
      );
    };
  }

  checkFields() {
    console.log('chequeando campos');
    let res = true;
    const sololetras: RegExp = /^[A-Za-z\s]+$/;
    const reg: RegExp = /^[0-9-a-zA-Z]+$/;
    console.log('titulo:', this.book.nombre);

    if (this.book.first_name.length > 50) {
      this.information =
        '-Has superado el límite de carácteres máximos permitidos en el campo nombre';
      res = false;
    } else if (sololetras.test(this.book.first_name) == false) {
      this.information = '-En el campo nombre solo se permiten letras';
      res = false;
    }

    if (this.book.last_name.length > 50) {
      this.information =
        '-Has superado el límite de carácteres máximos permitidos en el campo apellido';
      res = false;
    } else if (sololetras.test(this.book.last_name) == false) {
      this.information = '-En el campo apellido solo se permiten letras';
      res = false;
    }

    if (this.book.nombre.length > 50) {
      this.information =
        'Has superado el límite de carácteres máximos en el campo titulo \n';
      res = false;
    }

    // comprobar isbn cuando cambia
    if (this.oldIsbn != this.book.isbn) {
      if (this.book.isbn.length > 15) {
        this.information =
          'Has superado el límite de carácteres máximos en el campo isbn \n';
        res = false;
      } else if (reg.test(this.book.isbn) == false) {
        this.information =
          'Asegurese de estar introduciendo un ISBN correcto \n';
        res = false;
      } else {
        this.bookService.getAll().subscribe((results) => {
          console.log(results[1].isbn + '  holaRafa');
          console.log(results[1] + '  results');
          for (let i = 0; i < results.length; i++) {
            if (results[i].isbn == this.book.isbn) {
              this.information = 'El libro que intenta introducir ya existe \n';
              res = false;
            }
          }
        });
      }
    }

    if (!res) {
      this.openInformationWindows();
    }
    return res;
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
        console.log('authors', this.authors);
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
