import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ],
  templateUrl: './register.component.html',
  styleUrls: ['./registe.component.scss']
})
export class RegisterComponent {

  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      error => console.error('Registration error:', error)
    );
  }
}
