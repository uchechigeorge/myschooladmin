import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ICardDetail, IFilterCard } from 'src/app/models/card-models';
import { PopoverController, ModalController, ToastController, IonInput, IonInfiniteScrollContent, IonInfiniteScroll } from '@ionic/angular';
import { studentMenuPopOverID, radioPopOverID, addStudentModalID, viewStudentModalID, viewStudentRequestModalID } from 'src/app/models/components-id';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { IRadioPopover } from 'src/app/models/shadow-component-models';
import { RadioPopoverComponent } from 'src/app/components/popovers/radio-popover/radio-popover.component';
import { AddStudentComponent } from 'src/app/components/modals/add/add-student/add-student.component';
import { ViewStudentComponent } from 'src/app/components/modals/view/view-student/view-student.component';
import { StudentService } from 'src/app/services/student.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { ViewStudentRequestComponent } from 'src/app/components/modals/view/view-student-request/view-student-request.component';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit {

  public cards: ICardDetail[] = [];
  public filterCards: ICardDetail[] = [];
  public searchMode: boolean = false;
  public searchString: string = '';
  public studentsStatus: 'active' | 'inactive' | 'all' = 'active';
  public filterData: IFilterCard[] = [];
  public inputFirstLoad: boolean = true;
  public showError = false;
  public isLoading = true;
  public errMessage = "";
  public pageNum = 1;
  public pageTitle = "Active";
  // Flag to check if data from server in exhausted, for disabling ion infinite scroll
  public noMoreStudents = false;
  public noOfStudents: number;
  public noOfStudentsRequests: number;

  @ViewChild('scroll') scroll: IonInfiniteScroll;

  constructor(
    private studentService: StudentService,
    private classService: ClassCourseService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
  ) { 
  }

  ngOnInit() { }

  ionViewDidEnter() {
    this.isLoading = false;
    this.reset();
    this.getStudents();
    this.getStudentRequests();
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
    this.noMoreStudents = false;
    this.scroll.disabled = false;
  }

  async showMenu(e) {
    const options: IRadioPopover[] = [
      {
        text: 'Active',
        value: 'active',
      },
      {
        text: 'Inactive',
        value: 'inactive',
      },
      {
        text: 'All',
        value: 'all',
      },
    ]
    const popover = await this.popoverCtrl.create({
      component: RadioPopoverComponent,
      id: radioPopOverID,
      event: e,
      componentProps: {
        'value': this.studentsStatus,
        options
      }
    });

    await popover.present();
    const { data } = await popover.onWillDismiss();
    if(data == 'all' || data == 'active' || data == 'inactive') {
      this.studentsStatus = data;

      this.isLoading = true;
      this.cards = [];
      this.pageNum = 1;
      this.getStudents();
      this.pageTitle = options.find(opt => opt.value == data).text;
    }
  }

  async refresh(e?) {
    if(this.isLoading) return;
    this.reset();

    this.isLoading = true;
    this.pageNum = 1;
    if(this.searchMode) {
      this.filterCards = [];
      this.search();
    }
    else {
      this.cards = [];
      await this.getStudents();
      this.getStudentRequests();
    }
    e?.target.complete();
  }

  async loadData(e) {
    this.pageNum++;
    if(this.searchMode){
      this.searchRemote(this.searchString.trim());
    }
    else {
      await this.getStudents();
    }

    if(this.noMoreStudents) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

  }

  async getStudents() {
    let updateType = "1";
    if(this.studentsStatus == "all") updateType = "10";
    if(this.studentsStatus == "inactive") updateType = "13";
    this.studentService.viewStudent({
      updateType,
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
              "Class": "",
              "Courses Offering": "",
            }
          });
        });

        this.noOfStudents = res.dataResponse[0].totalRows;
        this.cards.forEach(async card => {
          card.details = {
            "Name": card.cardData.fullName,
            "Class": (await this.getClass(card.cardData.studentId))?.subClassName,
            "Subjects Offering": (await this.getCourse(card.cardData.studentId))[0]?.totalRows
          }
        });

        this.errMessage = "";
        this.showError = false;
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No students";
          this.showError = true;
          this.noOfStudents = null;
        }
        else{
          this.noMoreStudents = true;
        }
      }
      else if(res.statuscode == 401) {
        this.errMessage = "Unauthorised";
        this.showError = true;
        this.noOfStudents = null;
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

  async getStudentRequests() {
    this.studentService.viewStudentRequest({
      updateType: "1",
      pageNum: "1",
      pageSize: "1",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        this.noOfStudentsRequests = res.dataResponse[0].totalRows;
      }
      else {
        this.noOfStudentsRequests = null;
      }
    }, err => {
      this.noOfStudentsRequests = null;
    })
  }

  async viewRequests() {
    if(!this.noOfStudentsRequests) return;
    
    const modal = await this.modalCtrl.create({
      component: ViewStudentRequestComponent,
      id: viewStudentRequestModalID,
    });

    await modal.present();
    await modal.onWillDismiss();

    this.getStudentRequests();
    this.refresh();
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
    let updateType = "3";
    if(this.studentsStatus == "all") updateType = "12";
    if(this.studentsStatus == "inactive") updateType = "13";
    this.studentService.viewStudent({
      updateType,
      pageSize: "10",
      pageNum: this.pageNum.toString(),
      qString: searchString,
    })
      .subscribe(res => {
        if (res.statuscode == 200) {
          res.dataResponse.forEach(student => {
            this.filterCards.push({
              showImage: true,
              altImage: "icon",
              cardData: student,
              imageSrc: student.dpUrl,
              details: {
                "Name": student.fullName.trim(),
                "Class": "Nil",
                "Subjects Offering": "Nil"
              }
            });
          });
          this.showError = false;

          this.filterCards.forEach(async card => {
            card.details = {
              "Name": card.cardData.fullName,
              "Class": (await this.getClass(card.cardData.studentId))?.subClassName,
              "Subjects Offering": (await this.getCourse(card.cardData.studentId))[0]?.totalRows
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
            this.noMoreStudents = true;
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

  async getClass(studentId: string): Promise<any> {
    const value = await this.classService.viewSubClass({
      updateType: "5",
      pageSize: "1",
      pageNum: "1",
      qString: studentId,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        return response[0];
      }
      else {
        return null;
      }
    }, err => {
      return null;
    });

    return value;
  }

  async getCourse(studentId: string): Promise<any> {
    const value = await this.classService.viewCourse({
      updateType: "5",
      pageSize: "20",
      pageNum: "1",
      qString: studentId,
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

  reset() {
    this.pageNum = 1;
    this.showError = false;
    this.errMessage = "";
    this.noMoreStudents = false;
    this.scroll.disabled = false;
    this.cards = [];
    this.filterCards = [];
    this.searchString = "";
    this.searchMode = false;
  }

  async view(e) {
    const modal = await this.modalCtrl.create({
      component: ViewStudentComponent,
      id: viewStudentModalID,
      componentProps: {
        "studentId": e.cardData.studentId,
        "active": this.studentsStatus
      }
    });

    await modal.present();
    await modal.onWillDismiss()
    this.refresh();
  }

  async add() {
    const modal = await this.modalCtrl.create({
      component: AddStudentComponent,
      id: addStudentModalID,
    });

    await modal.present();
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

