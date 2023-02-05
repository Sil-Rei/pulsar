import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { apiUrl } from 'src/environments/environments';
import { Router } from '@angular/router';
import { Subject, Observable, lastValueFrom } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient;
  public isSignedInEvent = new EventEmitter<boolean>();

  constructor(private handler:HttpBackend, private router: Router) {
    this.http = new HttpClient(handler)
    // execute it once to refresh it when the website is opened
    if(localStorage.getItem("refresh_token") != null){
      this.refreshToken();
    }
   }

  // observable for error messages
  private errorSubject = new Subject<string>();
  error$: Observable<string> = this.errorSubject.asObservable();

  login(data){
    return this.http.post(`${apiUrl}token/`, data).subscribe({
      next: response => {
        this.setSession(response);
        this.isSignedInEvent.emit(true);
      },
      error: error => {
        this.errorSubject.next(error);
      }
    })
  }

  getCaptchaToken() {
    return this.http.get(`${apiUrl}captcha_publickey`);
  }

  private tokenExpiresAt(token: string) {
    const expiry = (JSON.parse(window.atob(token.split('.')[1]))).exp;
    return expiry;
  }

  private setSession(result){
    const expiresAt = this.tokenExpiresAt(result.access);

    localStorage.setItem("access_token", result.access);
    localStorage.setItem("refresh_token", result.refresh);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
    const username = (JSON.parse(window.atob(result.access.split('.')[1]))).username;
    localStorage.setItem("username", username);
    // Reload to refresh navbar
    this.router.navigate(["/community/featured-portfolios"])
  }

  async refreshToken(): Promise<string> {
    let refresh_token = localStorage.getItem("refresh_token"); 
    const res$ = this.http
    .post(`${apiUrl}token/refresh/`, { refresh: refresh_token })
    .pipe(map((res) => res["access"]))
    .pipe(first());
    const res = await lastValueFrom(res$);

    const expiresAt = this.tokenExpiresAt(res);
    localStorage.setItem("access_token", res);
    this.isSignedInEvent.emit(true);
    localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
    console.log("Refreshed Access Token");
    return res;
  }

  logout(){
    localStorage.removeItem("expires_at");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    this.isSignedInEvent.emit(false);
    this.router.navigate([""])
  }

  public isLoggedIn(){
    const expiry: Number = +localStorage.getItem("expires_at");
    return (Math.floor((new Date).getTime() / 1000)) < expiry;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
}

  getExpiration(){
    const expiration = localStorage.getItem("expires_at");
    return expiration;
  }

  register(data){
    return this.http.post(`${apiUrl}user/register`, data);
  }
}
