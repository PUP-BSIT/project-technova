import { Routes } from '@angular/router';
import { RoleSelectionComponent } from './components/role-selection/role-selection';
import { LoginComponent } from './components/login/login';
import { OrgLoginComponent } from './components/org-login/org-login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: RoleSelectionComponent },
    { path: 'login', component: LoginComponent },
    { path: 'org-login', component: OrgLoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent }
];