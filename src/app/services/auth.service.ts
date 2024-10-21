import { jwtDecode } from 'jwt-decode';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  isAuth: boolean = false;
  roles: any;
  username: any;
  accessToken!: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Enregistrer un utilisateur
  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user).pipe(
      catchError(this.handleError)
    );
  }

  // Vérifier si l'utilisateur est administrateur
  isAdmin(): boolean {
    return this.roles && this.roles.includes('ADMIN');
  }

  // Authentifier l'utilisateur
  login(username: string, password: string): Observable<any> {
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
    let params = new HttpParams().set('username', username).set('password', password);
    return this.http.post(`${this.apiUrl}/auth/login`, params, options).pipe(
      tap(response => this.loadProfile(response)),
      catchError(this.handleError)
    );
  }

  // Charger le profil de l'utilisateur à partir du token
  loadProfile(data: any) {
    this.isAuth = true;
    this.accessToken = data['access_token'];
    let decodedJwt: any = jwtDecode(this.accessToken);
    this.username = decodedJwt.sub;
    this.roles = decodedJwt.scope;
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem("jwt-token", this.accessToken);
    }
  }

  // Déconnexion de l'utilisateur
  logout() {
    this.isAuth = false;
    this.accessToken = undefined;
    this.username = undefined;
    this.roles = undefined;
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.removeItem("jwt-token");
    }
    this.router.navigate(['/login']); // Rediriger vers la page de connexion
  }

  // Charger le token JWT depuis le stockage local
  loadJwtTokenFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const token = window.localStorage.getItem("jwt-token");
      if (token) {
        this.loadProfile({ access_token: token });
        if (this.isAdmin()) {
          this.router.navigate(['/admin/home']);
        } else {
          this.router.navigate(['/user/home']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  // Authentification avec les identifiants de l'utilisateur
  loginWithCredentials(credentials: { email: string; password: string }): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${credentials.email}&password=${credentials.password}`).pipe(
      tap(users => {
        if (users.length > 0 && isPlatformBrowser(this.platformId)) {
          // Simuler le stockage du JWT
          window.localStorage.setItem('token', 'fake-jwt-token');
        } else {
          throw new Error('Identifiants invalides');
        }
      }),
      catchError(this.handleError)
    );
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return isPlatformBrowser(this.platformId) ? !!window.localStorage.getItem('jwt-token') : false;
  }

  // Obtenir le token
  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? window.localStorage.getItem('jwt-token') : null;
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur s\'est produite';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
