import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { Platform, isPlatform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar as StatusBarNative } from '@ionic-native/status-bar/ngx';
import { Plugins, StatusBarStyle } from "@capacitor/core";
import { themeKeyValue } from './models/storage-model';
import { Router } from '@angular/router';
import { CustomRouteService } from './services/custom-route.service';
import { PageRoute, homeRoute } from './models/app-routes';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { FcmService } from './services/fcm.service';
import { ADMINID_KEY, TOKEN_KEY, AuthService } from './services/auth.service';

const { App, StatusBar, Storage } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  
  public Theme: IThemeType = 'light';
  @ViewChild(MatDatepicker) datePicker: MatDatepicker<any>;
  @ViewChild(MatSelect) matSelect: MatSelect;
  @ViewChild(MatSidenav) matSideNav: MatSidenav;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBarNative,
    private router: Router,
    private customRoute: CustomRouteService,
    private authService: AuthService,
    private fcmService: FcmService
  ) {
    this.initializeApp();
    this.setBackBtnPriority();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    
    this.fcmService.initPush();
    this.checkThemeAsync();
  }

  ngOnInit() {
    // this.authService.getSettings()
    // .subscribe(res => {
    //   console.log(res);
    // })
  }

  ngAfterViewInit() {}

  async checkThemeAsync() {
    const { value } = await Storage.get({ key: themeKeyValue });
    if(value == 'null' || value == null) {
      this.Theme = "system-preference"
      await Storage.set({
        key: themeKeyValue,
        value: this.Theme,
      });
    }
    else{
      this.Theme = value as IThemeType;
    }
    this.toggleTheme();
  }

  toggleTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if(this.Theme == 'light') {
      this.setLight();
    }
    else if(this.Theme == 'dark') {
      this.setDark();
    }
    else if(this.Theme == 'system-preference') {
      if(prefersDark.matches) {
        this.setDark();
      }
      else {
        this.setLight();
      }
    }
  }

  setLight() {
    document.body.classList.remove('dark');
    if(!isPlatform('capacitor')) return;
    StatusBar.setBackgroundColor({
      color: '#673AB7',
    });
    StatusBar.setStyle({
      style: StatusBarStyle.Light,
    });

  }

  setDark() {
    document.querySelector('body').classList.add('dark');
    if(!isPlatform('capacitor')) return;
    StatusBar.setBackgroundColor({
      color: '#323233',
    });
    StatusBar.setStyle({
      style: StatusBarStyle.Dark,
    });
  }

  setBackBtnPriority() {
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if(this.customRoute.PageRoute == PageRoute.Home || this.customRoute.PageRoute == PageRoute.Login) {
        App.exitApp();
      }
      else{
        this.router.navigate([homeRoute]);
      }
    });
  }

  // async sessionLogin() {
  //   let adminIdStore = await Storage.get({ key: ADMINID_KEY });
  //   let adminTokenStore = await Storage.get({ key: TOKEN_KEY });

  //   if(!(adminIdStore ||  adminIdStore.value || adminTokenStore || adminTokenStore.value)) {
  //     this.authService.logout();
  //   }
    

  // }
}

type IThemeType = "light" | "dark" | "system-preference";
