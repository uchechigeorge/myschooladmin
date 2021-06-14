export const homeRoute = 'home';
export const teachersRoute = 'teachers';
export const classesRoute = 'classes';
export const coursesRoute = 'courses';
export const studentsRoute = 'students';
export const termsRoute = 'terms';
export const paymentsRoute = 'payments';
export const notificationsRoute = 'notifications';
export const settingsRoute = 'settings';
export const dashBoardRoute = 'dashboard';
export const addStudentRoute = 'add-student';
export const loginRoute = 'login';

export enum PageRoute{
  Home,
  Teachers,
  Courses,
  Students,
  Payments,
  Classes,
  Terms,
  Settings,
  Notifications,
  Login,
  Dashboard,
  AddStudent,
  None,
}

export interface IAppPages {
  title?: string;
  url?: string;
  icon?: string;
  pageRoute?: PageRoute;
  handler?: () => void;
}

export const authRoutes = [loginRoute];

export const nonAuthRoutes = [homeRoute, teachersRoute, classesRoute, coursesRoute, studentsRoute, paymentsRoute, termsRoute, notificationsRoute, settingsRoute, dashBoardRoute];