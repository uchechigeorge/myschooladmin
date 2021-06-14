import { Component, OnInit, ViewChild } from '@angular/core';
import { ICardDetail, IFilterCard } from 'src/app/models/card-models';
import { ApiDataService } from 'src/app/services/api-data.service';
import { PopoverController, ModalController, ToastController, IonInfiniteScroll } from '@ionic/angular';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { RadioPopoverComponent } from 'src/app/components/popovers/radio-popover/radio-popover.component';
import { radioPopOverID, addClassModalID, viewClassModalID, viewSubClassModalID } from 'src/app/models/components-id';
import { IRadioPopover } from 'src/app/models/shadow-component-models';
import { AddClassComponent } from 'src/app/components/modals/add/add-class/add-class.component';
import { ViewClassComponent } from 'src/app/components/modals/view/view-class/view-class.component';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { TeacherService } from 'src/app/services/teacher.service';
import { StudentService } from 'src/app/services/student.service';
import { ViewSubClassComponent } from 'src/app/components/modals/view/view-sub-class/view-sub-class.component';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.page.html',
  styleUrls: ['./classes.page.scss'],
})
export class ClassesPage implements OnInit {

  public filterCards: ICardDetail[] = [];
  public classCards: SessionExpansionCard[] = [];
  public searchMode: boolean = false;
  public searchString: string = '';
  public inputFirstLoad: boolean = true;

  public isLoading: boolean = true;
  public errMessage: string = "";
  public showError: boolean = false;
  public pageNum: number = 1;
  public noOfClasses: number;
  public noMoreClasses: boolean = false;

  @ViewChild('scroll') scroll: IonInfiniteScroll;


  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private classService: ClassCourseService,
    private teacherService: TeacherService,
    private studentService: StudentService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.isLoading = true;
    this.reset();
    this.getClasses();
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
      this.classCards = [];
      await this.getClasses();
    }
    e?.target.complete()
  }

  async loadData(e) {
    this.pageNum++;
    if(this.searchMode){
      // await this.searchRemote(this.searchString.trim());
    }
    else {
      await this.getClasses();
    }

    if(this.noMoreClasses) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

  }

  async getClasses() {
    
    this.classService.viewClass({
      updateType: "1",
      pageSize: "20",
      pageNum: this.pageNum.toString(),
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        res.dataResponse.forEach(aClass => {
          this.classCards.push({
            id: aClass.classId,
            title: aClass.className,
            cardData: aClass,
            isLoading: true,
            pageNum: 1,
            childCards: [],
            description: aClass.isCurrent ? "Current" : "",
            onOpen: () => {
              this.getSubClasses(aClass.classId);
            },
            refresh: async (e) => {
              this.getChildCard(aClass.classId).isLoading = true;
              this.getChildCard(aClass.classId).childCards = [];
              this.getChildCard(aClass.classId).pageNum = 1;
              await this.getSubClasses(aClass.classId);
              e?.target.complete();
            },
            onClose: () => {
              this.getChildCard(aClass.classId).childCards = [];
            },
            actionClick: async () => {
              const modal = await this.modalCtrl.create({
                component: ViewClassComponent,
                id: viewClassModalID,
                componentProps: {
                  "classId": aClass.classId
                }
              });

              await modal.present();
              await modal.onWillDismiss();
              this.refresh(); 
            }
          });
        });
        this.noOfClasses = res.dataResponse[0].totalRows;
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No classes";
          this.showError = true;
        }
        else{
          this.noMoreClasses = true;
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

  async getSubClasses(id: any) {
    this.getChildCard(id).isLoading = true;
    this.classService.viewSubClass({
      updateType: "4",
      pageSize: "20",
      pageNum: "1",
      qString: id,
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        res.dataResponse.forEach(subClass => {
          this.getChildCard(id).childCards.push(
            {
              showImage: false,
              cardData: subClass,
              details: {
                "Name": subClass.subClassName,
                "Teacher(s)": "",
                "Number of students": ""
              },
              btnClick: async () => {
                const modal = await this.modalCtrl.create({
                  component: ViewSubClassComponent,
                  id: viewSubClassModalID,
                  componentProps: {
                    "subClassId": subClass.subClassId
                  }
                });
  
                await modal.present();
                await modal.onWillDismiss();
                this.refresh();
              }
          });

          this.getChildCard(id).childCards.forEach(async card => {
            const classTeachers = (await this.getTeachers(card.cardData.subClassId)) as Array<any>;
            const classStudents = (await this.getStudents(card.cardData.subClassId)) as Array<any>;
            card.details = {
              "Name": card.cardData.subClassName,
              "Teacher(s)": classTeachers.length <= 1 ? classTeachers[0].fullName : classTeachers[0].fullName + " and " + (classTeachers.length - 1).toString() + " other(s)",
              "Number of Students": classStudents[0].totalRows,
            }
          });
        });
        this.getChildCard(id).isLoading = false;
        this.getChildCard(id).showError = false;
      }
      else if(res.statuscode == 204) {
        if(this.getChildCard(id).pageNum == 1){
          this.getChildCard(id).errMessage = "No sub classes";
          this.getChildCard(id).showError = true;
        }
      }
      else if(res.statuscode == 401) {
        this.getChildCard(id).errMessage = "Unauthorized";
        this.getChildCard(id).showError = true;
      }
      else {
        this.presentToast(res.status);
      }

      this.getChildCard(id).isLoading = false;

    }, (err) => {
      this.getChildCard(id).isLoading = false;

      this.presentToast(CHECK_INTERNET_CON);
    })

  }

  async getTeachers(classId: string): Promise<any> {
    const value = await this.teacherService.viewTeacher({
      updateType: "4",
      pageSize: "20",
      pageNum: "1",
      qString: classId,
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

  async getStudents(classId: string): Promise<any> {
    const value = await this.studentService.viewStudent({
      updateType: "4",
      pageSize: "1",
      pageNum: "1",
      qString: classId,
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

  getChildCard(id: any) {
    return this.classCards.find(card => card.id == id);
  }

  enterSearchMode() {
    this.searchMode = true;
    this.toggleSearchInput();
  }

  reset() {
    this.pageNum = 1;
    this.showError = false;
    this.errMessage = "";
    this.noMoreClasses = false;
    this.scroll.disabled = false;
    this.classCards = [];
    this.filterCards = [];
    this.searchString = "";
    this.searchMode = false;
  }

  exitSearchMode() {
    this.searchMode = false;
    this.errMessage = "";
    this.showError = false;
    this.pageNum = 1;
    this.noMoreClasses = false;
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
    this.classService.viewSubClass({
      updateType: "3",
      pageSize: "20",
      pageNum: this.pageNum.toString(),
      qString: searchString,
    })
      .subscribe(async (res) => {
        if (res.statuscode == 200) {
          res.dataResponse.forEach(subClass => {
            this.filterCards.push({
              showImage: false,
              cardData: subClass,
              details: {
                "Name": subClass.subClassName,
                "Teacher(s)": "",
                "Number of students": ""
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

          this.filterCards.forEach(async card => {
            const classTeachers = (await this.getTeachers(card.cardData.subClassId)) as Array<any>;
            const classStudents = (await this.getStudents(card.cardData.subClassId)) as Array<any>;
            card.details = {
              "Name": card.cardData.subClassName,
              "Teacher(s)": classTeachers.length <= 1 ? classTeachers[0].fullName : classTeachers[0].fullName + " and " + (classTeachers.length - 1).toString() + " other(s)",
              "Number of Students": classStudents[0].totalRows,
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
            this.noMoreClasses = true;
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

  async add(e) {
    const modal = await this.modalCtrl.create({
      component: AddClassComponent,
      id: addClassModalID,
      componentProps: {
        'type': e
      }
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
  }

  async view(e) {
    const modal = await this.modalCtrl.create({
      component: ViewSubClassComponent,
      id: viewSubClassModalID,
      componentProps: {
        "subClassId": e.cardData.subClassId
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


class SessionExpansionCard{
  id?: any;
  title: string;
  description?: string;
  cardData?: any;
  childCards?: ICardDetail[] = [];
  isLoading?: boolean = false;
  errMessage?: string;
  showError?: boolean;
  pageNum?: number;
  onOpen?: () => any;
  onClose?: () => any;
  refresh?: (e: any) => any;
  actionClick?: (e: any) => any;
}