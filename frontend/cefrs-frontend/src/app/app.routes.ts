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
  { path: '', component: LandingComponent, data: { title: 'Home' } },
  { path: 'select-role', component: RoleSelectionComponent, canActivate: [LoginRedirectGuard], data: { title: 'Select Role' } },

  // Login Routes - Add LoginRedirectGuard to prevent logged-in users from accessing
  { path: 'login', component: LoginComponent, canActivate: [LoginRedirectGuard], data: { title: 'Student Login' } },
  { path: 'org-login', component: OrgLoginComponent, canActivate: [LoginRedirectGuard], data: { title: 'Organization Login' } },
  { path: 'admin-login', component: AdminLogin, canActivate: [LoginRedirectGuard], data: { title: 'Admin Login' } },

  // Register Routes - Add LoginRedirectGuard to prevent logged-in users from accessing
  { path: 'register', component: RegisterComponent, canActivate: [LoginRedirectGuard], data: { title: 'Student Registration' } },
  { path: 'org-register', component: OrgRegisterComponent, canActivate: [LoginRedirectGuard], data: { title: 'Organization Registration' } },
  { path: 'admin-register', component: AdminRegister, canActivate: [LoginRedirectGuard], data: { title: 'Admin Registration' } },

  // Password Reset Routes - Keep these accessible to both logged-in and logged-out users
  { path: 'forgot-password', component: ForgotPassword, data: { title: 'Forgot Password' } },
  { path: 'reset-password', component: ResetPassword, data: { title: 'Reset Password' } },

  // Admin Dashboard (Protected)
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [AuthGuard],
    data: { title: 'Admin Dashboard' },
    children: [
      { path: 'calendar', component: CalendarView, data: { title: 'Admin Calendar' } },
      { path: 'settings/profile', component: AdminProfileComponent, data: { title: 'Admin Profile' } },
      { path: 'settings/change-password', component: AdminChangePasswordComponent, data: { title: 'Admin Change Password' } }
    ]
  },

  // Organization Dashboard (Protected)
  {
    path: 'org-dashboard',
    component: OrgDashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Organization Dashboard' },
    children: [
      { path: 'settings/profile', component: OrgProfileComponent, data: { title: 'Organization Profile' } },
      { path: 'settings/change-password', component: OrgChangePasswordComponent, data: { title: 'Organization Change Password' } }
    ]
  },

  // Legacy direct profile route (optional)
  {
    path: 'org-profile',
    component: OrgProfileComponent,
    canActivate: [AuthGuard],
    data: { title: 'Organization Profile' }
  },

  // Student Dashboard (Protected)
  {
    path: 'student-dashboard',
    component: StudentDashboard,
    canActivate: [AuthGuard],
    data: { title: 'Student Dashboard' },
    children: [
      { path: 'settings/profile', component: StudentProfileComponent, data: { title: 'Student Profile' } },
      { path: 'settings/change-password', component: StudentChangePasswordComponent, data: { title: 'Student Change Password' } }
    ]
  },

  { path: 'profile', component: StudentProfileComponent, canActivate: [AuthGuard], data: { title: 'Student Profile' } },
  { path: 'change-password', component: StudentChangePasswordComponent, canActivate: [AuthGuard], data: { title: 'Student Change Password' } },
  { path: 'student-change-password', component: StudentChangePasswordComponent, data: { title: 'Student Change Password' } },
  // Legacy direct change-password route for org (optional)
  { path: 'org-change-password', component: OrgChangePasswordComponent, canActivate: [AuthGuard], data: { title: 'Organization Change Password' } },

  // Student Reservation Routes (Protected)
  { path: 'student/reservation-request', component: ReservationRequestComponent, canActivate: [AuthGuard], data: { title: 'Student Reservation Request' } },
  { path: 'student/my-reservations', component: MyReservationsComponent, canActivate: [AuthGuard], data: { title: 'Student My Reservations' } },
  { path: 'my-reservations', component: MyReservationsComponent, canActivate: [AuthGuard], data: { title: 'Student My Reservations' } }, // Legacy route for backward compatibility

  // Student Equipment Borrowing Routes (Protected)
  { path: 'student/equipment-borrowing-request', component: EquipmentBorrowingRequestComponent, canActivate: [AuthGuard], data: { title: 'Student Equipment Borrowing Request' } },
  { path: 'student/my-borrowings', component: MyBorrowingsComponent, canActivate: [AuthGuard], data: { title: 'Student My Borrowings' } },
  { path: 'my-borrowings', component: MyBorrowingsComponent, canActivate: [AuthGuard], data: { title: 'Student My Borrowings' } }, // Legacy route for backward compatibility

  // Organization Reservation Routes (Protected)
  { path: 'org/reservation-request', component: OrgReservationRequestComponent, canActivate: [AuthGuard], data: { title: 'Organization Reservation Request' } },
  { path: 'org/my-reservations', component: OrgMyReservationsComponent, canActivate: [AuthGuard], data: { title: 'Organization My Reservations' } },

  // Organization Equipment Borrowing Routes (Protected)
  { path: 'org/equipment-borrowing-request', component: OrgEquipmentBorrowingRequestComponent, canActivate: [AuthGuard], data: { title: 'Organization Equipment Borrowing Request' } },
  { path: 'org/my-borrowings', component: OrgMyBorrowingsComponent, canActivate: [AuthGuard], data: { title: 'Organization My Borrowings' } },
];