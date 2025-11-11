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
