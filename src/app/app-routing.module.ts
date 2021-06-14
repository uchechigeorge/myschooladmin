import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { homeRoute, teachersRoute, classesRoute, coursesRoute, studentsRoute, paymentsRoute, settingsRoute, loginRoute, notificationsRoute, termsRoute, addStudentRoute, dashBoardRoute } from './models/app-routes';
import { AuthGuard } from './guards/auth.guard';
import { AutoLoginGuard } from './guards/auto-login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: dashBoardRoute,
    pathMatch: 'full'
  },
  {
    path: addStudentRoute,
    loadChildren: () => import('./pages/add-student/add-student.module').then( m => m.AddStudentPageModule),
  },
  // {
  //   path: homeRoute,
  //   loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
  //   canLoad: [AuthGuard],
  // },
  {
    path: dashBoardRoute,
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: teachersRoute,
    loadChildren: () => import('./pages/teachers/teachers.module').then( m => m.TeachersPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: classesRoute,
    loadChildren: () => import('./pages/classes/classes.module').then( m => m.ClassesPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: coursesRoute,
    loadChildren: () => import('./pages/courses/courses.module').then( m => m.CoursesPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: studentsRoute,
    loadChildren: () => import('./pages/students/students.module').then( m => m.StudentsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: paymentsRoute,
    loadChildren: () => import('./pages/payments/payments.module').then( m => m.PaymentsPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: settingsRoute,
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: notificationsRoute,
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: termsRoute,
    loadChildren: () => import('./pages/terms/terms.module').then( m => m.TermsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: loginRoute,
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    canLoad: [AutoLoginGuard]
  },
  
  {
    path: '**',
    redirectTo: dashBoardRoute,
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
