import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorService } from 'src/app/services/author.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import {NgForm} from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-addautor',
  templateUrl: './addautor.component.html',
  styleUrls: ['./addautor.component.css']
})
export class AddautorComponent implements OnInit {

  autor = {
    first_name: '',
    last_name: ''
  };

  constructor(private router: Router, private authorService: AuthorService,private location:Location) { }


  ngOnInit() {
  }

  Guardar() {
    console.log(this.authorService.mandadoLibro);
    const data = {
      first_name: this.autor.first_name,
      last_name: this.autor.last_name
    };

    if (this.autor.first_name != '' && this.autor.last_name != '') {

      console.log(this.autor.first_name);
      console.log(this.autor.last_name);

      this.authorService.postAutor(data).subscribe(results => {
        alert('Autor Agregado');
        console.log(this.authorService.mandadoLibro);
        if (this.authorService.mandadoLibro) { this.router.navigate(['agregarLibro'],{ queryParamsHandling: 'preserve' });} else {
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

}
