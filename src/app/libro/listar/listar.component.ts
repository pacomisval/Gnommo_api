import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from 'src/app/services/book.service';
import { Book } from 'src/app/models/book';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthorService } from 'src/app/services/author.service';
import { Author } from 'src/app/models/author';
@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css']
})
export class ListarComponent implements OnInit {
  @Input() book;
  closeResult: any;
  author: Author;
  books: Book[];

  constructor(
    private router: Router,
    private bookService: BookService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private authorService: AuthorService
  ) { }

  ngOnInit() {
    this.getLibros();
  }
  getLibros() {
    this.bookService.getAll().subscribe(
      result => {
        this.books = result.response;
      },
      error => {
        console.log(error);
      }
    );
  }


  deleteBook(modalName, book) {

    this.book = book;
    this.modalService.open(modalName, { ariaLabelledBy: 'modal-basic-title' });

  }
  delete(modalName, book) {
    this.book = book;
    console.log(book);
    this.bookService.deleteBook(book.id).toPromise().then(res => {
      this.modalService.open(modalName, { ariaLabelledBy: 'modal-basic-title' });
      this.getLibros();
    })
      .catch(err => { console.log(err); });
  }



  getBook(modalGetBook, book) {
    this.book = book;
    this.modalService.open(modalGetBook, { ariaLabelledBy: 'modal-basic-title', centered: true });
  }
  editBook(modalEditBook, book) {
    this.book = book;
    this.modalService.open(modalEditBook, { ariaLabelledBy: 'modal-basic-title' });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
