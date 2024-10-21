import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profils',
  standalone: true,
  imports: [],
  templateUrl: './profils.component.html',
  styleUrl: './profils.component.scss'
})
export class ProfilsComponent {

  constructor(private authService: AuthService) {}

  ngOnInit() {
  }

  logout() {
    this.authService.logout();
  }

}
