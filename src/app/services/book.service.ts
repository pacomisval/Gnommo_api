import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const baseUrl = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  books: any;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any>(baseUrl + '/libros/all');
  }
  getBookId(id: number) {
    console.log(`id ${id}`);
    return this.http.get<any>(baseUrl + '/libros/' + id);
  }

  getBookFromAutor(id: number) {
    return this.http.get<any>(baseUrl + '/libros/autor/' + id);
  }

  createBook(data) {
    console.log(data);
    return this.http.post<any>(baseUrl + '/libros', data);
  }

  updateBook(data) {
    return this.http.patch<any>(baseUrl + '/libros/' + data.id, data);
  }

  deleteBook(id) {
    return this.http.delete<any>(baseUrl + '/libros/' + id);
  }
}
