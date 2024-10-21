import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Customer } from '../services/customer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-edit-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss']  // Fix the property name from styleUrl to styleUrls
})
export class EditCustomerComponent implements OnInit {

  editCustomerFormGroup: FormGroup;
  customer!: Customer;
  customerId!: number;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.editCustomerFormGroup = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const customerId = +this.route.snapshot.params['id'];
    if (customerId) {
      this.customerService.getCustomer(customerId).subscribe({
        next: (customerData) => {
          this.customer = customerData;
          this.editCustomerFormGroup.patchValue({
            name: this.customer.name,
            email: this.customer.email
          });
        },
        error: (err) => {
          console.error('Failed to get customer:', err);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to load customer data.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          this.router.navigate(['/admin/customers']);
        }
      });
    } else {
      console.error('Invalid customer ID');
      this.router.navigate(['/admin/customers']);
    }
  }

  handleUpdateCustomer(): void {
    if (this.editCustomerFormGroup.valid) {
      const updatedCustomer = { ...this.customer, ...this.editCustomerFormGroup.value };
      this.customerService.updateCustomer(this.customerId, updatedCustomer).subscribe({
        next: () => {
          Swal.fire({
            title: 'Success!',
            text: 'Customer updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.router.navigate(['/admin/customers']);
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update customer.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Warning!',
        text: 'Please fill out the form correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  cancelEdit(): void {
    this.router.navigate(['/admin/customers']);
  }
}
