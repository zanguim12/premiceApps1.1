import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:3000/customers'; // URL de l'API des clients

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Récupérer tous les clients
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer un client par son ID
  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Créer un nouveau client
  createCustomer(customer: Omit<Customer, 'id'>): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Mettre à jour un client existant
  updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Supprimer un client par son ID
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Rechercher des clients par requête
  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/search?query=${query}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Sauvegarder un client
  public saveCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Obtenir les en-têtes d'autorisation
  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
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
