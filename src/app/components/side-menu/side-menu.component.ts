import { Component, OnInit, ChangeDetectorRef, ViewChild, AfterContentChecked, AfterContentInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Plugins } from "@capacitor/core";

import { homeRoute, PageRoute, nonAuthRoutes, IAppPages, 
  paymentsRoute, teachersRoute, studentsRoute, classesRoute, 
  coursesRoute, settingsRoute, loginRoute, termsRoute, notificationsRoute, dashBoardRoute } from 'src/app/models/app-routes';
import { CustomRouteService } from 'src/app/services/custom-route.service';
import { AlertController, Platform } from '@ionic/angular';
import { AuthService, ADMINCREDENTIALS_KEY, ADMINID_KEY } from 'src/app/services/auth.service';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { isDefaultImage } from 'src/app/models/card-models';
import { asyncTimeOut } from 'src/app/models/storage-model';

const { Storage } = Plugins;

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  
  public appPages: IAppPages[] = [
    // {
    //   title: 'Home',
    //   url: homeRoute,
    //   pageRoute: PageRoute.Home,
    //   icon: 'home',
    //   handler: () => {
    //     this.navigate(PageRoute.Home);
    //   }
    // },
    {
      title: 'Dashboard',
      url: dashBoardRoute,
      pageRoute: PageRoute.Dashboard,
      icon: 'apps',
      handler: () => {
        this.navigate(PageRoute.Dashboard);
      }
    },
    {
      title: 'Teachers',
      url: teachersRoute,
      icon: 'man',
      pageRoute: PageRoute.Teachers,
      handler: () => {
        this.navigate(PageRoute.Teachers);
      }
    },
    {
      title: 'Students',
      url: studentsRoute,
      icon: 'people',
      pageRoute: PageRoute.Students,
      handler: () => {
        this.navigate(PageRoute.Students);
      }
    },
    {
      title: 'Classes',
      url: classesRoute,
      icon: 'business',
      pageRoute: PageRoute.Classes,
      handler: () => {
        this.navigate(PageRoute.Classes);
      }
    },
    {
      title: 'Courses',
      url: coursesRoute,
      icon: 'library',
      pageRoute: PageRoute.Courses,
      handler: () => {
        this.navigate(PageRoute.Courses);
      }
    },
    {
      title: 'Payments',
      url: paymentsRoute,
      icon: 'cash',
      pageRoute: PageRoute.Payments,
      handler: () => {
        this.navigate(PageRoute.Payments);
      }
    },
    {
      title: 'Terms',
      url: termsRoute,
      icon: 'calendar',
      pageRoute: PageRoute.Terms,
      handler: () => {
        this.navigate(PageRoute.Terms);
      }
    },
    {
      title: 'Notifications',
      url: notificationsRoute,
      icon: 'notifications',
      pageRoute: PageRoute.Notifications,
      handler: () => {
        this.navigate(PageRoute.Notifications);
      }
    },
    {
      title: 'Settings',
      url: settingsRoute,
      icon: 'settings',
      pageRoute: PageRoute.Settings,
      handler: () => {
        this.navigate(PageRoute.Settings);
      }
    },
    {
      title: 'Log Out',
      url: loginRoute,
      icon: 'log-out',
      pageRoute: PageRoute.Login,
      handler: async () => {
        const alert = await this.alertCtrl.create({
          header: "Notice",
          message: "Log Out?",
          buttons: [
            {
              text: "Ok",
              handler: async () => {
                await this.authService.logout();
              },
            },
            {
              text: "Cancel",
              role: "cancel"
            }
          ]
        });
    
        return await alert.present();
      }
    },
  ];

  // public PageUrl: string = '';
  public PageTitle: string = '';
  @ViewChild('snav', { static: true }) sideNav: MatSidenav;
  public menuDisabled: boolean = true;
  public closeMenu: boolean = false;
  public hasImage: boolean = false;
  public activeTerm: string;
  public username: string;
  public pageHeader: string = "";
  public hasTerm: boolean = false;
  public hasUsername: boolean = false;

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;
  private _pageUrl: string;

  get pageUrl() {
    return this._pageUrl;
  }

  set pageUrl(value) {
    if(this._pageUrl == "login" && value == "home" && !this.mobileQuery.matches) {
      this.sideNav.open();
    }
    this._pageUrl = value;
  }

  constructor(
    private router: Router,
    private alertCtrl: AlertController,
    public customRoute: CustomRouteService,
    public authService: AuthService,
    private termService: ClassCourseService,
    private platform: Platform,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.router.events.subscribe((val: NavigationEnd) => {
      if(!(val instanceof NavigationEnd)) return;

      this.pageUrl = val.urlAfterRedirects.replace('/', '');
      const page = this.appPages.find(page => page.url == this.pageUrl);
      if(page?.title)
        this.PageTitle = page.title;
      this.checkSideMenu();
    });

    this.setBackBtnPriority(platform);
  }

  ngOnInit() {
    asyncTimeOut(3000)
    .then(() => {
      if(!this.mobileQuery.matches && !this.menuDisabled){
        this.sideNav.open();
      }
    });

    this.getSettings();
  }

  getSettings() {
    this.authService.getSettings()
    .subscribe(res => {
      this.pageHeader = res?.name;
    })
  }

  get imgSrc() {
    return this.authService.dpUrlSubject.getValue();
  }

  async menuOpened() {
    await this.getActiveTerm();
    this.getAdmin();
  }

  async getAdmin() {
    if(this.hasUsername) return;

    const credentialString = await Storage.get({ key: ADMINCREDENTIALS_KEY });
    const credentials = JSON.parse(credentialString.value) as any;
    this.username = credentials?.username;
    this.authService.adminDpUrlSubject.next(credentials?.dpUrl);

    if(credentials?.username && credentials?.dpUrl) return;

    const { value } = await Storage.get({ key: ADMINID_KEY });
    if(!value) return;
    this.authService.viewAdmin({
      updateType: "2",
      pageSize: "10",
      pageNum: "1",
      adminid: value
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        this.username = response.username;
        this.hasUsername = true;
        this.authService.dpUrlSubject.next(response.dpUrl);
        Storage.set({ key: ADMINCREDENTIALS_KEY, value: JSON.stringify(response) });
      }
    }, err => { });
  }

  async getActiveTerm() {
    if(this.hasTerm) return;
    this.termService.viewTerm({
      updateType: "3",
      pageSize: "10",
      pageNum: "1",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        this.activeTerm = `${response.term}${this.getPosition(response.term)} term ${response.schoolYear}`;
        this.hasTerm = true;
      }
    }, err => { });
  }

  navigate(pageRoute: PageRoute) {
    const page = this.appPages.find(page => page.pageRoute == pageRoute);
    const route = page.url;
    this.PageTitle = page.title;
    this.closeOnClick();

    this.router.navigateByUrl(route, { replaceUrl: true });
  }

  checkSideMenu() {
    this.menuDisabled = !nonAuthRoutes.some(route => route == this.pageUrl);
    this.closeMenu = this.menuDisabled;
    if(!nonAuthRoutes.some(route => route == this.pageUrl)) {
      this.sideNav.close();
      this.hasUsername = false;
      this.hasImage = false;
      this.hasTerm = false;
      this.activeTerm = '';
      this.username = '';
    }
  }

  imgErr() {
    this.hasImage = false;
  } 

  imgLoaded() {
    this.hasImage = true;
    if(isDefaultImage(this.imgSrc)){
      this.hasImage = false;
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  
  getPosition(value: number): string {
    if(value % 100 > 10 && value % 100 < 20) {
      return 'th';
    }
    else if(value % 10 == 1) {
      return 'st';
    }
    else if(value % 10 == 2) {
      return 'nd';
    }
    else if(value % 10 == 3) {
      return 'rd';
    }
    else if(!value){
      return '';
    }
    else {
      return 'th';
    }
  }

  closeOnClick() {
    if(this.mobileQuery.matches) {
      this.sideNav.close();
    }
  }

  setBackBtnPriority(platform: Platform) {
    platform.backButton.subscribeWithPriority(99, () => {
      this.sideNav.close();
    });
  }

}
