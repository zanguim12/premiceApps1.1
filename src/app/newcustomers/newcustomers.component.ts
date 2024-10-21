import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Customer, CustomerService } from '../services/customer.service';
import { Router } from '@angular/router'; // Fixed import for Router
import Swal from "sweetalert2";
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-newcustomers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe
  ],
  templateUrl: './newcustomers.component.html',
  styleUrls: ['./newcustomers.component.scss'] // Fixed property name
})
export class NewcustomersComponent implements OnInit { // Implement OnInit interface
  newCustomerFormGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.newCustomerFormGroup = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  handleSaveCustomer() {
    const customer: Customer = this.newCustomerFormGroup.value;
    this.customerService.saveCustomer(customer).subscribe({
      next: (data) => {
        // Alert
        Swal.fire({
          title: 'Success!',
          text: 'Customer saved successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigateByUrl('/customers'); // Navigate after alert is confirmed
        });
      },
      error: (error) => {
        console.error('Error saving customer:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to save customer.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
