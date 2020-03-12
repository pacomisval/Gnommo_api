import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from 'src/app/servicio/book.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css']
})
export class ListarComponent implements OnInit {

  mostrarForm: boolean = false;
  ocultarForm: boolean = false;

  libroSeleccionado: any;
 // books:Array<any>;
  books: any;
   book: any;
  // result:any;
  
  constructor(private router: Router, private bookService: BookService) { }

  ngOnInit() {
    this.getLibros();
  }
  getLibros() {
    this.bookService.getAll().subscribe(
      result => {
        console.log('aqui');
        // console.log(result.status);
        // console.log(result.error);
        console.log(result.response);
        this.books = result.response;
        console.log('libros');
        console.log(this.books);
      },
      error => {
        console.log(error);
      }
    );
  }
  getBook(book) {
    this.mostrarForm = true;
    console.log("Dentro de getBook");
    this.libroSeleccionado = book;

    console.log(book.idLibro);

    this.bookService.getBookId(book.idLibro).subscribe(
      result => {

        this.book = result.response;

        console.log(this.book);
      },
      error => {
        console.log(error);
      }
    )

  }

  eliminar(book) {
    this.bookService.deleteBook(book.id).subscribe(results => {
      alert("Libro borrado" );
    },
    error => { alert("Libro no eliminado")});
  }
  
  onVoted(agreed: boolean) {
    this.mostrarForm = agreed;
  }

}
