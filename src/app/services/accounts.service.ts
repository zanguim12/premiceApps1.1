import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AccountDetails } from '../model/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private host: string = 'http://localhost:3000'; // URL de l'API

  constructor(private http: HttpClient) {}

  // Récupérer tous les comptes
  public getAccounts(): Observable<Array<AccountDetails>> {
    return this.http.get<Array<AccountDetails>>(`${this.host}/accounts`);
  }

  // Récupérer un compte par son ID
  public getAccountByID(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.host}/accounts/${accountId}`);
  }

  // Récupérer les opérations d'un compte avec pagination
  public getAccount(accountId: string, page: number, size: number): Observable<AccountDetails> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AccountDetails>(`${this.host}/accounts/${accountId}/pageOperations`, { params });
  }

  // Débiter un compte
  public debit(accountId: string, amount: number, description: string): Observable<any> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('desc', description);

    return this.http.post(`${this.host}/accounts/debit/${accountId}`, null, { params });
  }

  // Crédite un compte
  public credit(accountId: string, amount: number, description: string): Observable<any> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('desc', description);

    return this.http.post(`${this.host}/accounts/credit/${accountId}`, null, { params });
  }

  // Transférer de l'argent d'un compte à un autre
  public transfer(accountSource: string, accountDestination: string, amount: number): Observable<any> {
    const data = { accountSource, accountDestination, amount };
    return this.http.post(`${this.host}/accounts/transfer`, data);
  }
}
