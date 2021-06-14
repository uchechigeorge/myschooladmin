import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Plugins } from "@capacitor/core";
import { map, tap, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject, from, Subject } from 'rxjs';
import { loginRoute } from '../models/app-routes';
import { Router } from '@angular/router';

const { Storage } = Plugins;

export const LOCAL_HOST = "http://localhost:58003";
export const REMOTE_HOST = "https://testucheapi.profeworld.com";
export const API_HOST = REMOTE_HOST;

export const ADMINCREDENTIALS_KEY = "credentials";
export const ADMINID_KEY = "adminid";
export const TOKEN_KEY = "token";

const LOGIN_API_ROUTE = `${API_HOST}/api/admin/auth/login.ashx`;
const SESSIONSLOGIN_API_ROUTE = `${API_HOST}/api/admin/auth/sessionslogin.ashx`;
const VIEWADMIN_API_ROUTE = `${API_HOST}/api/admin/view/viewadmin.ashx`;
const UPDATEADMINPIC_API_ROUTE = `${API_HOST}/api/admin/auth/updateprofilepic.ashx`;
const ADDADMIN_API_ROUTE = `${API_HOST}/api/admin/add/addadmin.ashx`;
const CONFIRMPASSWORD_API_ROUTE = `${API_HOST}/api/admin/auth/confirmpassword.ashx`;
const UPDATEPASSWORD_API_ROUTE = `${API_HOST}/api/admin/auth/resetpassword.ashx`;
const UPDATEADMINNAME_API_ROUTE = `${API_HOST}/api/admin/update/admin/updateusername.ashx`;
const UPDATEADMINPASSWORD_API_ROUTE = `${API_HOST}/api/admin/update/admin/updatepassword.ashx`;
const UPDATEADMINROLES_API_ROUTE = `${API_HOST}/api/admin/update/admin/updateroles.ashx`;
const DELETEADMIN_API_ROUTE = `${API_HOST}/api/admin/delete/deleteadmin.ashx`;

const VIEWFBID_API_ROUTE = `${API_HOST}/api/admin/view/viewfbalert.ashx`;

const UPDATEEMAIL_API_ROUTE = `${API_HOST}/api/admin/auth/updateemail.ashx`;
const FORGOTPASSWORD_API_ROUTE = `${API_HOST}/api/admin/auth/forgotpassword.ashx`;

const ADDNOTIFICATION_API_ROUTE = `${API_HOST}/api/admin/add/addnotification.ashx`;
const DELETENOTIFICATION_API_ROUTE = `${API_HOST}/api/admin/delete/deletenotification.ashx`;
const VIEWNOTIFICATION_API_ROUTE = `${API_HOST}/api/admin/view/viewnotification.ashx`;
const UPDATENOTIFICATIONTITLE_API_ROUTE = `${API_HOST}/api/admin/update/notification/updatenotificationtitle.ashx`;
const UPDATENOTIFICATIONDESCRIPTION_API_ROUTE = `${API_HOST}/api/admin/update/notification/updatenotificationdescription.ashx`;
const UPDATENOTIFICATIONIMAGE_API_ROUTE = `${API_HOST}/api/admin/update/notification/updatenotificationimage.ashx`;

const UPDATENOTIFICATIONSTATE_API_ROUTE = `${API_HOST}/api/admin/auth/updatenotificationstate.ashx`;

const ADDFBID_API_ROUTE = `${API_HOST}/api/admin/add/addfbid.ashx`;


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  private requestToken: { adminid?: string, admintoken?: string } = {};
  public requestSubject: BehaviorSubject<{ adminid?: string, admintoken?: string }> = new BehaviorSubject<{ adminid: string, admintoken: string }>(null);
  public adminDpUrlSubject: Subject<string> = new Subject<string>();

  public dpUrlSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { 
    this.loadToken();
  }

  getAdminDp() {
    return this.adminDpUrlSubject.asObservable();
  }

  setDP(value: string) {
    this.adminDpUrlSubject.next(value);
  }

  getSettings(): Observable<any> {
    return this.http.get('./assets/settings.json');
  }

  async loadToken() {
    const tokenStore = await Storage.get({ key: TOKEN_KEY });
    const adminidStore = await Storage.get({ key: ADMINID_KEY });

    const token = JSON.parse(`"${tokenStore.value}"`);
    const adminid = JSON.parse(`"${adminidStore.value}"`);

    const tokenValid = token && token != "undefined" && token != "null";
    const adminIdValid = adminid && adminid != "undefined" && adminid != "null";
    
    if(tokenValid && adminIdValid) {
      this.isAuthenticated.next(true);
      this.requestSubject.next({
        adminid,
        admintoken: token
      });
    }
    else {
      this.isAuthenticated.next(false);
      
      // this.router.navigateByUrl(loginRoute, { replaceUrl: true });
    }
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    const httpBody = JSON.stringify(credentials);
    return this.http.post(LOGIN_API_ROUTE, httpBody);
  }
    
  confirmPassword(credentials: { password: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(CONFIRMPASSWORD_API_ROUTE, bodyString);
  }
  
  sessionsLogin(credentials: { adminId: string, adminToken: string }): Observable<any> {
    let body: any = {};
    body = {...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(SESSIONSLOGIN_API_ROUTE, bodyString);
  }

  addAdmin(credentials: { username: string, password: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDADMIN_API_ROUTE, bodyString);
  }

  updateAdminUsername(credentials: { adminpassword: string, admin: string, username: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEADMINNAME_API_ROUTE, bodyString);
  }
  
  updateAdminProfilePic(formData?: any): Observable<any> {
    let params: { [param: string]: string | string[]; } = {};
    
    params.adminid = this.requestSubject.getValue().adminid;
    params.token = this.requestSubject.getValue().admintoken;

    return this.http.post(UPDATEADMINPIC_API_ROUTE, formData, { params });
  }

  updateAdminPassword(credentials: { adminpassword: string, admin: string, password: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEADMINPASSWORD_API_ROUTE, bodyString);
  }

  updateRoles(credentials: { adminpassword: string, admin: string, roles: any }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEADMINROLES_API_ROUTE, bodyString);
  }

  deleteAdmin(credentials: { admin: string, adminpassword: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETEADMIN_API_ROUTE, bodyString);
  }

  updateEmail(credentials: { email?: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEEMAIL_API_ROUTE, bodyString);
  }

  addNotification(credentials: { userType: string, title: string, description?: string, type?: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDNOTIFICATION_API_ROUTE, bodyString);
  }
  
  updateNotificationTitle(credentials: { notificationId: string, title?: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATENOTIFICATIONTITLE_API_ROUTE, bodyString);
  }
  
  updateNotificationDescription(credentials: { notificationId: string, description?: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATENOTIFICATIONDESCRIPTION_API_ROUTE, bodyString);
  }
  
  updateNotificationImage(credentials: { notificationId: string, formData?: any }): Observable<any> {
    let params: { [param: string]: string | string[]; } = {};
    
    params.adminid = this.requestSubject.getValue().adminid;
    params.token = this.requestSubject.getValue().admintoken;
    params.notificationid = credentials.notificationId;

    return this.http.post(UPDATENOTIFICATIONIMAGE_API_ROUTE, credentials.formData, { params });
  }

  deleteNotification(credentials: { notificationId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETENOTIFICATION_API_ROUTE, bodyString);
  }

  updateNotificationState(credentials: { state: boolean }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATENOTIFICATIONSTATE_API_ROUTE, bodyString);
  }

  viewNotifications(reqParams: {
    updateType?: string,
    notificationId?: string,
    postId?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.notificationId) params.notificationid = reqParams.notificationId;
    if(reqParams.postId) params.postid = reqParams.postId;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWNOTIFICATION_API_ROUTE, bodyString, { params });
  }

  viewAdmin(reqParams: {
    updateType?: string,
    adminid?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.adminid) params.adminid = reqParams.adminid;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWADMIN_API_ROUTE, bodyString, { params });
  }

  viewFBId(reqParams: {
    updateType?: string,
    postId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.postId) params.postid = reqParams.postId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWFBID_API_ROUTE, bodyString, { params });
  }

  resetPassword(credentials: { oldPassword: string, newPassword: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEPASSWORD_API_ROUTE, bodyString);
  }

  forgotPassword(credentials: { username: string }): Observable<any> {
    let body: any = {};
    body = {...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(FORGOTPASSWORD_API_ROUTE, bodyString);
  }

  addFirebaseId(credentials: { notificationToken: string, device?: string, state?: boolean }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDFBID_API_ROUTE, bodyString);
  }

  async logout(): Promise<any> {
    this.isAuthenticated.next(false);
    Storage.remove({ key: TOKEN_KEY });
    Storage.remove({ key: ADMINID_KEY });
    Storage.remove({ key: ADMINCREDENTIALS_KEY });

    this.router.navigateByUrl(loginRoute);
  }

  async saveCredentials(credentials: { adminId?: string, token?: string, credentials?: any }) {
    if(credentials.adminId) {
      await Storage.set({ key: ADMINID_KEY, value: credentials.adminId });
      this.requestToken.adminid = credentials.adminId;
    }  
    if(credentials.token) {
      await Storage.set({ key: TOKEN_KEY, value: credentials.token });
      this.requestToken.admintoken = credentials.token;
    }
    if(credentials.credentials){
      await Storage.set({ key: ADMINCREDENTIALS_KEY, value: credentials.credentials });
    }

    if(credentials.adminId && credentials.token) {
      this.requestSubject.next(this.requestToken);
    }
  }
}