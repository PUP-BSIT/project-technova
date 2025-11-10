import { Routes } from '@angular/router';
import { RoleSelectionComponent } from './components/role-selection/role-selection';
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
import { AdminProfileComponent } from './components/admin/admin-profile/admin-profile';
import { AdminChangePasswordComponent } from './components/admin/admin-change-password/admin-change-password';
import { CalendarView } from './components/admin/admin-dashboard/calendar/calendar-view/calendar-view';

import { StudentProfileComponent } from './components/student/profile/profile';
import { OrgProfileComponent } from './components/organization/org-profile/org-profile';
import { StudentChangePasswordComponent } from './components/student/student-change-password/student-change-password';
import { OrgChangePasswordComponent } from './components/organization/org-change-password/org-change-password';
// Removed: legacy pages replaced by modal flows
// import { ReservationRequestComponent } from './components/reservation-request/reservation-request';
// import { EquipmentBorrowingRequestComponent } from './components/equipment-borrowing-request/equipment-borrowing-request';
import { MyReservationsComponent } from './components/my-reservations/my-reservations';
import { MyBorrowingsComponent } from './components/my-borrowings/my-borrowings';
// Removed: admin approval pages replaced by modal flows in Manage Request
// import { ReservationApprovalComponent } from './components/admin/reservation-approval/reservation-approval';
// import { EquipmentApprovalComponent } from './components/admin/equipment-approval/equipment-approval';

export const routes: Routes = [
  { path: '', component: RoleSelectionComponent },
  { path: 'role-selection', redirectTo: '', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'org-login', component: OrgLoginComponent },
  { path: 'admin-login', component: AdminLogin },
  { path: 'register', component: RegisterComponent },
  { path: 'org-register', component: OrgRegisterComponent },
  { path: 'admin-register', component: AdminRegister },

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
    canActivate: [AuthGuard]
  },

  // Organization Profile (Protected)
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
  { path: 'org-change-password', component: OrgChangePasswordComponent, canActivate: [AuthGuard] },

  // Reservation Routes (Protected) – request page replaced by modal in dashboard
  // { path: 'reservation-request', component: ReservationRequestComponent, canActivate: [AuthGuard] },
  { path: 'my-reservations', component: MyReservationsComponent, canActivate: [AuthGuard] },

  // Equipment Borrowing Routes (Protected) – request page replaced by modal in dashboard
  // { path: 'equipment-borrowing-request', component: EquipmentBorrowingRequestComponent, canActivate: [AuthGuard] },
  { path: 'my-borrowings', component: MyBorrowingsComponent, canActivate: [AuthGuard] },
];
