import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from, BehaviorSubject, pipe } from 'rxjs';
import { Plugins } from "@capacitor/core";
import { Router } from '@angular/router';

import { API_HOST, TOKEN_KEY, ADMINID_KEY, AuthService, ADMINCREDENTIALS_KEY } from './auth.service';

const ADDSTUDENT_API_ROUTE = `${API_HOST}/api/admin/add/addstudent.ashx`;

const VIEWSTUDENT_API_ROUTE = `${API_HOST}/api/admin/view/viewactivestudent.ashx`;
const VIEWSTUDENTBYTERM_API_ROUTE = `${API_HOST}/api/admin/view/viewstudentbyterm.ashx`;
const VIEWSCRATCHCARD_API_ROUTE = `${API_HOST}/api/admin/view/viewscratchcard.ashx`;

const UPDATEFIRSTNAME_API_ROUTE = `${API_HOST}/api/admin/update/student/updatefname.ashx`;
const UPDATELASTNAME_API_ROUTE = `${API_HOST}/api/admin/update/student/updatelname.ashx`;
const UPDATEOTHERNAME_API_ROUTE = `${API_HOST}/api/admin/update/student/updateoname.ashx`;
const UPDATEEMAIL_API_ROUTE = `${API_HOST}/api/admin/update/student/updateemail.ashx`;
const UPDATEGENDER_API_ROUTE = `${API_HOST}/api/admin/update/student/updategender.ashx`;
const UPDATEPASSWORD_API_ROUTE = `${API_HOST}/api/admin/update/student/updatepassword.ashx`;
const UPDATEPHONE_API_ROUTE = `${API_HOST}/api/admin/update/student/updatephonenum.ashx`;
const UPDATENEXTOFKIN_API_ROUTE = `${API_HOST}/api/admin/update/student/updatenextofkin.ashx`;
const UPDATEDOB_API_ROUTE = `${API_HOST}/api/admin/update/student/updatedob.ashx`;
const UPDATEPIC_API_ROUTE = `${API_HOST}/api/admin/update/student/updateprofilepic.ashx`;
const UPDATECLASS_API_ROUTE = `${API_HOST}/api/admin/update/student/updatestudentclass.ashx`;
const UPDATECOURSE_API_ROUTE = `${API_HOST}/api/admin/update/student/updatestudentcourse.ashx`;
const UPDATESCRATCHCARD_API_ROUTE = `${API_HOST}/api/admin/add/addscratchcard.ashx`;

const SETACTIVE_API_ROUTE = `${API_HOST}/api/admin/update/student/setstudentactive.ashx`;
const SETINACTIVE_API_ROUTE = `${API_HOST}/api/admin/update/student/setstudentinactive.ashx`;
const DELETESTUDENT_API_ROUTE = `${API_HOST}/api/admin/delete/deletestudent.ashx`;

const ADDSTUDENTREQUEST_API_ROUTE = `${API_HOST}/api/admin/add/addstudentrequest.ashx`;
const UPDATESTUDENTREQUEST_API_ROUTE = `${API_HOST}/api/admin/update/studentrequest/updatestudentrequest.ashx`;
const VIEWSTUDENTREQUEST_API_ROUTE = `${API_HOST}/api/admin/view/viewstudentrequest.ashx`;
const ACCEPTSTUDENTREQUEST_API_ROUTE = `${API_HOST}/api/admin/update/studentrequest/acceptstudentrequest.ashx`;
const DECLINESTUDENTREQUEST_API_ROUTE = `${API_HOST}/api/admin/update/studentrequest/declinestudentrequest.ashx`;
const DELETEESTUDENTREQUEST_API_ROUTE = `${API_HOST}/api/admin/update/studentrequest/deletestudentrequest.ashx`;
const UPDATESTUDENTREQUESTPIC_API_ROUTE = `${API_HOST}/api/admin/update/studentrequest/updateprofilepic.ashx`;


const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) { 
    this.loadToken();
  }

  // private requestToken: { adminid?: string, admintoken?: string } = {};

  // public requestSubject: BehaviorSubject<{ adminid?: string, admintoken?: string }> = new BehaviorSubject<{ adminid: string, admintoken: string }>(null);

  get requestSubject() {
    return this.authService.requestSubject;
  }

  private async loadToken() {
    await this.authService.loadToken();
  }

  addStudent(details: {
    firstName: string,
    lastName: string,
    otherNames?: string,
    nextOfKin?: string,
    email?: string,
    gender?: string,
    phoneNum1?: string,
    phoneNum2?: string,
    dob?: string,
  }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    body.student = details;
    const bodyString = JSON.stringify(body);

    return this.http.post(ADDSTUDENT_API_ROUTE, bodyString);
  }

  viewStudent(reqParams: {
    updateType?: string,
    studentId?: string,
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
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWSTUDENT_API_ROUTE, bodyString, { params });
  }

  viewStudentByTerm(reqParams: {
    updateType?: string,
    studentId?: string,
    termId?: string,
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
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWSTUDENTBYTERM_API_ROUTE, bodyString, { params });
  }

  viewScratchCard(reqParams: {
    updateType?: string,
    studentId?: string,
    scratchCardId?: string,
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
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.scratchCardId) params.scratchcardid = reqParams.scratchCardId;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWSCRATCHCARD_API_ROUTE, bodyString, { params });
  }

  updateFirstName(credentials: {studentid: string, firstName: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEFIRSTNAME_API_ROUTE, bodyString);
  }

  updateLastName(credentials: {studentid: string, lastName: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATELASTNAME_API_ROUTE, bodyString);
  }

  updateOtherNames(credentials: {studentid: string, otherNames: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEOTHERNAME_API_ROUTE, bodyString);
  }

  updateNextOfKin(credentials: {studentid: string, nextOfKin: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATENEXTOFKIN_API_ROUTE, bodyString);
  }

  updateEmail(credentials: {studentid: string, email: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEEMAIL_API_ROUTE, bodyString);
  }

  updateGender(credentials: {studentid: string, gender: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEGENDER_API_ROUTE, bodyString);
  }

  updatePassword(credentials: {studentid: string, password: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEPASSWORD_API_ROUTE, bodyString);
  }

  updateScratchCard(credentials: {studentid: string, scratchCardNumber: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESCRATCHCARD_API_ROUTE, bodyString);
  }

  updateDOB(credentials: {studentid: string, dob: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEDOB_API_ROUTE, bodyString);
  }

  updatePhoneNumber(credentials: {studentid: string, phoneNumber: string[]}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEPHONE_API_ROUTE, bodyString);
  }

  updateProfilePic(formData: any, credentials: { studentid: string }): Observable<any> {
    let params: { [param: string]: string | string[]; } = {};
    params.adminid = this.requestSubject.getValue().adminid;
    params.token = this.requestSubject.getValue().admintoken;
    params.studentid = credentials.studentid;
    return this.http.post(UPDATEPIC_API_ROUTE, formData, { params });
  }

  updateClass(credentials: { studentId: string, classId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATECLASS_API_ROUTE, bodyString);
  }
  
  updateCourse(credentials: { studentId: string, courseIds: string[] }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATECOURSE_API_ROUTE, bodyString);
  }

  setActive(credentials: { studentId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(SETACTIVE_API_ROUTE, bodyString);
  }

  setInactive(credentials: { studentId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(SETINACTIVE_API_ROUTE, bodyString);
  }

  deleteStudent(credentials: { studentId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETESTUDENT_API_ROUTE, bodyString);
  }

  viewStudentRequest(reqParams: {
    updateType?: string,
    studentId?: string,
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
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWSTUDENTREQUEST_API_ROUTE, bodyString, { params });
  }

  addStudentRequest(details: {
    firstName: string,
    lastName: string,
    studentRequestId?: string,
    otherNames?: string,
    nextOfKin?: string,
    email?: string,
    gender?: string,
    phoneNum1?: string,
    phoneNum2?: string,
    dob?: string,
  }): Observable<any> {
    let body: any = {};
    body = {...details};

    const bodyString = JSON.stringify(body);

    return this.http.post(ADDSTUDENTREQUEST_API_ROUTE, bodyString);
  }

  acceptStudentRequest(details?: {
    firstName?: string,
    lastName?: string,
    studentRequestId?: string,
    otherNames?: string,
    nextOfKin?: string,
    email?: string,
    gender?: string,
    phoneNum1?: string,
    phoneNum2?: string,
    dob?: string,
  }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    body.student = details;
    const bodyString = JSON.stringify(body);

    return this.http.post(ACCEPTSTUDENTREQUEST_API_ROUTE, bodyString);
  }

  updateStudentRequest(details: {
    firstName: string,
    lastName: string,
    studentRequestId: string,
    otherNames?: string,
    nextOfKin?: string,
    email?: string,
    gender?: string,
    phoneNum1?: string,
    phoneNum2?: string,
    dob?: string,
  }): Observable<any> {
    let body: any = {};
    body = {...details};

    const bodyString = JSON.stringify(body);

    return this.http.post(UPDATESTUDENTREQUEST_API_ROUTE, bodyString);
  }

  declineStudentRequest(studentRequestId: string): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue() };
    body.studentRequestId = studentRequestId;
    const bodyString = JSON.stringify(body);

    return this.http.post(DECLINESTUDENTREQUEST_API_ROUTE, bodyString);
  }

  deleteStudentRequest(studentRequestId: string): Observable<any> {
    let body: any = {};
    body.studentRequestId = studentRequestId;
    const bodyString = JSON.stringify(body);

    return this.http.post(DELETEESTUDENTREQUEST_API_ROUTE, bodyString);
  }

  updateStudentRequestProfilePic(formData: any, credentials: { studentid: string }): Observable<any> {
    let params: { [param: string]: string | string[]; } = {};
    params.studentrequestid = credentials.studentid;
    return this.http.post(UPDATESTUDENTREQUESTPIC_API_ROUTE, formData, { params });
  }

  async saveCredentials(credentials: { adminId?: string, token?: string, credentials?: any }) {
    await this.authService.saveCredentials(credentials);
  }
}
