import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { viewTermModalID } from 'src/app/models/components-id';
import { IEditInput } from 'src/app/models/list-model';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-view-term',
  templateUrl: './view-term.component.html',
  styleUrls: ['./view-term.component.scss'],
})
export class ViewTermComponent implements OnInit {

  @Input() termId: string;

  public isVerifying: boolean = false;
  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage = "";

  public details: IEditInput[] = [
    {
      id: EditInputs.Term,
      model: "",
      label: 'Term',
      hasHeader: true,
      headerTitle: 'Term Details',
      icon: 'looks_3',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Term).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        const value = await this.termService.updateTermName({
          termId: this.termId,
          term: this.getInput(EditInputs.Term).model?.trim(),
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
      id: EditInputs.Session,
      model: "",
      label: 'Term',
      icon: 'date_range',
      noEdit: true,
      type: 'text',
      inputChange: (e) => {
        
      },
      updateInput: async () => {
        return false;
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
        const value = await this.termService.updateTermStartDate({
          termId: this.termId,
          date
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
        const value = await this.termService.updateTermEndDate({
          termId: this.termId,
          date
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
  ) { }

  ngOnInit() {
    this.getTerm();
  }

  getTerm() {
    this.termService.viewTerm({
      updateType: "2",
      termId: this.termId,
      pageNum: "1",
      pageSize: "1",
    })
    .subscribe((res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        
        this.getInput(EditInputs.Term).model = response.term;
        this.getInput(EditInputs.StartDate).model = response.termStart;
        this.getInput(EditInputs.EndDate).model = response.termEnd;
        this.getInput(EditInputs.Session).model = response.schoolYear;
        this.getInput(EditInputs.Status).model = response.isCurrentTerm ? "Active" : "Inactive";
        this.getInput(EditInputs.Status).icon = response.isCurrentTerm ? "toggle_on" : "toggle_off";
      }
      else {
        this.presentToast(res.status);
      }
      
      this.isLoading = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
    });
  }

  getInput(id: EditInputs) {
    return this.details?.find(detail => detail.id == id);
  }

  setActive() {
    if(this.isVerifying) return;
    this.isVerifying = true;

    this.termService.setActiveTerm({ termId: this.termId })
    .subscribe(async res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        await this.presentToast("Successful");
        await this.termService.saveCredentials({ adminId: response.adminid, token: response.token });

        this.isLoading = true;
        this.getTerm();
      }
      else {
        this.presentToast(res.status);
      }

      this.isVerifying = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);

    })
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
    this.modalCtrl.dismiss('', '', viewTermModalID);
  }
}

enum EditInputs{
  Term,
  Session,
  StartDate,
  EndDate,
  Status
}
