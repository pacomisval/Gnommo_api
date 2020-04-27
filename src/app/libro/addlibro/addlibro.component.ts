import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BookService } from 'src/app/services/book.service';
import { Router } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/models/author';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from '../../services/upload.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { HashLocationStrategy } from '@angular/common';
import {
  checkLengthString,
  checkIsbnFormat,
  checkFile,
} from 'src/app/_helpers';
/**
 * Componente para añadir libro
 *
 * @export
 * @class AddlibroComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-addlibro',
  templateUrl: './addlibro.component.html',
  styleUrls: ['./addlibro.component.css'],
})
export class AddlibroComponent implements OnInit {
  id_author: any;
  form: FormGroup;
  file: any;
  uploadResponse = { status: '', message: '', filePath: ''};
  /**
   * Creates an instance of AddlibroComponent.
   * @param {Router} router Necesario para enrutar
   * @param {BookService} bookService Servicio de Book
   * @param {AuthorService} authorService Servicio de Author
   * @memberof AddlibroComponent
   */
  constructor(
    private router: Router,
    private bookService: BookService,
    private authorService: AuthorService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private uploadService: UploadService
  ) {}
  previewURL;
  imgBook;
  bookForm: FormGroup;
  fileData: File;
  // fileForm: FormGroup;
  error: string;

  /**
   * View child Ventana Modal con un mensaje
   */
  @ViewChild('modalInformation', { static: false })
  modalInformation: TemplateRef<any>;
  /**
   * Lista de autores
   *
   * @type {Author[]}
   * @memberof AddlibroComponent
   */
  authors: Author[];
  /**
   * autor seleccionado en el select
   *
   * @type {Author}
   * @memberof AddlibroComponent
   */
  selectedAuthor: Author;
  /**
   * Inicializacion del libro
   *
   * @memberof AddlibroComponent
   */
  book = {
    title: '',
    isbn: '',
  };
  /**
   * Mensaje a mostrar en Ventana Modal
   *
   * @memberof AddlibroComponent
   */
  message = '';
  books: any;

  getNombreArchivo() {
    return this.nombreArchivo;
  }

  setNombreArchivo(nombreArchivo) {
    this.nombreArchivo = nombreArchivo;
  }

  /**
   * Obtiene datos del libro del localStorage
   *
   * Obtiene la lista de autores
   *
   * @memberof AddlibroComponent
   */
  ngOnInit() {
    this.bookForm = this.formBuilder.group({
      title: '',
      isbn: '',
      imgBook: null,
      selectedAuthor: [''],
    });
    this.book.title = localStorage.getItem('titulo');
    this.book.isbn = localStorage.getItem('isbn');
    localStorage.setItem('comprobar', '');
    console.log('titulo onInit:', this.book.title);
    console.log('Isbn onInit:', this.book.isbn);
    this.getAuthors();
    this.getLibros();
    this.form = new FormGroup({
      avatar: new FormControl()
   });
  }

  comprobacionFinal(resultados) {
    const isbn = this.book.isbn;
    const title = this.book.title;
    let mtitulo = true;
    let misbn = true;

    this.message = '';
    this.message = checkLengthString(title, 50);
    if (this.message != '') {
      mtitulo = false;
    }
    this.message = checkLengthString(isbn, 15);
    if (this.message != '') {
      misbn = false;
    }
    this.message = checkIsbnFormat(isbn);
    if (this.message != '') {
      misbn = false;
    }

    let res = true;
    for (let i = 0; i < resultados.length; i++) {
      if (resultados[i].isbn == this.book.isbn) {
        this.message = 'El libro que intenta introducir ya existe \n';
        res = false;
      }
    }

    if (res && misbn && mtitulo) {
      localStorage.setItem('comprobar', 'bien');
    } else {
      this.openInformationWindows();
      localStorage.setItem('comprobar', 'mal');
    }
  }

  checkForm() {
    console.log('checkForm');
    const isbn = this.bookForm.value.isbn;
    const title =  this.bookForm.value.title;
    let checkOK = true;
    this.message = '';
    let text = '';

    text = checkLengthString(title, 50);
    if (text != '') {
      text = text + ' titulo \n';
      checkOK = false;
      this.message += text;
      text = '';
    }

    text = checkLengthString(isbn, 15);
    if (text != '') {
      text = text + ' isbn \n';
      checkOK = false;
      this.message += text;
      text = '';
    }

    text = checkIsbnFormat(isbn);
    if (text != '') {
      checkOK = false;
      this.message += text;
      text = '';
    }
    // comprobar si ya existe el isbn
    console.log('devolucion isbn ', this.checkIsbnExits(isbn));

    if (this.checkIsbnExits(isbn)) {
      console.log('isbn repetido');
      checkOK = false;
    } else {
      console.log('isbn no no no no repetido');
    }


    console.log('checkOK:', checkOK);
    if (checkOK) {
      localStorage.setItem('comprobar', 'bien');
    } else {
      this.openInformationWindows();
      localStorage.setItem('comprobar', 'mal');
    }
  }

  checkIsbnExits(isbn) {
    let finFor = false;
    let check = false;
    console.log('entra en isbn', isbn);
    for (let index = 0; index < this.books.length; index++) {
      const book = this.books[index];
      console.log('--', book.isbn, ':::', isbn);
      if (book.isbn == isbn) {
        console.log('isbn Repetido: ' + this.books[index].isbn + '---::' + isbn);
        const text = 'El libro que intenta introducir ya existe \n';
        this.message += text;
        finFor = true;
        check = true;
      }
      if (finFor) {
    console.log('check1', check);
    return check;
      }
    }
    console.log('check2', check);

    return check;
  }


addBook() {
    console.log('addbook_____');
    console.log(this.bookForm.value);
    this.checkForm();

    if (localStorage.getItem('comprobar') == 'bien') {
      console.log('comprobar = bien');

      if (this.bookForm.value.selectedAuthor.id == 1) {
        localStorage.setItem('titulo', this.bookForm.value.title);
        localStorage.setItem('isbn', this.bookForm.value.isbn);
        this.optionNewAuthor();
      } else {
        localStorage.setItem('titulo', '');
        localStorage.setItem('isbn', '');
        this.saveBookDB();
      }
    }

  }

  /**
   * Obtiene la lista de autores
   *
   * Inicializa el select a "Nuevo Autor"
   *
   * @memberof AddlibroComponent
   */
getAuthors() {
    this.authorService.getAll().subscribe(
      (results) => {
        this.authors = results;
        this.selectedAuthor = this.authors[0];
        //  console.log(this.authors);
      },
      (err) => {
        // error al cargar autores
        // console.log('error de autores');
        this.message = 'No se ha cargado la lista de autores';
        this.openInformationWindows();
      }
    );
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
        this.message = 'No se ha cargado la lista de libros';
        this.openInformationWindows();
        this.message = '';
        //  console.log(error);
      }
    );
  }

  /**
   * Abre Pagina de nuevo autor
   *
   * @memberof AddlibroComponent
   */
optionNewAuthor() {
    //  console.log('ir a añadir autor');
    this.authorService.comesAddLibro = true;
    this.router.navigate(['agregarAutores']);
  }

  /**
   * Guarda el libro en la BD
   *
   * @memberof AddlibroComponent
   */
saveBookDB() {

  // let imagen = this.bookForm.value.imgBook;

  console.log('imagen', this.imgBook);
  console.log('imagen nombre', this.imgBook.name);

 // extesion:  this.file.name.substr(this.file.name.lastIndexOf('.') + 1);
  const data = {
      id: '',
      titulo: this.bookForm.value.title,
      isbn: this.bookForm.value.isbn,
      id_author: this.id_author,
      extension:  this.imgBook.name.substr(this.imgBook.name.lastIndexOf('.') + 1),
  };
  console.log('data:::::::::::::', data);
  this.bookService.createBook(data).subscribe(
    (results) => {
        this.uploadFile();  //////no es su sitio
        this.message = 'Libro añadido';
        this.openInformationWindows();
        this.router.navigate(['listar']);
      },
      (error) => {
        this.message = 'El libro no se ha añadido:';
        this.openInformationWindows();
        this.router.navigate(['/']);
      }
  );

  }

  /**
   *
   * @param nomFile
   * @param isbn
   *  Crea un nombre de archivo que utilizaremos para guardarlo en la DB.
   */
  crearNombreArchivo(nomFile, isbn) {
    let nombreAux = nomFile.split(".");
    let exten = nombreAux[1];
    let nombre = isbn + "." + exten;

    return nombre
  }

  /**
   * Abre Ventana Modal informativa
   *
   * @memberof ListarComponent
   */
openInformationWindows() {
    this.modalService.open(this.modalInformation);
  }

  /**
   *  Upload files
   *  formData.append(), recibe:
   *  Param1: uploadFile = es un nombre que le pongo al archivo que envio, podria ser cualquiera.
   *  En el servidor el método r.FormFile('uploadFile') que recibe el archivo, tiene que tener el mismo
   *  nombre como parámetro para que pueda leer el archivo.
   *  Param2: this.form.get('avatar').value = el archivo físico en si y todo lo que contiene.
   *  Param3: this.book.isbn = es el nombre que tiene el archivo y se guardará con este nombre.
   */
uploadFile() {
  console.log('entra en uploadFile');
  let formData = new FormData();
  //formData.append('uploadFile', this.form.get('avatar').value);
  formData.append('uploadFile', this.file);


  console.log('valor formData upload:', formData);

  this.uploadService.upload(formData).subscribe(res => {
    this.uploadResponse = res;
    console.log('valor de res: ' + res);
  },
  err => {
    this.error = err;
    console.log('valor de error: ' + err);
  });

  }

  /**
   *
   * @param event
   *  Selección el archivo
   */
onFileChange(event) {
    if (event.target.files.length > 0) {
      this.file = event.target.files[0];
      this.form.get('avatar').setValue(this.file);
      console.log('valor de file: ', this.file);
      console.log('valor de form: ' + this.form.get);
     }
    this.uploadService.onFileChange(event);
    this.imgBook = this.uploadService.file;
    console.log('valor de imgBook: ', this.imgBook);
    this.preview(this.imgBook);
  }

    preview(file) {
    console.log('Entra en preview');
    if (checkFile(file)) {
      console.log('no es tipo imagen');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.previewURL = reader.result;
    };
  }

  /**
   * Controla cambios select Author para crear nuevo autor
   *
   * @param {*} event
   * @memberof AddlibroComponent
   */
changeAuthor(event) {
    this.id_author = this.bookForm.value.selectedAuthor.id;
    console.log('changeAuthor');
    console.log(this.bookForm.value.selectedAuthor.id);
    this.bookForm.get('selectedAuthor').setValue(event.target.value, {
      onlySelf: true,
    });
    if (this.bookForm.value.selectedAuthor.id == 1) {
      localStorage.setItem('titulo', this.bookForm.value.title);
      localStorage.setItem('isbn', this.bookForm.value.isbn);
      this.optionNewAuthor();
    }
  }
}
