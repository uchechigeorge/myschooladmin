import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild } from '@angular/core';
import { ICardDetail, IFilterCard } from 'src/app/models/card-models';
import { ApiDataService } from 'src/app/services/api-data.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ModalController, ToastController, IonInfiniteScroll } from '@ionic/angular';
import { AddTeacherComponent } from 'src/app/components/modals/add/add-teacher/add-teacher.component';
import { addTeacherModalID, viewTeacherModalID } from 'src/app/models/components-id';
import { ViewTeacherComponent } from 'src/app/components/modals/view/view-teacher/view-teacher.component';
import { TeacherService } from 'src/app/services/teacher.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ClassCourseService } from 'src/app/services/class-course.service';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.page.html',
  styleUrls: ['./teachers.page.scss'],
})
export class TeachersPage implements OnInit {

  public cards: ICardDetail[] = [];
  public filterCards: ICardDetail[] = [];
  public sortMode: boolean = false;
  public searchMode: boolean = false;
  public searchString: string = '';
  public inputFirstLoad: boolean = true;

  public isLoading: boolean = true;
  public errMessage: string = "";
  public showError: boolean = false;
  public pageNum: number = 1;
  public noOfTeachers: number;
  public noMoreTeachers: boolean = false;

  @ViewChild('scroll') scroll: IonInfiniteScroll; 

  constructor(
    private dataApi: ApiDataService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private teacherService: TeacherService,
    private classService: ClassCourseService,
  ) { }

  ngOnInit() { 
  }
  
  ionViewDidEnter() {
    this.isLoading = true;
    this.reset();
    this.getTeachers();
  }

  async refresh(e?) {
    if(this.isLoading) return;

    this.isLoading = true;
    this.pageNum = 1;

    if(this.searchMode) {
      this.filterCards = [];
      this.search();
    }
    else {
      this.cards = [];
      this.reset();
      await this.getTeachers();
    }
    e?.target.complete()
  }

  async loadData(e) {
    this.pageNum++;
    if(this.searchMode){
      await this.searchRemote(this.searchString.trim());
    }
    else {
      await this.getTeachers();
    }

    if(this.noMoreTeachers) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

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
              "Class": "",
              "Courses": "",
            }
          });
        });

        this.noOfTeachers = res.dataResponse[0].totalRows;
        this.cards.forEach(async card => {
          const teacherClasses = (await this.getClass(card.cardData.teacherId)) as Array<any>;
          const teacherCourses = (await this.getCourse(card.cardData.teacherId)) as Array<any>;
          card.details = {
            "Name": card.cardData.fullName,
            "Class": teacherClasses.length <= 1 ? teacherClasses[0].subClassName : teacherClasses[0].subClassName + " and " + (teacherClasses.length - 1).toString() + " other(s)",
            "Courses": teacherCourses.length <= 1 ? teacherCourses[0].course : teacherCourses[0].course + " and " + (teacherCourses.length - 1).toString() + " other(s)",
          }
        });

      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No teachers";
          this.showError = true;
        }
        else{
          this.noMoreTeachers = true;
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

  toggleBtnClick(e: MatButtonToggleChange) {
    if(this.searchMode) return;
  }

  async getClass(teacherId: string): Promise<any> {
    const value = await this.classService.viewSubClass({
      updateType: "6",
      pageSize: "1",
      pageNum: "1",
      qString: teacherId,
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

  async getCourse(teacherId: string): Promise<any> {
    const value = await this.classService.viewCourse({
      updateType: "6",
      pageSize: "20",
      pageNum: "1",
      qString: teacherId,
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


  enterSearchMode() {
    this.sortMode = false;
    this.searchMode = true;
    this.toggleSearchInput();
  }

  exitSearchMode() {
    this.searchMode = false;
    this.errMessage = "";
    this.showError = false;
    this.pageNum = 1;
    this.noMoreTeachers = false;
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
    this.teacherService.viewTeacher({
      updateType: "3",
      pageSize: "20",
      pageNum: this.pageNum.toString(),
      qString: searchString,
    })
      .subscribe(res => {
        if (res.statuscode == 200) {
          res.dataResponse.forEach(teacher => {
            this.filterCards.push({
              showImage: true,
              altImage: "icon",
              cardData: teacher,
              imageSrc: teacher.dpUrl,
              details: {
                "Name": teacher.fullName.trim(),
                "Class": "Nil",
                "Subjects Offering": "Nil"
              }
            });
          });
          this.showError = false;
        }
        else if (res.statuscode == 204) {
          if (this.pageNum == 1) {
            this.errMessage = "Oops, no result ☹😝";
            this.showError = true;
            this.filterCards = [];
          }
          else {
            this.noMoreTeachers = true;
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
    this.noMoreTeachers = false;
    this.scroll.disabled = false;
    this.cards = [];
    this.filterCards = [];
    this.searchString = "";
    this.searchMode = false;
  }

  async add() {
    const modal = await this.modalCtrl.create({
      component: AddTeacherComponent,
      id: addTeacherModalID,
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
  }

  async view(e) {
    const modal = await this.modalCtrl.create({
      component: ViewTeacherComponent,
      id: viewTeacherModalID,
      componentProps: {
        "teacherId": e.cardData.teacherId
      }
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();

  }

  toggleSearchInput() {
    if(this.inputFirstLoad == true) {
      this.inputFirstLoad = false;
    }
  }

  ionViewWillEnter() {
    this.inputFirstLoad = true;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }
}
