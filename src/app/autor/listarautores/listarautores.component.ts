import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthorService} from 'src/app/servicio/author.service';
import { BookService } from 'src/app/servicio/book.service';

@Component({
  selector: 'app-listarautores',
  templateUrl: './listarautores.component.html',
  styleUrls: ['./listarautores.component.css']
})
export class ListarautoresComponent implements OnInit {

  autores: any;
  autor: any;
  id: any;

  constructor(private router: Router,private authorService: AuthorService, private activatedRoute: ActivatedRoute, private bookService: BookService) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params['id'];
    if(this.id != null) {
      this.getAutor();
      
    }
    else {
      this.getAll();
    }
    
  }
  getAll() {
    this.authorService.getAll().subscribe(
      result => {
        console.log(result.response);
        this.autores= result.response;
      },
      error => {
        console.log(error);
      }
    );
    return this.autores;
  }

  getAutor() {
    this.authorService.getAutor(this.id).subscribe(result => {
        console.log(result.response);
        this.autores = result.response;
      },
      error => {
        console.log(error);
    });
    return this.autores;
  }

  addAuthor() {

  }

  eliminar(x) {
    //var existe;
    var count = 0; 
    this.id = x;
    console.log("existe");
    console.log(this.id);

    this.bookService.getBookFromAutor(this.id).subscribe(result => {
      console.log(result.response[0]);
  
      
      if (result.response[0] != undefined) {
        alert("No se puede eliminar un autor que tiene libros registrados");
      }    
      else {
         console.log("estoy en el else");
         this.authorService.deleteAutor(this.id).subscribe(result => {
           console.log("Se ha eliminado correctamente");
           this.getAll();
         }); 
      }  
    },
    error => {
      console.log(error);
    });

  }

}
