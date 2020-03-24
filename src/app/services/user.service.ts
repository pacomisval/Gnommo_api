import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { Globals } from '../Global';



@Injectable({
  providedIn: 'root'
})

export class UserService {
 // Globals.apiUrl = 'http://localhost:8000/api';
  user: User;

  constructor(private http: HttpClient) { }

  createUser(data) {
    const headers = new HttpHeaders();
    console.log('enviando peticion');
    console.log(data);
    headers.set('Content-Type', 'application/json; charset=utf-8');
   // return this.http.post<any>(Globals.apiUrl + '/usuarios', data, { headers });
    return this.http.post<any>(Globals.apiUrl + '/usuarios', data);

  }


}
