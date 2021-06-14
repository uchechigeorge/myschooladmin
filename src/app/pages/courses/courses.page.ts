import { Component, OnInit, ViewChild } from '@angular/core';
import { ICardDetail, IFilterCard } from 'src/app/models/card-models';
import { ApiDataService } from 'src/app/services/api-data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { PopoverController, ModalController, ToastController, IonInfiniteScroll } from '@ionic/angular';
import { AddCourseComponent } from 'src/app/components/modals/add/add-course/add-course.component';
import { addCourseModalID, viewCourseModalID, viewGradeModalID } from 'src/app/models/components-id';
import { ViewCourseComponent } from 'src/app/components/modals/view/view-course/view-course.component';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { TeacherService } from 'src/app/services/teacher.service';
import { ViewGradeComponent } from 'src/app/components/modals/view/view-grade/view-grade.component';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
})
export class CoursesPage implements OnInit {

  public cards: ICardDetail[] = [];
  public filterCards: ICardDetail[] = [];
  public searchMode: boolean = false;
  public searchString: string = '';
  public filterData: IFilterCard[] = [];
  public inputFirstLoad: boolean = true;

  public isLoading: boolean = true;
  public errMessage: string = "";
  public showError: boolean = false;
  public pageNum: number = 1;
  public noOfCourses: number;
  public noMoreCourses: boolean = false;

  @ViewChild('scroll') scroll: IonInfiniteScroll;

  constructor(
    private courseService: ClassCourseService,
    private teacherService: TeacherService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.isLoading = true;
    this.reset();
    this.getCourses();
  }

  async refresh(e?) {
    if(this.isLoading) {
      e?.target.complete()
      return;
    };

    this.isLoading = true;
    this.pageNum = 1;

    if(this.searchMode) {
      this.filterCards = [];
      this.search();
    }
    else {
      this.cards = [];
      await this.getCourses();
    }
    e?.target.complete()
  }

  async loadData(e) {
    this.pageNum++;
    if(this.searchMode){
      // await this.searchRemote(this.searchString.trim());
    }
    else {
      await this.getCourses();
    }

    if(this.noMoreCourses) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

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
              "Name": course.courseName,
              "Class": course.courseClass,
              "Teacher(s)": "",
            }
          });
        });

        this.noOfCourses = res.dataResponse[0].totalRows;
        this.cards.forEach(async card => {
          const courseTeachers = (await this.getTeachers(card.cardData.courseId)) as Array<any>;
          card.details = {
            "Name": card.cardData.courseName,
            "Class": card.cardData.courseClass,
            "Teacher(s)": courseTeachers.length <= 1 ? courseTeachers[0].fullName : courseTeachers[0].fullName + " and " + (courseTeachers.length - 1).toString() + " other(s)",
          }
        });
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No courses";
          this.showError = true;
        }
        else{
          this.noMoreCourses = true;
        }
      }
      else if(res.statuscode == 401) {
        this.errMessage = "Unauthorised";
        this.showError = true;
      }
      else {
        this.presentToast(res.status);
      }

      this.isLoading = false;

    }, (err) => {
      this.isLoading = false;

      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  async getTeachers(courseId: string): Promise<any> {
    const value = await this.teacherService.viewTeacher({
      updateType: "5",
      pageSize: "20",
      pageNum: "1",
      qString: courseId,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        return response;
      }
      else {
        return [{}];
      }
    }, err => {
      return [{}];
    });

    return value;
  }

  toggleBtnClick(e: MatButtonToggleChange) {
    if(this.searchMode) return;
  }

  enterSearchMode() {
    this.searchMode = true;
    this.toggleSearchInput();
  }

  exitSearchMode() {
    this.searchMode = false;
    this.errMessage = "";
    this.showError = false;
    this.pageNum = 1;
    this.noMoreCourses = false;
    this.scroll.disabled = false;
  }

  search() {
    if(this.searchString.trim() == "") {
      this.filterCards = [];
      return;
    }

    this.pageNum = 1;
    this.filterCards = [];
    this.scroll.disabled = false;
    this.searchRemote(this.searchString.trim());
  }

  async searchRemote(searchString: string) {
    this.isLoading = true;
    this.courseService.viewCourse({
      updateType: "3",
      pageSize: "20",
      pageNum: this.pageNum.toString(),
      qString: searchString,
    })
      .subscribe(res => {
        if (res.statuscode == 200) {
          res.dataResponse.forEach(course => {
            this.filterCards.push({
              showImage: false,
              cardData: course,
              details: {
                "Name": course.courseName,
                "Class": course.courseClass,
                "Teacher(s)": "",
              }
            });
          });

          this.errMessage = "";
          this.showError = false;
          this.filterCards.forEach(async card => {
            const courseTeachers = (await this.getTeachers(card.cardData.courseId)) as Array<any>;
            card.details = {
              "Name": card.cardData.courseName,
              "Class": card.cardData.courseClass,
              "Teacher(s)": courseTeachers.length <= 1 ? courseTeachers[0].fullName : courseTeachers[0].fullName + " and " + (courseTeachers.length - 1).toString() + " other(s)",
            }
          });
        }
        else if (res.statuscode == 204) {
          if (this.pageNum == 1) {
            this.errMessage = "Oops, no result ☹😝";
            this.showError = true;
            this.filterCards = [];
          }
          else {
            this.noMoreCourses = true;
          }
        }
        else if (res.statuscode == 401) {
          this.errMessage = "Unauthorised";
          this.showError = true;
        }
        else {
          this.presentToast(res.status);
        }

        this.isLoading = false;

      }, (err) => {
        this.isLoading = false;

        this.presentToast(CHECK_INTERNET_CON);
      }) 
  }

  reset() {
    this.pageNum = 1;
    this.showError = false;
    this.errMessage = "";
    this.noMoreCourses = false;
    this.scroll.disabled = false;
    this.cards = [];
    this.filterCards = [];
    this.searchString = "";
    this.searchMode = false;
  }

  async view(e) {
    const modal = await this.modalCtrl.create({
      component: ViewCourseComponent,
      id: viewCourseModalID,
      componentProps: {
        "courseId": e.cardData?.courseId,
      }
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

  async addGrade() {
    const modal = await this.modalCtrl.create({
      component: ViewGradeComponent,
      id: viewGradeModalID,
    });

    await modal.present();
    await modal.onWillDismiss();
    // this.refresh();
  }

  toggleSearchInput() {
    if(this.inputFirstLoad == true) {
      this.inputFirstLoad = false;
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  ionViewWillEnter() {
    this.inputFirstLoad = true;
  }
}

