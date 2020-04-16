import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Globals } from '../Global';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(email, password) {
  console.log("entra en autenticationservice.login")
   return this.http.post<any>(Globals.apiUrl + '/login', { email, password },{ observe: "response",  withCredentials: true})

    // const user1 = {
    //   userName: 'jose',
    //   email: 'jose@gmail.com',
    //   password: '123456',
    //   rol: 'admin',
    //   token: 'el token'
    // };
    // localStorage.setItem('currentUser', JSON.stringify(user1));
    // this.currentUserSubject.next(user1);
    // return user1;


  }

  logout() {
    // remove user from local storage and set current user to null
  //  localStorage.removeItem('currentUser');
  //  this.currentUserSubject.next(null);
     this.cookieService.delete('cuki');

  }
}
