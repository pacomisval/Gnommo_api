import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { BookService } from "src/app/servicio/book.service";
import { AuthorService } from "src/app/servicio/author.service";
import { CommonModule } from "@angular/common";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-editarlibro",
  templateUrl: "./editarlibro.component.html",
  styleUrls: ["./editarlibro.component.css"]
})
export class EditarlibroComponent implements OnInit {
  closeResult: string;

  @Input() book;
  @Output() voted = new EventEmitter<boolean>();

  mostrar: any;

  constructor(
    private router: Router,
    private bookService: BookService,
    private authorService: AuthorService,
    private modalService: NgbModal
  ) {}

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

  open(content) {
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
