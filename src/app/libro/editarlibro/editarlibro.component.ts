import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from "@angular/router";
import { BookService } from "src/app/servicio/book.service";
import { AuthorService } from "src/app/servicio/author.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-editarlibro',
  templateUrl: './editarlibro.component.html',
  styleUrls: ['./editarlibro.component.css']
})
export class EditarlibroComponent implements OnInit {

  @Input() book;
  @Output() voted = new EventEmitter<boolean>();

  mostrar: any;

  constructor(
    private router: Router,
    private bookService: BookService,
    private authorService: AuthorService
  ) { }

  ngOnInit() {
    console.log(this.book);
  }
  actualizarLibro() {
    const data = {
      name: this.book.name,
      isbn: this.book.isbn,
      id: this.book.id,
      id_autor: this.book.id_autor
    };
    this.bookService.updateBook(data).subscribe(
      results => {
        alert("libro updateado");
      },
      error => {
        alert("NO updateado" + error);
      }
    );
  }
  vote(agreed: boolean) {
    this.voted.emit(agreed);
  }
}
