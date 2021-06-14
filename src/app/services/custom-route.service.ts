import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { PageRoute, homeRoute, settingsRoute, teachersRoute, coursesRoute, classesRoute, paymentsRoute, loginRoute, studentsRoute, termsRoute, notificationsRoute, addStudentRoute, dashBoardRoute } from '../models/app-routes';

@Injectable({
  providedIn: 'root'
})
export class CustomRouteService {

  public PageRoute: PageRoute;

  public PageUrl: string;

  constructor(
    private router: Router,
  ) {
    this.router.events.subscribe((val: NavigationEnd) => {
      if(!(val instanceof NavigationEnd)) return;

      this.PageUrl = this.router.url;
      this.PageRoute = this.convertStringToPageType(this.PageUrl);
    });
  }
  
  async getRoute() {
    return this.PageUrl;
  }

  convertStringToPageType(route: string): PageRoute {
    route = route.replace('/', '');
    
    switch(route) {
      case '':
        return PageRoute.Dashboard;
      // case homeRoute:
      //   return PageRoute.Home;
      case dashBoardRoute:
        return PageRoute.Dashboard;
      case settingsRoute:
        return PageRoute.Settings;
      case teachersRoute:
        return PageRoute.Teachers;
      case studentsRoute:
        return PageRoute.Students;
      case coursesRoute:
        return PageRoute.Courses;
      case classesRoute:
        return PageRoute.Classes;
      case paymentsRoute:
        return PageRoute.Payments;
      case termsRoute:
        return PageRoute.Terms;
      case notificationsRoute:
        return PageRoute.Notifications;
      case addStudentRoute:
        return PageRoute.AddStudent;
      case loginRoute:
        return PageRoute.Login;
      default:
        return PageRoute.None;
    }
  }

}