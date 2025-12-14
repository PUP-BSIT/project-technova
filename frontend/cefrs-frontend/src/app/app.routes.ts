import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { LoginComponent } from './components/student/login/login';
import { OrgLoginComponent } from './components/organization/org-login/org-login';
import { AdminLogin } from './components/admin/admin-login/admin-login';
import { RegisterComponent } from './components/student/register/register';
import { AdminRegister } from './components/admin/admin-register/admin-register';
import { OrgRegisterComponent } from './components/organization/org-register/org-register';
import { StudentDashboard } from './components/student/dashboard/student-dashboard';
import { OrgDashboardComponent } from './components/organization/org-dashboard/org-dashboard';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { AuthGuard } from './guards/auth-guard';
import { LoginRedirectGuard } from './guards/login-redirect-guard'; // ← ADD THIS IMPORT
import { AdminProfileComponent } from './components/admin/admin-profile/admin-profile';
import { AdminChangePasswordComponent } from './components/admin/admin-change-password/admin-change-password';
import { CalendarView } from './components/admin/admin-dashboard/calendar/calendar-view/calendar-view';

import { StudentProfileComponent } from './components/student/profile/profile';
import { OrgProfileComponent } from './components/organization/org-profile/org-profile';
import { StudentChangePasswordComponent } from './components/student/student-change-password/student-change-password';
import { OrgChangePasswordComponent } from './components/organization/org-change-password/org-change-password';
// Student components
import { MyReservationsComponent } from './components/student/my-reservations/my-reservations';
import { MyBorrowingsComponent } from './components/student/my-borrowings/my-borrowings';
import { ReservationRequestComponent } from './components/student/reservation-request/reservation-request';
import { EquipmentBorrowingRequestComponent } from './components/student/equipment-borrowing-request/equipment-borrowing-request';
// Organization components
import { OrgMyReservationsComponent } from './components/organization/org-my-reservations/org-my-reservations';
import { OrgMyBorrowingsComponent } from './components/organization/org-my-borrowings/org-my-borrowings';
import { OrgReservationRequestComponent } from './components/organization/org-reservation-request/org-reservation-request';
import { OrgEquipmentBorrowingRequestComponent } from './components/organization/org-equipment-borrowing-request/org-equipment-borrowing-request';
import { ResetPassword } from './components/admin/reset-password/reset-password';
import { RoleSelectionComponent } from './components/role-selection/role-selection';
import { ForgotPassword } from './components/forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'select-role', component: RoleSelectionComponent, canActivate: [LoginRedirectGuard] },

  // Login Routes - Add LoginRedirectGuard to prevent logged-in users from accessing
  { path: 'login', component: LoginComponent, canActivate: [LoginRedirectGuard] },
  { path: 'org-login', component: OrgLoginComponent, canActivate: [LoginRedirectGuard] },
  { path: 'admin-login', component: AdminLogin, canActivate: [LoginRedirectGuard] },

  // Register Routes - Add LoginRedirectGuard to prevent logged-in users from accessing
  { path: 'register', component: RegisterComponent, canActivate: [LoginRedirectGuard] },
  { path: 'org-register', component: OrgRegisterComponent, canActivate: [LoginRedirectGuard] },
  { path: 'admin-register', component: AdminRegister, canActivate: [LoginRedirectGuard] },

  // Password Reset Routes - Keep these accessible to both logged-in and logged-out users
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },

  // Admin Dashboard (Protected)
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [AuthGuard],
    children: [
      { path: 'calendar', component: CalendarView },
      { path: 'settings/profile', component: AdminProfileComponent },
      { path: 'settings/change-password', component: AdminChangePasswordComponent }
    ]
  },

  // Organization Dashboard (Protected)
  {
    path: 'org-dashboard',
    component: OrgDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'settings/profile', component: OrgProfileComponent },
      { path: 'settings/change-password', component: OrgChangePasswordComponent }
    ]
  },

  // Legacy direct profile route (optional)
  {
    path: 'org-profile',
    component: OrgProfileComponent,
    canActivate: [AuthGuard]
  },

  // Student Dashboard (Protected)
  {
    path: 'student-dashboard',
    component: StudentDashboard,
    canActivate: [AuthGuard],
    children: [
      { path: 'settings/profile', component: StudentProfileComponent },
      { path: 'settings/change-password', component: StudentChangePasswordComponent }
    ]
  },

  { path: 'profile', component: StudentProfileComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: StudentChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'student-change-password', component: StudentChangePasswordComponent },
  // Legacy direct change-password route for org (optional)
  { path: 'org-change-password', component: OrgChangePasswordComponent, canActivate: [AuthGuard] },

  // Student Reservation Routes (Protected)
  { path: 'student/reservation-request', component: ReservationRequestComponent, canActivate: [AuthGuard] },
  { path: 'student/my-reservations', component: MyReservationsComponent, canActivate: [AuthGuard] },
  { path: 'my-reservations', component: MyReservationsComponent, canActivate: [AuthGuard] }, // Legacy route for backward compatibility

  // Student Equipment Borrowing Routes (Protected)
  { path: 'student/equipment-borrowing-request', component: EquipmentBorrowingRequestComponent, canActivate: [AuthGuard] },
  { path: 'student/my-borrowings', component: MyBorrowingsComponent, canActivate: [AuthGuard] },
  { path: 'my-borrowings', component: MyBorrowingsComponent, canActivate: [AuthGuard] }, // Legacy route for backward compatibility

  // Organization Reservation Routes (Protected)
  { path: 'org/reservation-request', component: OrgReservationRequestComponent, canActivate: [AuthGuard] },
  { path: 'org/my-reservations', component: OrgMyReservationsComponent, canActivate: [AuthGuard] },

  // Organization Equipment Borrowing Routes (Protected)
  { path: 'org/equipment-borrowing-request', component: OrgEquipmentBorrowingRequestComponent, canActivate: [AuthGuard] },
  { path: 'org/my-borrowings', component: OrgMyBorrowingsComponent, canActivate: [AuthGuard] },
];