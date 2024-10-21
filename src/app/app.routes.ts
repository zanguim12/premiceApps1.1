import { authorizationGuard } from './guards/authorization.guard';
import { Routes } from '@angular/router';
import { ProfilsComponent } from './profils/profils/profils.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register/register.component';
import { CustomerComponent } from './customers/customers.component';
import { AccountsComponent } from './accounts/accounts.component';
import { CustomerAccountsComponent } from './customer-accounts/customer-accounts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewcustomersComponent } from './newcustomers/newcustomers.component';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { TemplateComponent } from './template/template.component';
import { HomeComponent } from './home/home.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { AuthenticationGuard } from './guards/authentication.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'not-authorized', component: NotAuthorizedComponent },
  {
    path: 'admin',
    component: TemplateComponent,
    canActivate: [AuthenticationGuard, authorizationGuard],
    children: [
      { path: 'accounts', component: AccountsComponent },
      { path: 'account/:id', component: AccountsComponent },
      { path: 'accountsList', component: CustomerAccountsComponent },
      { path: 'profile', component: ProfilsComponent },
      { path: 'dashboard', component: DashboardComponent },
      // { path: 'customers', component: CustomerAccountsComponent },
      { path: 'customers', component: CustomerComponent },
      { path: 'new-customer', component: NewcustomersComponent },
      { path: 'edit-customer/:id', component: EditCustomerComponent },
      { path: 'home', component: HomeComponent },
    ]
  },
  {
    path: 'user',
    component: TemplateComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfilsComponent },
    ]
  },
];
