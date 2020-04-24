import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BookService } from 'src/app/services/book.service';
import { Router } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/models/author';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from '../../services/upload.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { HashLocationStrategy } from '@angular/common';
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

 comprobacionFinal(resultados){
  var mtitulo=true;
  var misbn=true;
  var reg : RegExp = /^[0-9-a-zA-Z]+$/;

  if(this.book.title.length>50){
    this.message = "Has superado el límite de carácteres máximos en el campo titulo \n";
    mtitulo=false;
  }

  if (this.book.isbn.length>15){
    this.message = "Has superado el límite de carácteres máximos en el campo isbn \n";
    misbn=false;
  }else if(reg.test(this.book.isbn)==false){
    this.message = "Asegurese de estar introduciendo un ISBN correcto \n";
    misbn=false;
  }

  var res=true;
  for (var i=0;i<resultados.length;i++){

    if(resultados[i].isbn == this.book.isbn){
      this.message = "El libro que intenta introducir ya existe \n";
     res=false;
    }
  }

  if(res && misbn && mtitulo){
    localStorage.setItem('comprobar','bien')
  }else{
    this.openInformationWindows();
    localStorage.setItem('comprobar','mal')
  }

 }

  addBook() {
    // console.log(this.selectedAuthor);
    this.bookService.getAll().subscribe(
      (results) => {
        console.log(results[1].isbn+"  holaRafa");

        this.comprobacionFinal(results);
        if(localStorage.getItem('comprobar')=='bien'){
          console.log("addbook")
          console.log(this.book.title)
          if (this.selectedAuthor.id == 1){

            localStorage.setItem('nombre', this.book.title);
            localStorage.setItem('isbn', this.book.isbn);
            this.optionNewAuthor();
          }else {
            localStorage.setItem('nombre', '');
            localStorage.setItem('isbn', '');
            this.saveBookDB();
          }
        }
      },
      (err) => {
       console.log("nada")
      }
    );


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
