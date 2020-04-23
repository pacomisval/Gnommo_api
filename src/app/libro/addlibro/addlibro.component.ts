import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BookService } from 'src/app/services/book.service';
import { Router } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/models/author';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from '../../services/upload.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

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
  
  form: FormGroup;
  error: string;

  uploadResponse = { status: '', message: '', filePath: ''};
  
  
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

  /**
   * Obtiene datos del libro del localStorage
   *
   * Obtiene la lista de autores
   *
   * @memberof AddlibroComponent
   */
  ngOnInit() {
    this.book.title = localStorage.getItem('nombre');
    this.book.isbn = localStorage.getItem('isbn');
    console.log(this.book.title);
    console.log(this.book.isbn);
    this.getAuthors();

    this.form = new FormGroup({
      avatar: new FormControl()
   });
  }

  /**
   * Redirecciona el codigo en funcion de las modificaciones
   *
   * LocalStorage para mejorar experiencia del usuario
   *
   * @memberof AddlibroComponent
   */
  addBook() {
    console.log(this.selectedAuthor.id);

    if (this.selectedAuthor.id == 1) {
      localStorage.setItem('nombre', this.book.title);
      localStorage.setItem('isbn', this.book.isbn);
      this.optionNewAuthor();
    } else {
      localStorage.setItem('nombre', '');
      localStorage.setItem('isbn', '');
      this.saveBookDB();
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
    const data = {
      id: '',
      nombre: this.book.title,
      isbn: this.book.isbn,
      // idAuthor: this.selectedAuthor.id,
      id_author: this.selectedAuthor.id,
    };
    this.bookService.createBook(data).subscribe(
      (results) => {
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
   * Abre Ventana Modal informativa
   *
   * @memberof ListarComponent
   */
  openInformationWindows() {
    this.modalService.open(this.modalInformation);
  }

  /**
   *  Upload files
   */
  onSubmit() {
    const formData = new FormData();
    formData.append('uploadFile', this.form.get('avatar').value);
    console.log(formData);

    this.uploadService.upload(formData).subscribe(res => {
      this.uploadResponse = res;
      console.log("valor de res: " + res);
    },
    err => {
      this.error = err;
      console.log("valor de error: " + err);
    });
     
  }

  /**
   * 
   * @param event 
   *  Selección el archivo 
   */
  onFileChange(event) {  
    if(event.target.files.length > 0) {
      const file = event.target.files[0];
      
      this.form.get('avatar').setValue(file);
      console.log("valor de form: " + this.form.get);
    }
  }
}
