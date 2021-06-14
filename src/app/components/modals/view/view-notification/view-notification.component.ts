import { Component, OnInit, Input } from '@angular/core';
import { viewNotificationModalID } from 'src/app/models/components-id';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IEditInput } from 'src/app/models/list-model';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

const LOADER_ID = "view-notification-loader";

@Component({
  selector: 'app-view-notification',
  templateUrl: './view-notification.component.html',
  styleUrls: ['./view-notification.component.scss'],
})
export class ViewNotificationComponent implements OnInit {

  @Input() notificationId: string;

  public isLoading: boolean = true;
  public errMessage: string = "";
  public showError: boolean = false;

  public isEditingRange = false;
  public isDeleting = false;
  public DP: string;

  public details: IEditInput[] = [
    {
      model: "",
      id: EditInput.Title,
      label: "Title",
      icon: "title",
      type: "text",
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.getInput(EditInput.Title).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.notificationService.updateNotificationTitle({ notificationId: this.notificationId, title: this.getInput(EditInput.Title).model?.trim() })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        
        return value;
      }

    },
    {
      model: "",
      id: EditInput.Description,
      label: "Description",
      icon: "description",
      type: "textarea",
      valiators: ['required'],
      maxLength: "max",
      inputChange: (e) => {
        this.getInput(EditInput.Description).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.notificationService.updateNotificationDescription({ notificationId: this.notificationId, description: this.getInput(EditInput.Description).model?.trim() })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        
        return value;
      }

    }
  ]

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private notificationService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.getNotification();
  }

  async getNotification() {
    this.notificationService.viewNotifications({
      updateType: "1",
      notificationId: this.notificationId,
      pageSize: "1",
      pageNum: "1",
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        const response = res.dataResponse[0];
        this.getInput(EditInput.Title).model = response.title;
        this.getInput(EditInput.Description).model = response.description;

        this.DP = response.imageUrl;
      } 
      else {
        this.presentToast(res.status);
      }

      this.isLoading = false;

    }, (err) => {
      this.isLoading = false;
      console.log(err);
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  getInput(id: EditInput) {
    return this.details.find(input => input.id == id);
  }

  proceed(res: any) {
    if(res.statuscode == 200) {
      this.dismissLoading();

      this.notificationService.saveCredentials({
        adminId: res.dataResponse.adminid,
        token: res.dataResponse.token
      });
      this.presentToast("Successful");
      return true;
    }
    else {
      this.dismissLoading();
      this.presentToast(res.status);
      return false;
    }
  }

  delete() {
    if(this.isDeleting) return;

    this.isDeleting = true;

    this.notificationService.deleteNotification({ notificationId: this.notificationId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.notificationService.saveCredentials({
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

  async showLoading(message?: string) {
    if(!message) message = "Uploading credentials";
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
    this.modalCtrl.dismiss('', '', viewNotificationModalID);
  }
}

enum EditInput {
  Title,
  Description
}