import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
   return this.http.post<any>(Globals.apiUrl + '/login', { email, password },{ observe: "response",  withCredentials: true,});
 
  }

  logout() {
     this.cookieService.delete('tokensiR');

  }
}