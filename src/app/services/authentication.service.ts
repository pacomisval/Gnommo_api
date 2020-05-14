import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Globals } from '../Global';
import { User} from '../models/user';
import { apiUrl } from './../_helpers/configuracion';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;


  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
    console.log(this.currentUser);
  }

  public get currentUserValue() {

    return this.currentUserSubject.value;
  }

  /**
   *
   * @param email
   * @param password
   * Envio de credenciales para autenticación de usuario registrado.
   */
  login(email, password) {

  console.log("entra en autenticationservice.login")
   return this.http.post<any>(apiUrl + '/login', { email, password },{ observe: "response",  withCredentials: true,});

  }

  /**
   * Elimina la sesión existente del usuario(admin) logueado.
   */
  logout() {
    this.cookieService.delete('tokensiI');
    this.cookieService.delete('tokensiN');
    this.cookieService.delete('tokensiR');
    this.cookieService.delete('tokensiT');

  }

  /**
   *
   * @param nombre
   * @param email
   * Envio de credenciales al servidor para su verificación.
   * Si es true, se inicia el proceso de recuperación de contraseña.
   */
  recoveryPassword1(/* nombre, */ email) {
    console.log("Dentro de autenticationService.recoveryPassword 1");
    // console.log(nombre);
    console.log(email);
    return this.http.post<any>(apiUrl + '/recoveryPass1', {/*  nombre,  */email },{ observe: "response",  withCredentials: true,});
  }
  /**
   *
   * @param codigo
   * Envio del codigo recibido por email al servidor para su verificación.
   * Si es true, continuamos el proceso de recuperación de contraseña.
   */

  recoveryPassword2(codigo) {
    console.log("Dentro de autenticationService.recoveryPassword 2");
    console.log("Valor de codigo: " + codigo);
    return this.http.post<any>(apiUrl + '/recoveryPass2', { codigo },{ observe: "response", withCredentials: true,});
  }
  /**
   *
   * @param password
   * Se establece nueva contraseña.
   * Finaliza el proceso de recuperación de contraseña.
   */
  recoveryPassword3(email,password) {
    console.log("Dentro de autenticationService.recoveryPassword 3");
    console.log("valor de password: " + password);
    console.log("valor de email: " + email)
    return this.http.post<any>(apiUrl + '/recoveryPass3', { email, password },{ observe: "response", withCredentials: true,});
  }



}
