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
    if (this.cookieService.get('tokensiR')) {
      this.cuki = this.cookieService.get('tokensiR');
      if (this.cuki == 'admin') {
        console.log('existe tokensiR == admin');
        return true;
      }
    }
    console.log('no existe tokensiR == admin');
    this.router.navigate(['login']);
    return false;

  }

}
