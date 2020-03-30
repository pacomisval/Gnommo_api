import { Component, OnInit } from '@angular/core';
import { BookService } from 'src/app/services/book.service';
import { Router } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/models/author';

@Component({
  selector: 'app-addlibro',
  templateUrl: './addlibro.component.html',
  styleUrls: ['./addlibro.component.css']
})
export class AddlibroComponent implements OnInit {

  autores: Author[];
  autor: Author;
  autorSeleccionado: Author ;
  idAutor: any;
  bookTitleTemp;
  index;

  book = {
    title: '',
    isbn: ''
  };

  constructor(private router: Router, private bookService: BookService, private authorService: AuthorService) { }

  ngOnInit() {

    if (this.bookTitleTemp != null) {this.book.title = this.bookTitleTemp; }
    this.authorService.getAll().subscribe(results => {
      this.autores = results;
      this.autorSeleccionado = this.autores[0];
      console.log(this.autores);
    });

  }
  GuardarLibro() {
    console.log(this.autorSeleccionado);
    const data = {
      id: '',
      nombre: this.book.title,
      isbn: this.book.isbn,
      idAutor: this.autorSeleccionado.id
    };
    if (this.autorSeleccionado.id == 1) {
      this.authorService.addAutorLibro();
      console.log('ir a añadir autor');
      localStorage.setItem('nombre', this.book.title);
      this.bookTitleTemp = this.book.title;
      this.router.navigate(['agregarAutores']);

    } else {
      this.bookService.createBook(data).subscribe(results => {
        alert('Libro Agregado');
        this.router.navigate(['listar']);
      }, error => {
        alert('NO Agregado');
        this.router.navigate(['/']);
      });
    }
  }
  nuevo(): boolean {
    console.log(this.autor.id);
    return true;
  }
}
