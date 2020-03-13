import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { BookService } from "src/app/servicio/book.service";
import { Book } from "src/app/book";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthorService } from "src/app/servicio/author.service";
import { Author } from "src/app/author";
@Component({
  selector: "app-listar",
  templateUrl: "./listar.component.html",
  styleUrls: ["./listar.component.css"]
})
export class ListarComponent implements OnInit {
  @Input() book;
  mostrarForm: boolean = false;
  ocultarForm: boolean = false;
  closeResult: any;

  libroSeleccionado: any;
  author: Author;
  books: Book[];
  //  book: Book;
  // result:any;

  constructor(
    private router: Router,
    private bookService: BookService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private authorService: AuthorService
  ) {}

  ngOnInit() {
    this.getLibros();
  }
  getLibros() {
    this.bookService.getAll().subscribe(
      result => {
        console.log("aqui");

        console.log(result.response);
        this.books = result.response;
        console.log("libros");
        console.log(this.books);
      },
      error => {
        console.log(error);
      }
    );
  }
  getBook(edit, book) {
    // this.modalService
    //   .open(edit, { ariaLabelledBy: "modal-basic-title" })
    //   .result.then(
    //     result => {
    //       this.closeResult = `Closed with: ${result}`;
    //     },
    //     reason => {
    //       this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //     }
    // );
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
    );
  }

  eliminar(book) {
    this.bookService.deleteBook(book.id).subscribe(results => {
      alert("Libro borrado" );
      this.getLibros();
    },
    error => { alert("Libro no eliminado")});
  }

  onVoted(agreed: boolean) {
    this.mostrarForm = agreed;
  }

  open(content, book) {
    this.book = book;
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title" })
      .result.then(
        result => {
          this.closeResult = `Closed with: ${result}`;
        },
        reason => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }
}
