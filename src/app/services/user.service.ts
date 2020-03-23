import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';

const apiUrl = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  user: User;

  constructor(private http: HttpClient) { }

  createUser(data) {
    console.log(data);
    return this.http.post<any>(apiUrl + '/user', data);
  }


}
