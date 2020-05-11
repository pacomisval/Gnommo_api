import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Globals } from '../Global';


@Injectable({
  providedIn: 'root'
})
export class BookService {
  books: any;

  constructor(private http: HttpClient) {}

  getAll() {
    console.log(Globals.apiUrl);
    return this.http.get<any>(Globals.apiUrl + '/libros/all');
  }

  getBookId(id: number) {
    console.log(`id ${id}`);
    return this.http.get<any>(Globals.apiUrl + '/libros/' + id);
  }

  getBookFromAutor(id: number) {
    return this.http.get<any>(Globals.apiUrl + '/libros/autor/' + id);
  }

  obtenerLibrosPorAutor(data) {
    // Initialize Params Object
    let Params = new HttpParams();

    console.log(data.nombre);
    console.log(data.apellido);
    // Begin assigning parameters
    Params = Params.append('firstParameter', data.nombre);
    Params = Params.append('secondParameter', data.apellido);
    return this.http.get<any>(Globals.apiUrl + '/filtrar', { params: Params }); // BUG .....

  }

  obtenerLibro(data) {
    // Initialize Params Object
    let Params = new HttpParams();
    console.log("dentro de obtener libro, pasamos:",data);
    console.log(data.nombre);
    // Begin assigning parameters
    Params = Params.append('firstParameter', data.nombre);
    console.log(Params);
    return this.http.get<any>(Globals.apiUrl + '/buscarLibro', { params: Params }); // BUG .....
  }

  createBook(data) {
    console.log(data);
    return this.http.post<any>(Globals.apiUrl + '/libros', data);
  }

  updateBook(data) {
    console.log('entra en updateBook');
    console.log(data);
    return this.http.put<any>(Globals.apiUrl + '/libros/' + data.id, data);
  }

  deleteBook(id) {
    return this.http.delete<any>(Globals.apiUrl + '/libros/' + id);
  }
  // obtenerLibro(data) {
  //   // Initialize Params Object
  //   let Params = new HttpParams();

  //   console.log(data);
  //   console.log(data.nombre);
  //   // Begin assigning parameters
  //   Params = Params.append('firstParameter', data.nombre);
  //   return this.http.get<any>(Globals.apiUrl + '/buscarLibro', { params: Params }); // BUG .....

  // }
  getLibros() {
    this.getAll().subscribe(
      (result) => {
        this.books = result;
        console.log('LISTA libros: ');
        console.log(result);
        return result;
    //     console.log('LISTA GENEROS: ');
    //     result.forEach(element => {
    //   console.log(element.genero);
    //   if (!this.generos.includes(element.genero)) {
    //     this.generos.push(element.genero);
    //  }
    //     });
    //     console.log("Array de generos",this.generos);
    //     this.matrizLibros();
      },
      (error) => {
     //   this.information = 'No se ha cargado la lista de libros';
     //   this.openInformationWindows();
          console.log(error);
      }
    );
  }
}
