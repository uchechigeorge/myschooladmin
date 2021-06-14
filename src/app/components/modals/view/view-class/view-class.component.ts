import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { ModalController, Platform, ToastController, LoadingController, AlertController } from '@ionic/angular';

import { IEditInput } from 'src/app/models/list-model';
import { viewClassModalID } from 'src/app/models/components-id';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

const LOADER_ID = "update-class-loader";

@Component({
  selector: 'app-view-class',
  templateUrl: './view-class.component.html',
  styleUrls: ['./view-class.component.scss'],
})
export class ViewClassComponent implements OnInit {

  @Input() classId: string;

  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage: string = "";
  public isDeleting: boolean = false;

  public details: IEditInput[] = [
    {
      id: EditInputs.ClassName,
      model: "",
      label: 'Class Name',
      icon: 'school',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.ClassName).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.classService.updateClassName({ classId: this.classId, className: this.getInput(EditInputs.ClassName).model?.trim() })
        .toPromise()
        .then(res => {
          if(res.statuscode == 200) {
            this.dismissLoading();
            this.classService.saveCredentials({
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
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        
        return value;
      }
    },
  ]
 
  public isVerifying: boolean = false;
  
  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private classService: ClassCourseService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private changeDetectorRef: ChangeDetectorRef,
    private alertCtrl: AlertController,
  ) { 
   
    this.setBackBtnPriority();
  }

  ngOnInit() {
    this.getClasses();
  }


  async getClasses() {
    
    this.classService.viewClass({
      updateType: "2",
      classId: this.classId,
      pageSize: "1",
      pageNum: "1",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        this.getInput(EditInputs.ClassName).model = response.className;
      }
      else if(res.statuscode == 204){
        this.errMessage = "No classes";
        this.showError = true;
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

  getInput(id: EditInputs) {
    return this.details?.find(detail => detail.id == id);
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

  setBackBtnPriority() {
    // this.platform.backButton.subscribeWithPriority(200, () => {
    //   this.selectElems.forEach(elem => {
    //     if(elem.panelOpen)
    //       elem.close();
    //   })
    // });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }
  
  delete() {
    if(this.isDeleting) return;

    this.isDeleting = true;

    this.classService.deleteClass({ classId: this.classId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.classService.saveCredentials({
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

  dismissModal() {
    this.modalCtrl.dismiss('', '', viewClassModalID);
  }
}

enum EditInputs{
  ClassName
}