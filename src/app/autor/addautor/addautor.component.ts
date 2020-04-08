import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import {NgForm} from '@angular/forms';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
/**
 * Componente para añadir Autor
 *
 * @export
 * @class AddautorComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-addautor',
  templateUrl: './addautor.component.html',
  styleUrls: ['./addautor.component.css']
})

export class AddautorComponent implements OnInit {
  /**
   * View child Ventana Modal con un mensaje
   */
  @ViewChild('modalInformation', { static: false })
  modalInformation: TemplateRef<any>;

/**
 * Inicializa autor
 *
 * @memberof AddautorComponent
 */
autor = {
    first_name: '',
    last_name: ''
  };
  /**
   * Mensaje en ventana modal
   *
   * @type {string}
   * @memberof AddautorComponent
   */
  information: string;
/**
 * Creates an instance of AddautorComponent.
 * @param {Router} router Para enrutar
 * @param {AuthorService} authorService Servicio para Author
 * @param {NgbModal} modalService Servivio para ventanas Modales
 * @memberof AddautorComponent
 */
constructor(
    private router: Router,
    private authorService: AuthorService,
    private modalService: NgbModal
  ) { }


  ngOnInit() {
  }
/**
 * Guarda Autor en BD
 *
 * @memberof AddautorComponent
 */
Guardar() {
  //  console.log(this.authorService.comesAddLibro);
    const data = {
      first_name: this.autor.first_name,
      last_name: this.autor.last_name
    };
//    this.checkForm();
    if (this.autor.first_name != '' || this.autor.last_name != '') {
//      console.log(this.autor.first_name);
//      console.log(this.autor.last_name);
      this.authorService.postAutor(data).subscribe(results => {
        this.information = 'Autor añadido';
        this.openInformationWindows();
      //  console.log(this.authorService. comesAddLibro);
        if (this.authorService.comesAddLibro) {
          this.authorService.comesAddLibro = false;
          this.router.navigate(['agregarLibro']);
        //  this.router.navigate(['agregarLibro'], { queryParamsHandling: 'preserve' });

        } else {
          this.router.navigate(['listarAutores']);
        }
      }, error => {
          alert('NO Agregado');
          this.router.navigate(['/']);
      });
    } else {
      alert('Los campos first_name y last_name son requeridos');
    }
  }

  // checkForm() {
  //  // if (this.autor.first_name != '' || this.autor.last_name != '')

  //     //hacer busqueda sql select * where first= and last = ... result
  //      //   = null -> añadir
  //     //   != null -> informar autor existe
  // }


  /**
   * Abre Ventana Modal informativa
   *
   * @memberof ListarComponent
   */
    openInformationWindows() {
    this.modalService.open(this.modalInformation);
  }
}
