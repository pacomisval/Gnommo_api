import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { Globals } from '../Global';



@Injectable({
  providedIn: 'root'
})

export class UserService {
 // Globals.apiUrl = 'http://localhost:8000/api';
  currentUserType;

  constructor(private http: HttpClient) { }

  createUser(data) {
    return this.http.post<any>(Globals.apiUrl + '/usuarios', data);
  }

  userAdmin() {
    console.log('userAdmin');
    console.log(this.currentUserType);
    return this.currentUserType == 'admin' ? true : false;
  }

  devolverEmail(data) {
    return this.http.get<any>(Globals.apiUrl + '/email/'+data);
  }
}
