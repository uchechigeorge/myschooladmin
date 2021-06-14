import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService, API_HOST } from './auth.service';


const VIEWTERM_API_ROUTE = `${API_HOST}/api/admin/view/viewterm.ashx`;
const VIEWSESSION_API_ROUTE = `${API_HOST}/api/admin/view/viewsession.ashx`;
const VIEWSUBCLASS_API_ROUTE = `${API_HOST}/api/admin/view/viewsubclass.ashx`;
const VIEWCLASS_API_ROUTE = `${API_HOST}/api/admin/view/viewclass.ashx`;
const VIEWCOURSE_API_ROUTE = `${API_HOST}/api/admin/view/viewcourse.ashx`;
const VIEWGENERALFEES_API_ROUTE = `${API_HOST}/api/admin/view/viewgeneralfees.ashx`;
const VIEWSPECIFICFEES_API_ROUTE = `${API_HOST}/api/admin/view/viewspecificfees.ashx`;
const VIEWGRADES_API_ROUTE = `${API_HOST}/api/admin/view/viewgrades.ashx`;
const VIEWSTUDENTFEES_API_ROUTE = `${API_HOST}/api/admin/view/viewstudentfees.ashx`;
const VIEWFEESPAYMENT_API_ROUTE = `${API_HOST}/api/admin/view/viewfeespayment.ashx`;

const ADDSESSION_API_ROUTE = `${API_HOST}/api/admin/add/addsession.ashx`;
const ADDTERM_API_ROUTE = `${API_HOST}/api/admin/add/addterms.ashx`;
const ADDCLASS_API_ROUTE = `${API_HOST}/api/admin/add/addclass.ashx`;
const ADDCOURSE_API_ROUTE = `${API_HOST}/api/admin/add/addcourse.ashx`;
const ADDSUBCLASS_API_ROUTE = `${API_HOST}/api/admin/add/addsubclass.ashx`;
const ADDGENERALFEES_API_ROUTE = `${API_HOST}/api/admin/add/addgeneralfees.ashx`;
const ADDSPECIFICFEES_API_ROUTE = `${API_HOST}/api/admin/add/addspecificfees.ashx`;
const ADDGRADES_API_ROUTE = `${API_HOST}/api/admin/add/addgrade.ashx`;

const UPDATECLASSNAME_API_ROUTE = `${API_HOST}/api/admin/update/classes/updateclassname.ashx`;
const UPDATESUBCLASSNAME_API_ROUTE = `${API_HOST}/api/admin/update/classes/updatesubclassname.ashx`;
const UPDATECLASSTEACHER_API_ROUTE = `${API_HOST}/api/admin/update/classes/updateclassteacher.ashx`;
const UPDATECOURSENAME_API_ROUTE = `${API_HOST}/api/admin/update/course/updatecoursename.ashx`;
const UPDATECOURSETEACHER_API_ROUTE = `${API_HOST}/api/admin/update/course/updatecourseteacher.ashx`;
const UPDATETERMNAME_API_ROUTE = `${API_HOST}/api/admin/update/term/updatetermname.ashx`;
const UPDATETERMSTARTDATE_API_ROUTE = `${API_HOST}/api/admin/update/term/updatetermstartdate.ashx`;
const UPDATETERMENDDATE_API_ROUTE = `${API_HOST}/api/admin/update/term/updatetermenddate.ashx`;
const UPDATESESSIONNAME_API_ROUTE = `${API_HOST}/api/admin/update/term/updatesessionname.ashx`;
const UPDATESESSIONSTARTDATE_API_ROUTE = `${API_HOST}/api/admin/update/term/updatesessionstartdate.ashx`;
const UPDATESESSIONENDDATE_API_ROUTE = `${API_HOST}/api/admin/update/term/updatesessionenddate.ashx`;
const SETACTIVETERM_API_ROUTE = `${API_HOST}/api/admin/update/term/setcurrentterm.ashx`;

const UPDATESFEESTITLE_API_ROUTE = `${API_HOST}/api/admin/update/payment/specific/updatespecificfeestitle.ashx`;
const UPDATESFEESAMOUNT_API_ROUTE = `${API_HOST}/api/admin/update/payment/specific/updatespecificfeesamount.ashx`;
const UPDATESFEESDESCRIPTION_API_ROUTE = `${API_HOST}/api/admin/update/payment/specific/updatespecificfeesdescription.ashx`;

const UPDATEGFEESTITLE_API_ROUTE = `${API_HOST}/api/admin/update/payment/general/updategeneralfeestitle.ashx`;
const UPDATEGFEESAMOUNT_API_ROUTE = `${API_HOST}/api/admin/update/payment/general/updategeneralfeesamount.ashx`;
const UPDATEGFEESDESCRIPTION_API_ROUTE = `${API_HOST}/api/admin/update/payment/general/updategeneralfeesdescription.ashx`;

const UPDATEGRADE_API_ROUTE = `${API_HOST}/api/admin/update/grades/updategrade.ashx`;
const UPDATEGRADEREMARK_API_ROUTE = `${API_HOST}/api/admin/update/grades/updategraderemark.ashx`;
const UPDATEGRADERANGE_API_ROUTE = `${API_HOST}/api/admin/update/grades/updategraderange.ashx`;

const DELETEGENERALFEE_API_ROUTE = `${API_HOST}/api/admin/delete/deletegeneralfee.ashx`;
const DELETESPECIFICFEE_API_ROUTE = `${API_HOST}/api/admin/delete/deletespecificfee.ashx`;
const DELETECLASS_API_ROUTE = `${API_HOST}/api/admin/delete/deleteclass.ashx`;
const DELETESUBCLASS_API_ROUTE = `${API_HOST}/api/admin/delete/deletesubclass.ashx`;
const DELETECOURSE_API_ROUTE = `${API_HOST}/api/admin/delete/deletecourse.ashx`;
const DELETESESSION_API_ROUTE = `${API_HOST}/api/admin/delete/deletesession.ashx`;
const DELETETERM_API_ROUTE = `${API_HOST}/api/admin/delete/deleteterm.ashx`;
const DELETEGRADE_API_ROUTE = `${API_HOST}/api/admin/delete/deletegrade.ashx`;


@Injectable({
  providedIn: 'root'
})
export class ClassCourseService {

  get requestSubject() {
    return this.authService.requestSubject;
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,

  ) { 
    this.loadToken();
  }

  private async loadToken() {
    await this.authService.loadToken();
  }

  addClass(credentials: {className: string}): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDCLASS_API_ROUTE, bodyString);
  }

  updateClassName(credentials: { classId: string, className: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATECLASSNAME_API_ROUTE, bodyString);
  }

  addSubClass(credentials: { subClassName: string, parentClassId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDSUBCLASS_API_ROUTE, bodyString);
  }

  updateSubClassName(credentials: { classId: string, className: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESUBCLASSNAME_API_ROUTE, bodyString);
  }

  updateClassTeacher(credentials: { classId: string, teachersId: string[] }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATECLASSTEACHER_API_ROUTE, bodyString);
  }

  addCourse(credentials: { courseName: string, classId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDCOURSE_API_ROUTE, bodyString);
  }

  updateCourseName(credentials: { courseId: string, courseName: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATECOURSENAME_API_ROUTE, bodyString);
  }
  
  updateCourseTeacher(credentials: { courseId: string, teachersId?: string[] }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATECOURSETEACHER_API_ROUTE, bodyString);
  }

  deleteClass(credentials: { classId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETECLASS_API_ROUTE, bodyString);
  }

  deleteSubClass(credentials: { subClassId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETESUBCLASS_API_ROUTE, bodyString);
  }

  deleteCourse(credentials: { courseId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETECOURSE_API_ROUTE, bodyString);
  }

  viewSubClass(reqParams: {
    updateType?: string,
    classId?: string,
    termId?: string,
    returnType?: string,
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
    if(reqParams.classId) params.classid = reqParams.classId;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.returnType) params.returntype = reqParams.returnType;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWSUBCLASS_API_ROUTE, bodyString, { params });
  }

  viewClass(reqParams: {
    updateType?: string,
    classId?: string,
    termId?: string,
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
  if(reqParams.classId) params.classid = reqParams.classId;
  if(reqParams.termId) params.termid = reqParams.termId;
  if(reqParams.search) params.search = reqParams.search;
  if(reqParams.qString) params.qstring = reqParams.qString;
  if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
  if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

  return this.http.post(VIEWCLASS_API_ROUTE, bodyString, { params });
  }


  viewCourse(reqParams: {
    updateType?: string,
    courseId?: string,
    termId?: string,
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
  if(reqParams.courseId) params.courseid = reqParams.courseId;
  if(reqParams.termId) params.termid = reqParams.termId;
  if(reqParams.search) params.search = reqParams.search;
  if(reqParams.qString) params.qstring = reqParams.qString;
  if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
  if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

  return this.http.post(VIEWCOURSE_API_ROUTE, bodyString, { params });
  }

  viewGeneralFees(reqParams: {
    updateType?: string,
    classId?: string,
    termId?: string,
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
  if(reqParams.classId) params.classid = reqParams.classId;
  if(reqParams.termId) params.termid = reqParams.termId;
  if(reqParams.search) params.search = reqParams.search;
  if(reqParams.qString) params.qstring = reqParams.qString;
  if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
  if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

  return this.http.post(VIEWGENERALFEES_API_ROUTE, bodyString, { params });
  }

  viewSpecificFees(reqParams: {
    updateType?: string,
    studentId?: string,
    termId?: string,
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
  if(reqParams.studentId) params.studentid = reqParams.studentId;
  if(reqParams.termId) params.termid = reqParams.termId;
  if(reqParams.search) params.search = reqParams.search;
  if(reqParams.qString) params.qstring = reqParams.qString;
  if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
  if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

  return this.http.post(VIEWSPECIFICFEES_API_ROUTE, bodyString, { params });
  }

  //#region Grades
  
  viewGrades(reqParams: {
    updateType?: string,
    gradeId?: string,
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
    if(reqParams.gradeId) params.gradeid = reqParams.gradeId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWGRADES_API_ROUTE, bodyString, { params });
  }

  addGrade(credentials: {grade: string, remark?: string, min?: string, max?: string,  }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDGRADES_API_ROUTE, bodyString);
  }
  
  updateGrade(credentials: {gradeId: string, grade: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEGRADE_API_ROUTE, bodyString);
  }
  
  updateGradeRemark(credentials: {gradeId: string, remark?: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEGRADEREMARK_API_ROUTE, bodyString);
  }
  
  updateGradeRange(credentials: {gradeId: string, min?: string, max?: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEGRADERANGE_API_ROUTE, bodyString);
  }

  deleteGrade(credentials: { gradeId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETEGRADE_API_ROUTE, bodyString);
  }


  //#endregion

  //#region Terms
  addTerm(credentials: {sessionId: string, terms: string[] }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDTERM_API_ROUTE, bodyString);
  }

  updateTermName(credentials: { termId: string, term: string }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATETERMNAME_API_ROUTE, bodyString);
  }

  updateTermStartDate(credentials: { termId: string, date: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATETERMSTARTDATE_API_ROUTE, bodyString);
  }

  updateTermEndDate(credentials: { termId: string, date: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATETERMENDDATE_API_ROUTE, bodyString);
  }

  addSession(credentials: { session: string, terms?: string[] }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDSESSION_API_ROUTE, bodyString);
  }

  updateSessionName(credentials: { sessionId: string, session: string }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESESSIONNAME_API_ROUTE, bodyString);
  }

  updateSessionStartDate(credentials: { sessionId: string, date: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESESSIONSTARTDATE_API_ROUTE, bodyString);
  }

  updateSessionEndDate(credentials: { sessionId: string, date: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESESSIONENDDATE_API_ROUTE, bodyString);
  }
  
  deleteSession(credentials: { sessionId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETESESSION_API_ROUTE, bodyString);
  }

  deleteTerm(credentials: { termId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETETERM_API_ROUTE, bodyString);
  }

  
  setActiveTerm(credentials: { termId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    
    const bodyString = JSON.stringify(body);
    return this.http.post(SETACTIVETERM_API_ROUTE, bodyString);
  }

  viewTerm(reqParams: {
    updateType?: string,
    termId?: string,
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
  if(reqParams.termId) params.termid = reqParams.termId;
  if(reqParams.search) params.search = reqParams.search;
  if(reqParams.qString) params.qstring = reqParams.qString;
  if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
  if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
  
  return this.http.post(VIEWTERM_API_ROUTE, bodyString, { params });
}

  viewSession(reqParams: {
      updateType?: string,
      sessionId?: string,
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
    if(reqParams.sessionId) params.sessionid = reqParams.sessionId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWSESSION_API_ROUTE, bodyString, { params });
  }

  //#endregion

  //#region Fees
  
  addGeneralFees(credentials: { feesTitle: string, feesAmount: string, termId: string, subClassId: string, description?: string }[]): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    body.fees = credentials;
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDGENERALFEES_API_ROUTE, bodyString);
  }

  addSpecificFees(credentials: { feesTitle: string, feesAmount: string, termId: string, studentId: string, description?: string }[]): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    body.fees = credentials;
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDSPECIFICFEES_API_ROUTE, bodyString);
  }

  updateSpecificFeesTitle(credentials: { specificFeesId: string, feesTitle: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESFEESTITLE_API_ROUTE, bodyString);
  }

  updateSpecificFeesAmount(credentials: { specificFeesId: string, feesAmount: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESFEESAMOUNT_API_ROUTE, bodyString);
  }
  
  updateSpecificFeesDescription(credentials: { specificFeesId: string, feesDescription: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESFEESDESCRIPTION_API_ROUTE, bodyString);
  }

  updateGeneralFeesTitle(credentials: { generalFeesId: string, feesTitle: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEGFEESTITLE_API_ROUTE, bodyString);
  }

  updateGeneralFeesAmount(credentials: { generalFeesId: string, feesAmount: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEGFEESAMOUNT_API_ROUTE, bodyString);
  }

  updateGeneralFeesDescription(credentials: { generalFeesId: string, feesDescription: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEGFEESDESCRIPTION_API_ROUTE, bodyString);
  }

  deleteGeneralFee(credentials: { generalFeeId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETEGENERALFEE_API_ROUTE, bodyString);
  }

  deleteSpecificFee(credentials: { specificFeeId: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(DELETESPECIFICFEE_API_ROUTE, bodyString);
  }

  viewFeesPayment(reqParams: {
    updateType?: string,
    studentId?: string,
    termId?: string,
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
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWFEESPAYMENT_API_ROUTE, bodyString, { params });
  }

  viewStudentFees(reqParams: {
    updateType?: string,
    studentId?: string,
    termId?: string,
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
  if(reqParams.studentId) params.studentid = reqParams.studentId;
  if(reqParams.termId) params.termid = reqParams.termId;
  if(reqParams.search) params.search = reqParams.search;
  if(reqParams.qString) params.qstring = reqParams.qString;
  if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
  if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

  return this.http.post(VIEWSTUDENTFEES_API_ROUTE, bodyString, { params });
  }

  //#endregion
  
  async saveCredentials(credentials: { adminId?: string, token?: string, credentials?: any }) {
    await this.authService.saveCredentials(credentials);
  }
}
