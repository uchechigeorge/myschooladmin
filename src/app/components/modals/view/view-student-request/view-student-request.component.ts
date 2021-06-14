import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, PopoverController, LoadingController } from '@ionic/angular';
import { viewStudentRequestModalID, editStudentRequestModalID } from 'src/app/models/components-id';
import { StudentService } from 'src/app/services/student.service';
import { ICardDetail } from 'src/app/models/card-models';
import { CHECK_INTERNET_CON, SUCCESS_RESPONSE } from 'src/app/components/login/login.component';
import { ListItemPopoverComponent } from 'src/app/components/popovers/list-item-popover/list-item-popover.component';
import { EditStudentRequestComponent } from '../edit-student-request/edit-student-request.component';

const LOADER_ID = "view-student-request-loader";

@Component({
  selector: 'app-view-student-request',
  templateUrl: './view-student-request.component.html',
  styleUrls: ['./view-student-request.component.scss'],
})
export class ViewStudentRequestComponent implements OnInit {

  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage: string = "";
  public pageNum = 1;
  public noOfStudents: number;
  public noMoreStudents = false;

  public cards: ICardDetail[] = [];

  constructor(
    private modalCtrl: ModalController,
    private studentService: StudentService,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.getStudentRequests();
  }

  async getStudentRequests() {
    this.studentService.viewStudentRequest({
      updateType: "1",
      pageNum: this.pageNum.toString(),
      pageSize: "20",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        response.forEach(async (student) => {
          this.cards.push({
            showImage: true,
            altImage: "icon",
            cardData: student,
            imageSrc: student.dpUrl,
            details: {
              "Name": (`${ student.firstName ?? "" } ${ student.lastName ?? ""} ${student.otherNames ?? ""}`)?.trim(),
              "Guardian": student.nextOfKin,
              "Contact": student.phonenum1 || student.phonenum2 ? (student.phonenum1 ? student.phonenum1 : student.phonenum2) : student.email
            }
          });
        });

      }
      else if(res.statuscode == 204) {
        if(this.pageNum == 1){
          this.errMessage = "No students";
          this.showError = true;
          this.noOfStudents = null;
        }
        else{
          this.noMoreStudents = true;
        }
      }
      else {
        this.presentToast(res.status);
      }

      this.isLoading = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isLoading = false;
    })
  }

  async loadData(e) {
    this.pageNum++;

    await this.getStudentRequests();

    if(this.noMoreStudents) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }
  }

  async showOptions(e, card) {
    const studentRequestId = card.cardData.studentRequestId;

    console.log(studentRequestId);
    const popover = await this.popoverCtrl.create({
      component: ListItemPopoverComponent,
      event: e,
      componentProps: {
        options: [
          {
            text: "Accept",
            handler: async () => {
              this.popoverCtrl.dismiss();

              await this.showLoading();

              this.studentService.acceptStudentRequest({ studentRequestId })
              .subscribe(async (res) => {
                if(res.statuscode == 200) {
                  const response = res.dataResponse;
                  this.presentToast(SUCCESS_RESPONSE);

                  await this.studentService.saveCredentials({
                    adminId: response.adminid,
                    token: response.token
                  });

                  this.refresh();
                }
                else {
                  this.presentToast(res.status);
                }

                this.dismissLoading();
              }, err => {
                this.dismissLoading();
                this.presentToast(CHECK_INTERNET_CON);
              })

            }
          },
          {
            text: "Decline",
            handler: async () => {
              this.popoverCtrl.dismiss();

              await this.showLoading();

              this.studentService.declineStudentRequest(studentRequestId)
              .subscribe(async (res) => {
                if(res.statuscode == 200) {
                  const response = res.dataResponse;
                  this.presentToast(SUCCESS_RESPONSE);

                  await this.studentService.saveCredentials({
                    adminId: response.adminid,
                    token: response.token
                  });

                  this.refresh();
                }
                else {
                  this.presentToast(res.status);
                }

                this.dismissLoading();
              }, err => {
                this.dismissLoading();
                this.presentToast(CHECK_INTERNET_CON);
              })

            }
          }
        ]
      }
    });

    await popover.present();

  }

  async edit(card) {
    const modal = await this.modalCtrl.create({
      component: EditStudentRequestComponent,
      id: editStudentRequestModalID,
      componentProps: {
        studentId: card.cardData.studentRequestId,
      }
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
  }

  refresh() {
    this.pageNum = 1;
    this.cards = [];
    this.isLoading = true;
    this.noMoreStudents = false;
    this.noOfStudents = null;
    this.showError = false;

    this.getStudentRequests();
  }

  async showLoading(message?: string) {
    if(!message) message = "Uploading ...";
    const loader = await this.loadingCtrl.create({
      id: LOADER_ID,
      message,
      spinner: "crescent",
    });

    return await loader.present();
  }

  async dismissLoading() {
    await this.loadingCtrl.dismiss();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  dismissModal() {
    this.modalCtrl.dismiss('', '', viewStudentRequestModalID);
  }
}
