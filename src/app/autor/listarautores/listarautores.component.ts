import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-listarautores',
  templateUrl: './listarautores.component.html',
  styleUrls: ['./listarautores.component.css'],
})
export class ListarautoresComponent implements OnInit {
  /**
   * View child Ventana Modal con un mensaje
   */
  @ViewChild('modalInformation', { static: false })
  modalInformation: TemplateRef<any>;

  autores: any;
  autor: any;
  id: any;
  admin = false;
  message = '';
  constructor(
    private router: Router,
    private authorService: AuthorService,
    private activatedRoute: ActivatedRoute,
    private bookService: BookService,
    private userService: UserService,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
    if (this.id != null) {
      this.getAutor();
    } else {
      this.getAll();
    }
    this.admin = this.userService.userAdmin();
  }
  getAll() {
    this.authorService.getAll().subscribe(
      (result) => {
        console.log('respuesta autores');
        // console.log(result.response);
        console.log(result);
        console.log('autores');
        this.autores = result;
        console.log(this.autores);
      },
      (error) => {
        console.log('respuesta error autores');
        console.log(error);
      }
    );
    return this.autores;
  }

  getAutor() {
    this.authorService.getAutor(this.id).subscribe(
      (result) => {
        console.log(result.response);
        this.autores = result.response;
      },
      (error) => {
        console.log(error);
      }
    );
    return this.autores;
  }

  addAuthor() {}

  eliminar(x) {
    // var existe;
    const count = 0;
    this.id = x;
    console.log('existe');
    console.log(this.id);

    this.bookService.getBookFromAutor(this.id).subscribe(
      (result) => {
        console.log(result.response[0]);

        // tslint:disable-next-line: triple-equals
        if (result.response[0] != undefined) {
          alert('No se puede eliminar un autor que tiene libros registrados');
        } else {
          console.log('estoy en el else');
          this.authorService.deleteAutor(this.id).subscribe((result) => {
            console.log('Se ha eliminado correctamente');
            this.getAll();
          });
        }
      },
      (error) => {
        console.log(error);
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
}
