import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  cuki;
  constructor(private cookieService: CookieService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.cookieService.get('cuki')) {
      this.cuki = JSON.parse(this.cookieService.get('cuki'));
      if (this.cuki.rol == 'admin') {
        console.log('existe this.cuki.rol == admin');
        return true;
      }
    }
    console.log('no existe this.cuki.rol == admin');
    this.router.navigate(['login']);
    return false;

  }

}
