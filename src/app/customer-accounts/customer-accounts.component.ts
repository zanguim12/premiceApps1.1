import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { Customer } from '../services/customer.service';
import { Account } from '../model/account.model';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { Router } from 'express';
import { AccountsService } from '../services/accounts.service';

@Component({
  selector: 'app-customer-accounts',
  standalone: true,
  imports: [
    MatTable,
    MatCellDef,
    MatHeaderCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatPaginator,
    MatRowDef,
    MatRow,
    MatHeaderRowDef
  ],
  templateUrl: './customer-accounts.component.html',
  styleUrl: './customer-accounts.component.scss'
})
export class CustomerAccountsComponent {

  customerId! : string ;
  customer! : Customer;
  accounts: any
  displayedColumns: string[] = ['id','customer','type', 'creationDate', 'status', 'balance'];
  dataSource!: MatTableDataSource<Account>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private route : ActivatedRoute, private router :Router, private accountsService: AccountsService) {
  }

  ngOnInit(): void {
    this.accountsService.getAccounts().subscribe({
      next: data => {
        this.accounts = data;
        this.dataSource = new MatTableDataSource<Account>(this.accounts);
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: error => {
        console.log(error);
      }
    });

  }

}
