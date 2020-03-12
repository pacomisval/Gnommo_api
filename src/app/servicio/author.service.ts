import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const baseUrl = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {

  author: any;
  id: number;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any>(baseUrl + '/autor');
  }

  getAutor(id: number) {
    console.log(`id ${id}`);
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.http.get<any>(baseUrl + '/autor/' + id, {headers: headers});
  }

  postAutor(data) {

    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json; charset=utf-8');

    return this.http.post<any>(baseUrl + '/autor', data, {headers: headers});
  }

  patchAutor(id: number, data) {
    return this.http.post<any>(baseUrl + '/autor/' + id, data);
  }

  deleteAutor(id: number) {
    return this.http.delete<any>(baseUrl+'/autor/' + id);
  }
}
