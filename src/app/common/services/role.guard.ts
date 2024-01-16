// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const expectedRole = route.data['role'];  
    return this.authService.hasRole(expectedRole).pipe(
      map(hasRole => {
        if (hasRole) {
          return true;
        } else {
          this.router.navigate(['/user-profile']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/user-profile']);
        return of(false);
      })
    );
  }
  
}
