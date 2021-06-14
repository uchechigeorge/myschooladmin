import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { LoadingController, ModalController, IonInfiniteScroll, ToastController } from '@ionic/angular';
import {Chart, registerables, ChartItem} from "chart.js";

import { ICardDetail } from 'src/app/models/card-models';
import { homeLoaderID, addTeacherModalID, addStudentModalID, addCourseModalID, desktopCamModalID, viewStudentModalID, viewTeacherModalID, viewCourseModalID } from 'src/app/models/components-id';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { AddTeacherComponent } from 'src/app/components/modals/add/add-teacher/add-teacher.component';
import { AddStudentComponent } from 'src/app/components/modals/add/add-student/add-student.component';
import { AddCourseComponent } from 'src/app/components/modals/add/add-course/add-course.component';
import { StudentService } from 'src/app/services/student.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { TeacherService } from 'src/app/services/teacher.service';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { ViewStudentComponent } from 'src/app/components/modals/view/view-student/view-student.component';
import { ViewTeacherComponent } from 'src/app/components/modals/view/view-teacher/view-teacher.component';
import { ViewCourseComponent } from 'src/app/components/modals/view/view-course/view-course.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {

  private _mobileQueryListener: () => void;
  public mobileQuery: MediaQueryList;
  public showError = false;
  public isLoading = true;
  public errMessage = "";
  public pageNum = 1;
  public updateType = "1";
  public noMoreVaues = false;
  public pageMode: PageMode = PageMode.Students;
  public noOfStudents: string = "_";
  public noOfTeachers: string = "_";
  public noOfCourses: string = "_";
  public hasChart = false;

  public counter = 0;
  public noOfTerms: number;

  public cards: ICardDetail[] = [];
  
  public chartElem: any;
  public chartCtrl: any;
  
  @ViewChild('scroll') scroll: IonInfiniteScroll;

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private courseService: ClassCourseService,
    changeDetector: ChangeDetectorRef,
    media: MediaMatcher,
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px');
    this._mobileQueryListener = () => changeDetector.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    // Chart.register(...registerables);
  }

  ngOnInit() {
  }

  private _chartData: { id?: any, noOfStudents?: string, term?: string }[] = [];

  get chartData() {
    return this._chartData;
  }

  set chartData(value) {
    this._chartData = value;

    // this.initChart();
  }

  async ionViewDidEnter() {
    await this.showLoading();
    this.getCards();
    this.getChartTerms();
    this.getEntityCount();
  }

  async toggleBtnClick(e: MatButtonToggleChange) {
    this.cards = [];
    await this.showLoading();
    this.reset();
    this.displayCard(e.value);
  }

  displayCard(value: string) {
    if(value == 'students') {
      this.pageMode = PageMode.Students;
      this.getCards();
    }
    else if(value == 'teachers') {
      this.pageMode = PageMode.Teachers;
      this.getCards();
    }
    else if(value == 'courses') {
      this.pageMode = PageMode.Courses;
      this.getCards();
    }
  }

  async getCards() {
    switch (this.pageMode) {
      case PageMode.Students:
        await this.getStudents();
        break;
      case PageMode.Teachers:
        await this.getTeachers();
        break;
      case PageMode.Courses:
        await this.getCourses();
        break;
    
      default:
        break;
    }
  }

  async getStudents() {
    this.studentService.viewStudent({
      updateType: "1",
      pageSize: "20",
      pageNum: this.pageNum.toString(),
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        res.dataResponse.forEach(async (student) => {
          this.cards.push({
            showImage: true,
            altImage: "icon",
            cardData: student,
            imageSrc: student.dpUrl,
            details: {
              "Name": student.fullName,
              "Guardian": student.nextOfKin,
              "Contact": student.phonenum1,
            },
            btnClick: async () => {
              const modal = await this.modalCtrl.create({
                component: ViewStudentComponent,
                id: viewStudentModalID,
                componentProps: {
                  "studentId": student.studentId,
                  "active": true
                }
              });
          
              await modal.present();
              await modal.onWillDismiss()
              this.refresh();
            }
          });
        });

        this.noOfStudents = res.dataResponse[0].totalRows;
        this.errMessage = "";
        this.showError = false;
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No students";
          this.showError = true;
        }
        else{
          this.noMoreVaues = true;
        }
      }
      else if(res.statuscode == 401) {
        this.errMessage = "Unauthorised";
        this.showError = true;
      }
      else {
        this.presentToast(res.status);
      }

      this.dismissLoader();

    }, (err) => {
      this.dismissLoader();
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  async getTeachers() {
    this.teacherService.viewTeacher({
      updateType: "1",
      pageSize: "20",
      pageNum: this.pageNum.toString(),
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        res.dataResponse.forEach(async (teacher) => {
          this.cards.push({
            showImage: true,
            altImage: "icon",
            cardData: teacher,
            imageSrc: teacher.dpUrl,
            details: {
              "Name": teacher.fullName,
              "Contact": teacher.phonenum,
              "Email": teacher.email,
            },
            btnClick: async () => {
              const modal = await this.modalCtrl.create({
                component: ViewTeacherComponent,
                id: viewTeacherModalID,
                componentProps: {
                  "teacherId": teacher.teacherId
                }
              });
          
              await modal.present();
              await modal.onWillDismiss();
              this.refresh();
          
            }
          });
        });

        this.noOfTeachers = res.dataResponse[0].totalRows;
        this.errMessage = "";
        this.showError = false;
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No teachers";
          this.showError = true;
        }
        else{
          this.noMoreVaues = true;
        }
      }
      else if(res.statuscode == 401) {
        this.errMessage = "Unauthorised";
        this.showError = true;
      }
      else {
        this.presentToast(res.status);
      }

      this.dismissLoader();

    }, (err) => {
      this.dismissLoader();
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  async getCourses() {
    this.courseService.viewCourse({
      updateType: "1",
      pageSize: "20",
      pageNum: this.pageNum.toString(),
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        res.dataResponse.forEach(async (course) => {
          this.cards.push({
            showImage: false,
            cardData: course,
            details: {
              "Course": course.course,
              "Name": course.courseName,
              "Class": course.courseClass,
            },
            btnClick: async () => {
              const modal = await this.modalCtrl.create({
                component: ViewCourseComponent,
                id: viewCourseModalID,
                componentProps: {
                  "courseId": course.courseId,
                }
              });
          
              await modal.present();
              await modal.onWillDismiss();
              this.refresh();
            }
          });
        });

        this.noOfCourses = res.dataResponse[0].totalRows;
        this.errMessage = "";
        this.showError = false;
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No courses";
          this.showError = true;
        }
        else{
          this.noMoreVaues = true;
        }
      }
      else if(res.statuscode == 401) {
        this.errMessage = "Unauthorised";
        this.showError = true;
      }
      else {
        this.presentToast(res.status);
      }

      this.dismissLoader();

    }, (err) => {
      this.dismissLoader();
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  getEntityCount() {
    this.teacherService.viewEntityCount({ updateType: "1" })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        if(response?.noOfStudents.length > 0)
          this.noOfStudents = response.noOfStudents;
        if(response?.noOfTeachers.length > 0)
          this.noOfTeachers = response.noOfTeachers;
        if(response?.noOfCourses.length > 0)
          this.noOfCourses = response.noOfCourses;
      }
    })
  }

  reset() {
    this.pageNum = 1;
    this.showError = false;
    this.errMessage = "";
    this.noMoreVaues = false;
    this.scroll.disabled = false;
    this.cards = [];
  }

  async refresh(e?) {
    this.pageNum = 1;
    this.cards = [];
    this.reset();
    await this.showLoading();
    this.getCards();
    this.getChartTerms();
    this.getEntityCount();
    
    e?.target.complete()
  }

  async loadData(e) {
    this.pageNum++;
    await this.getCards();
    if(this.noMoreVaues) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

  }

  async showLoading() {
    this.isLoading = true;
    const loader = await this.loadingCtrl.create({
      message: 'Please wait',
      spinner: 'crescent',
      id: homeLoaderID,
    });

    return await loader.present();
  }

  dismissLoader() {
    this.isLoading = false;
    this.loadingCtrl.dismiss()
    .catch(() => {});
  }

  async addTeacher() {
    const modal = await this.modalCtrl.create({
      component: AddTeacherComponent,
      id: addTeacherModalID,
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
  }

  async addStudent() {
    const modal = await this.modalCtrl.create({
      component: AddStudentComponent,
      id: addStudentModalID,
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
  }

  async addCourse() {
    const modal = await this.modalCtrl.create({
      component: AddCourseComponent,
      id: addCourseModalID,
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
  }

  async getChartTerms() {
    this.studentService.viewStudentByTerm({
      updateType: "1",
      pageNum: "1",
      pageSize: "5"
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        this.hasChart = true;
        
        const data = [];
        response.forEach((term) => {
          data.push({
            id: term.termId,
            term: term.term + this.getPosition(term.term) + " Term-" + term.schoolYear,
          });
        });

        response.forEach(async (term) => {
          const noOfStudents = (await this.getStudentByTerm(term.termId)).totalStudents;
          data.find(chart => chart.id == term.termId).noOfStudents = noOfStudents;
          this.chartData = data;
        });
        
        this.chartData = data;

        return this.chartData;
      }
    });
    
  }

  async getStudentByTerm(termId: string) {
    const data = await this.studentService.viewStudentByTerm({
      updateType: "2",
      termId,
    }).toPromise()
    .then(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;

        return response[0];
      }
    });

    return data;
  }

  initChart() {

    const labels = this.chartData.map(c => { return c.term});
    const data = this.chartData.map(c => c.noOfStudents);

    const className = '.chartElem';
    const chartElem = document.querySelector(className) as ChartItem;

    this.chartCtrl?.destroy();

    this.chartCtrl = new Chart(chartElem, {
      
      type: 'bar',
      data: {
          labels,
          datasets: [{
              label: 'No of Students per Term',
              data,
              backgroundColor: [
                  'rgba(103, 58, 183, 0.5)',
                  'rgba(255, 215, 64, 0.5)',
                  'rgba(103, 58, 183, 0.5)',
                  'rgba(255, 215, 64, 0.5)',
                  'rgba(103, 58, 183, 0.5)',
                  'rgba(255, 215, 64, 0.5)',
              ],
              borderColor: [
                  'rgba(103, 58, 183, 1)',
                  'rgba(255, 215, 64, 1)',
                  'rgba(103, 58, 183, 1)',
                  'rgba(255, 215, 64, 1)',
                  'rgba(103, 58, 183, 1)',
                  'rgba(255, 215, 64, 1)',
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              },
          },

      }
  });

  }

  getPosition(value: number): string {
    if(isNaN(value)) return "";
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

  getNumber(_value: string) {
    let value: number = parseInt(_value);

    if(isNaN(value)) return _value;

    let valueString = "";

    if(value < 1000) {
      valueString = value.toString();
    }
    else if(value >= 1000 && value <= 1000000) {
      valueString = (value/1000).toPrecision(2) + "k";
    }
    else {
      valueString = (value/1000000).toPrecision(2) + "m";
    }

    return valueString;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  wait = (ms: number) => new Promise<any>(resolve => setTimeout(resolve, ms));

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}

enum PageMode{
  Students,
  Teachers,
  Courses,
}