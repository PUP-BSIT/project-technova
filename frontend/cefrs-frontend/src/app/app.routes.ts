import { Routes } from '@angular/router';
import { RoleSelectionComponent } from './components/role-selection/role-selection';
import { LoginComponent } from './components/login/login';
import { OrgLoginComponent } from './components/org-login/org-login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ProfileComponent } from './components/profile/profile';

// Import the student-specific components and the guard
import { StudentDashboard } from './components/dashboard/student-dashboard/student-dashboard';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', component: RoleSelectionComponent },
    { path: 'login', component: LoginComponent },
    { path: 'org-login', component: OrgLoginComponent },
    { path: 'register', component: RegisterComponent },

    // Protected Routes
    // This dashboard is for Admin/Organization roles.
    // The AuthGuard will check if the user is a STUDENT and redirect them to /student-dashboard.
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },

    // Student Dashboard: The destination for the Student role.
    {
        path: 'student-dashboard',
        component: StudentDashboard,
        canActivate: [AuthGuard] // Requires login
    },

    // Profile Page: Requires login.
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    }
];