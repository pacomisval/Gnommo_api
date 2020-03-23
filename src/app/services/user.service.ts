import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    console.log(data);
    return this.http.post<any>(Globals.apiUrl + '/user', data);
  }


}
