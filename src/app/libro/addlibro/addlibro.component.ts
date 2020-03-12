import { Component, OnInit } from '@angular/core';
import { BookService } from 'src/app/servicio/book.service';
import { Router } from '@angular/router';
import { AuthorService } from 'src/app/servicio/author.service';

@Component({
  selector: 'app-addlibro',
  templateUrl: './addlibro.component.html',
  styleUrls: ['./addlibro.component.css']
})
export class AddlibroComponent implements OnInit {

  autores: any;
  seleccionado: any = "";
  id_autor: any;

  book = {
    title: '',
    isbn: ''
  };

  constructor(private router: Router, private bookService: BookService, private authorService: AuthorService) { }

  ngOnInit() {
    this.authorService.getAll().subscribe(results => {
      this.autores = results.response;
      console.log(this.autores);
    });
    
  }
  GuardarLibro() {
    //console.log(this.seleccionado.id_autor);
    const data = {
      name: this.book.title,
      isbn: this.book.isbn,
      id_autor: this.seleccionado.id
    };
    this.bookService.createBook(data).subscribe(results => {
      alert('Libro Agregado');
      this.router.navigate(['listar']);
    }, error => {
        alert('NO Agregado');
        this.router.navigate(['/']);
    });

  }
}
