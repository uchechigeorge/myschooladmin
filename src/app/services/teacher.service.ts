import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, API_HOST } from './auth.service';
import { Observable } from 'rxjs';

const VIEWTEACHER_API_ROUTE = `${API_HOST}/api/admin/view/viewteacher.ashx`;
const VIEWENTITYCOUNT_API_ROUTE = `${API_HOST}/api/admin/view/viewentitycount.ashx`;

const ADDTEACHER_API_ROUTE = `${API_HOST}/api/admin/add/addteacher.ashx`;
const UPDATEPIC_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updateprofilepic.ashx`;
const UPDATEFIRSTNAME_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updatefname.ashx`;
const UPDATELASTNAME_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updatelname.ashx`;
const UPDATEOTHERNAMES_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updateoname.ashx`;
const UPDATEEMAIL_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updateemail.ashx`;
const UPDATEPASSWORD_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updatepassword.ashx`;
const UPDATEGENDER_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updategender.ashx`;
const UPDATEDOB_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updatedob.ashx`;
const UPDATEPHONENUM_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updatephonenum.ashx`;
const UPDATECLASS_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updateteacherclass.ashx`;
const UPDATECOURSE_API_ROUTE = `${API_HOST}/api/admin/update/teacher/updateteachercourse.ashx`;
const DELETESTUDENT_API_ROUTE = `${API_HOST}/api/admin/delete/deleteteacher.ashx`;


@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { 
    this.loadToken();
  }

  get requestSubject() {
    return this.authService.requestSubject;
  }

  private async loadToken() {
    await this.authService.loadToken();
  }

  addTeacher(details: {
    firstName: string,
    lastName: string,
    otherNames?: string,
    nextOfKin?: string,
    email?: string,
    gender?: string,
    phoneNum?: string,
    dob?: string,
    classIds?: string[],
    courseIds?: string[],
  }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    body.teacher = details;
    const bodyString = JSON.stringify(body);

    return this.http.post(ADDTEACHER_API_ROUTE, bodyString);
  }

  viewTeacher(reqParams: {
    updateType?: string,
    teacherId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }
  ): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};

    if(reqParams.updateType) params.updateType = reqParams.updateType;
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.teacherId) params.teacherid = reqParams.teacherId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWTEACHER_API_ROUTE, bodyString, { params });
  } 
  
  viewEntityCount(reqParams?: {
    updateType?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }
  ): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};

    if(reqParams.updateType) params.updateType = reqParams.updateType;
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWENTITYCOUNT_API_ROUTE, bodyString, { params });
  } 
  
  updateFirstName(credentials: {teacherid: string, firstName: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEFIRSTNAME_API_ROUTE, bodyString);
  }

  updateLastName(credentials: {teacherid: string, lastName: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATELASTNAME_API_ROUTE, bodyString);
  }

  updateOtherNames(credentials: {teacherid: string, otherNames: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEOTHERNAMES_API_ROUTE, bodyString);
  }

  updateEmail(credentials: {teacherid: string, email: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEEMAIL_API_ROUTE, bodyString);
  }

  updateGender(credentials: {teacherid: string, gender: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEGENDER_API_ROUTE, bodyString);
  }

  updatePassword(credentials: {teacherid: string, password: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEPASSWORD_API_ROUTE, bodyString);
  }

  updateDOB(credentials: {teacherid: string, dob: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEDOB_API_ROUTE, bodyString);
  }

  updatePhoneNumber(credentials: {teacherid: string, phoneNumber: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEPHONENUM_API_ROUTE, bodyString);
  }

  updateClass(credentials: { teacherid: string, classIds: string[] }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATECLASS_API_ROUTE, bodyString);
  }
  
  updateCourse(credentials: { teacherid: string, courseIds: string[] }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATECOURSE_API_ROUTE, bodyString);
  }

  updateProfilePic(formData: any, credentials: { teacherId: string }): Observable<any> {
    let params: { [param: string]: string | string[]; } = {};
    params.adminid = this.requestSubject.getValue().adminid;
    params.token = this.requestSubject.getValue().admintoken;
    params.teacherid = credentials.teacherId;
    return this.http.post(UPDATEPIC_API_ROUTE, formData, { params });
  }

  deleteTeacher(credentials: { teacherId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETESTUDENT_API_ROUTE, bodyString);
  }

  async saveCredentials(credentials: { adminId?: string, token?: string, credentials?: any }) {
    await this.authService.saveCredentials(credentials);
  }
}
