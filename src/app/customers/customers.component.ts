import { Component, OnInit, ViewChild } from '@angular/core';
import { Customer, CustomerService } from '../services/customer.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-customer',
  standalone: true,
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  imports: [
    CommonModule, FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule
  ]
})
export class CustomerComponent implements OnInit {
  customers: any[] = [];
  allCustomers: any[] = [];
  newCustomer: any = { name: '', email: '', phone: '' };
  editingCustomer: any = null;
  searchTerm: string = '';
  showNewCustomerForm: boolean = false;
  employeeSearchTerm: string = '';
  isModalOpen = false;
  errorMessage: string | null = null;
  displayedColumns: string[] = ['name', 'email', 'phone', 'actions'];
  dataSource = new MatTableDataSource<Customer>();




  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(private customerService: CustomerService, private router: Router) { }

  ngOnInit(): void {
    // this.loadCustomers();
    this.customerService.getCustomers()
      .subscribe({
        next: data => {
          this.customers = data;
          this.dataSource = new MatTableDataSource<Customer>(this.customers);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        },
        error: error => {
          this.errorMessage = error.message;
        }
      });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe(
      (data) => {
        this.customers = data;
        this.allCustomers = [...data]; // Storing all customers for filtering
      },
      (error) => {
        console.error('Erreur lors du chargement des clients', error);
      }
    );
  }

  toggleNewCustomerForm(): void {
    this.showNewCustomerForm = !this.showNewCustomerForm;
  }
  openModal() {
    this.isModalOpen = true;

  }

  closeModal() {
    this.isModalOpen = false;
    this.newCustomer = { name: '', email: '', phone: '' }; // Réinitialiser les champs
    this.editingCustomer = null;
  }

  openEditModal(customer: any): void {
    this.startEditing(customer);

  }


  createCustomer(): void {
    this.customerService.createCustomer(this.newCustomer).subscribe(
      (data) => {
        this.customers.push(data);
        this.newCustomer = { name: '', email: '', phone: '' }; // Reset the form after creation
      },
      (error) => {
        console.error('Erreur lors de la création du client', error);
      }
    );
  }

  startEditing(customer: any): void {
    this.editingCustomer = { ...customer };
  }

  updateCustomer(): void {
    if (this.editingCustomer) {
      this.customerService.updateCustomer(this.editingCustomer.id, this.editingCustomer).subscribe(
        (data) => {
          const index = this.customers.findIndex(c => c.id === data.id);
          if (index !== -1) {
            this.customers[index] = data;
          }
          this.editingCustomer = null; // Reset after editing
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du client', error);
        }
      );
    }
  }

  searchCustomers(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    const employeeSearchTermLower = this.employeeSearchTerm.toLowerCase();

    if (!this.searchTerm && !this.employeeSearchTerm) {
      this.customers = [...this.allCustomers];
      return;
    }

    this.customers = this.allCustomers.filter(customer =>
      (customer.name.toLowerCase().includes(searchTermLower) ||
       customer.email.toLowerCase().includes(searchTermLower) ||
       customer.phone.includes(searchTermLower)) &&
      (!this.employeeSearchTerm || (customer.employee?.toLowerCase().includes(employeeSearchTermLower)))
    );
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: Customer, filter: string) => data.name.toLowerCase().includes(filter) || data.email.toLowerCase().includes(filter);
  }
  handleDeleteCustomer(customer: Customer) {
    //alert
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this customer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'

    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.deleteCustomer(customer.id).subscribe({
          next: () => {
            this.customers = this.customers.filter((c: Customer) => c.id !== customer.id);
            this.dataSource.data = this.customers;
            Swal.fire(
              'Deleted!',
              'Customer deleted successfully.',
              'success'
            );
          },
          error: error => {
            console.error('Error deleting customer:', error);
            this.errorMessage = 'Failed to delete customer: ' + (error.message || 'Unknown error');
            //alert
            Swal.fire({
              title: 'Error!',
              text: this.errorMessage,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }


  handleUpdateCustomer(customer: Customer) {
    this.router.navigate(['/admin/edit-customer', customer.id]);  }

}
