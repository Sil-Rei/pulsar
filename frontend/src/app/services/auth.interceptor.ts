import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { from, Observable, mergeMap } from 'rxjs';
import { AuthService } from './auth-service.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService:AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let access_token = localStorage.getItem("access_token");
  
    if (access_token) {
      // Check if access token is no longer valid, if so, refresh it with the refresh token
      if (this.authService.isLoggedOut()) {
        return from(this.authService.refreshToken()).pipe(
          mergeMap((access_token) => {
            localStorage.setItem("access_token", access_token);
            const cloned = request.clone({
              headers: request.headers.set("Authorization", "Bearer " + access_token),
            });
            return next.handle(cloned);
          })
        );
      }
      const cloned = request.clone({
        headers: request.headers.set("Authorization", "Bearer " + access_token),
      });
      return next.handle(cloned);
    } else {
      return next.handle(request);
    }
  }
}
