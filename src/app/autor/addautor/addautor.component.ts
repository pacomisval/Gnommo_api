import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgForm } from '@angular/forms';
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
  styleUrls: ['./addautor.component.css'],
})
export class AddautorComponent implements OnInit {
  /**
   * View child Ventana Modal con un mensaje
   */
  @ViewChild('modalInformation', { static: false })
  modalInformation: TemplateRef<any>;

  /**
   * Formulario de Autor
   */
  authorForm: FormGroup;
  /**
   * Formulario emitido
   *
   * @memberof AddautorComponent
   */
  submittedAuthor = false;
  /**
   * Inicializa autor
   *
   * @memberof AddautorComponent
   */
  autor = {
    first_name: '',
    last_name: '',
  };
  /**
   * Mensaje en ventana modal
   *
   * @type {string}
   * @memberof AddautorComponent
   */
  information: string;
  /**
   * Verificacion del formulario
   *
   * @type {boolean}
   * @memberof AddautorComponent
   */
  invalidated: boolean;
  mautor;
  mapellido;

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
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.authorForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
    });
  }
  /**
   * AbreAbreviatura de autorForm.controls
   *
   * @memberof AddautorComponent
   */
  get afc() {
    return this.authorForm.controls;
  }
  /**
   * Guarda Autor en BD
   *
   * @memberof AddautorComponent
   */

  comprobacionFinal(){
    console.log("entraaa rafa");
    console.log(this.autor)
    var res=true;
    var letras : RegExp = /^[A-Za-z\s]+$/g;
    
    
    if(this.mautor.length>50){
      this.information = "-Has superado el límite de carácteres máximos en el campo nombre";
      res=false;
    }else if(letras.test(this.mautor)==false){
      this.information = "-En el campo nombre solo se permiten letras";
      res=false;
    }
    console.log(letras.test(this.mautor));
    if (this.mapellido.length>50){
      this.information = "-Has superado el límite de carácteres máximos en el campo apellido";
      res=false;
    }else if(letras.test(this.mapellido)==false){
      this.information = "-En el campo apellido solo se permiten letras";
      res=false;
    }

    if(!res){
      this.openInformationWindows();
    }
    return res;
   }

  Guardar() {
    if(this.comprobacionFinal()){
      console.log(this.authorForm.controls);
      this.submittedAuthor = true;
      if (this.authorForm.invalid) {
        return;
      }
      //  console.log(this.authorService.comesAddLibro);
    
      const data = {
        first_name: this.afc.first_name.value,
        last_name: this.afc.last_name.value,
      };

      // controlamos que no este repetido.
      // repetido=> Damos como agregado

      // no repetido =>agregamos
      this.authorService.postAutor(data).subscribe(
        (results) => {
          this.information = 'Autor añadido';
          this.openInformationWindows();
          this.backRoute();
          //      console.log(this.autor.first_name);
          //      console.log(this.autor.last_name);
          //      console.log(this.authorService. comesAddLibro);
        },
        (error) => {
          this.information = 'Autor no añadido';
          this.openInformationWindows();
          //          alert('NO Agregado');
          this.router.navigate(['/']);
        }
      );
      }
  }

  /**
   * Enruta en segun el valor de comesAddLibro
   */
  backRoute() {
    if (this.authorService.comesAddLibro) {
      this.authorService.comesAddLibro = false;
      this.router.navigate(['agregarLibro']);
    } else {
      this.router.navigate(['listarAutores']);
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
