import { Component, OnInit, Input } from '@angular/core';
import { IEditInput } from 'src/app/models/list-model';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { viewSessionModalID } from 'src/app/models/components-id';

@Component({
  selector: 'app-view-session',
  templateUrl: './view-session.component.html',
  styleUrls: ['./view-session.component.scss'],
})
export class ViewSessionComponent implements OnInit {

  @Input() sessionId: string;

  public isVerifying: boolean = false;
  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage = "";

  public isDeleting = false;

  public details: IEditInput[] = [
    {
      id: EditInputs.Session,
      model: "",
      label: 'School Year',
      hasHeader: true,
      headerTitle: 'School Year Details',
      icon: 'looks_3',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Session).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        const value = await this.termService.updateSessionName({
          sessionId: this.sessionId,
          session: this.getInput(EditInputs.Session).model?.trim(),
        }).toPromise()
        .then((res) => {
          if(res.statuscode == 200) {
            const response = res.dataResponse;
            this.presentToast("Successful");
            this.termService.saveCredentials({ adminId: response.adminid, token: response.token });
            this.dismissLoading();
            return true;
          }
          else {
            this.presentToast(res.status);
            this.dismissLoading();
            return false;
          }
        }, err => {
          this.presentToast(CHECK_INTERNET_CON);
            this.dismissLoading();
            return false;
        })
        return value;
      }
    },
    {
      id: EditInputs.StartDate,
      model: "",
      label: 'Resumption',
      icon: 'event_available',
      type: 'date',
      inputChange: (e) => {
        this.getInput(EditInputs.StartDate).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        const date = new Date(this.getInput(EditInputs.StartDate).model).toLocaleDateString();
        const value = await this.termService.updateSessionStartDate({
          sessionId: this.sessionId,
          date
        }).toPromise()
        .then(async (res) => {
          if(res.statuscode == 200) {
            const response = res.dataResponse;
            await this.presentToast("Successful");
            await this.termService.saveCredentials({ adminId: response.adminid, token: response.token });
            await this.dismissLoading();
            return true;
          }
          else {
            await this.presentToast(res.status);
            await this.dismissLoading();
            return false;
          }

        }, async (err) => {
          await this.presentToast(CHECK_INTERNET_CON);
          await this.dismissLoading();
          return false;
        })
        return value;
      }
    },
    {
      id: EditInputs.EndDate,
      model: "",
      label: 'Vacation',
      icon: 'event_busy',
      type: 'date',
      inputChange: (e) => {
        this.getInput(EditInputs.EndDate).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        const date = new Date(this.getInput(EditInputs.EndDate).model).toLocaleDateString();
        const value = await this.termService.updateSessionEndDate({
          sessionId: this.sessionId,
          date
        }).toPromise()
        .then(async (res) => {
          if(res.statuscode == 200) {
            const response = res.dataResponse;
            await this.presentToast("Successful");
            await this.termService.saveCredentials({ adminId: response.adminid, token: response.token });
            await this.dismissLoading();
            return true;
          }
          else {
            await this.presentToast(res.status);
            await this.dismissLoading();
            return false;
          }

        }, async (err) => {
          await this.presentToast(CHECK_INTERNET_CON);
          await this.dismissLoading();
            return false;
        })
        return value;
      }
    },
    {
      id: EditInputs.Status,
      model: "",
      label: 'Status',
      icon: 'toggle_off',
      type: 'text',
      noEdit: true,
      inputChange: (e) => {
      },
      updateInput: async () => {
        return false;
      }
    },
  ]

  constructor(
    private modalCtrl: ModalController,
    private termService: ClassCourseService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    this.getSession();
  }

  getSession() {
    this.termService.viewSession({
      updateType: "2",
      sessionId: this.sessionId,
      pageNum: "1",
      pageSize: "1",
    })
    .subscribe((res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        
        this.getInput(EditInputs.Session).model = response.schoolYear;
        this.getInput(EditInputs.StartDate).model = response.sessionStart;
        this.getInput(EditInputs.EndDate).model = response.sessionEnd;
        this.getInput(EditInputs.Status).model = response.isCurrent ? "Active" : "Inactive";
        this.getInput(EditInputs.Status).icon = response.isCurrent ? "toggle_on" : "toggle_off";
      }
      else {
        this.presentToast(res.status);
      }
      
      this.isLoading = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
    });
  }

  delete() {
    if(this.isDeleting) return;

    this.isDeleting = true;

    this.termService.deleteSession({ sessionId: this.sessionId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.termService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token
        });
        await this.presentToast("Successful");
        this.dismissModal();
      }
      else {
        await this.presentToast(res.status);
      }
      
      this.isDeleting = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isDeleting = false;
    })
  }

  async showDeleteAlert() {
    const alert = await this.alertCtrl.create({
      header: "Alert",
      message: "Are you sure want to delete?",
      buttons: [
        { text: "Yes", handler: () => this.delete() },
        { text: "Cancel", role: "cancel" }
      ]
    });

    await alert.present();
  }

  getInput(id: EditInputs) {
    return this.details?.find(detail => detail.id == id);
  }

  async showLoading(message?: string) {
    if(!message) message = "Uploading credentials";
    const loader = await this.loadingCtrl.create({
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
    this.modalCtrl.dismiss('', '', viewSessionModalID);
  }
}

enum EditInputs{
  Session,
  StartDate,
  EndDate,
  Status
}
