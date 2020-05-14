import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { Globals } from '../Global';
import { apiUrl } from './../_helpers/configuracion';



@Injectable({
  providedIn: 'root'
})

export class UserService {
 // apiUrl = 'http://localhost:8000/api';
  currentUserType;

  constructor(private http: HttpClient) { }

  createUser(data) {
    return this.http.post<any>(apiUrl + '/usuarios', data);
  }

  userAdmin() {
    console.log('userAdmin');
    console.log(this.currentUserType);
    return this.currentUserType == 'admin' ? true : false;
  }

  devolverEmail(data) {
    return this.http.get<any>(apiUrl + '/email/'+data);
  }
}
