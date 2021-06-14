import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { editSpecificFeesModalID } from 'src/app/models/components-id';
import { StudentService } from 'src/app/services/student.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { IEditInput } from 'src/app/models/list-model';

const LOADER_ID = "update-sfees-loader";


@Component({
  selector: 'app-edit-specific-fees',
  templateUrl: './edit-specific-fees.component.html',
  styleUrls: ['./edit-specific-fees.component.scss'],
})
export class EditSpecificFeesComponent implements OnInit {

  @Input() feesId: string;

  public DP: string;
  public studentFullName: string;
  public showError = false;
  public isLoading = true;
  public errMessage = "";
  public isDeleting: boolean = false;

  public details: IEditInput[] = [
    {
      id: EditInputs.Title,
      model: "",
      label: 'Title',
      icon: 'person',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Title).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.paymentService.updateSpecificFeesTitle({ specificFeesId: this.feesId, feesTitle: this.getInput(EditInputs.Title).model?.trim() })
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
      id: EditInputs.Amount,
      model: "0",
      label: 'Amount',
      icon: 'person',
      type: 'text',
      inputmode: "numeric",
      valiators: ['required', 'maxLength', "currency"],
      directives: "currency",
      inputChange: (e) => {
        this.getInput(EditInputs.Amount).model = e.model;
      },
      updateInput: async () => {
        let amount = this.getInput(EditInputs.Amount).model?.trim() as string;
        amount = amount.replace(/,/g, "");

        await this.showLoading();
        let value = await this.paymentService.updateSpecificFeesAmount({ specificFeesId: this.feesId, feesAmount: parseFloat(amount).toString() })
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
      id: EditInputs.Description,
      model: "",
      label: 'Description',
      icon: 'person',
      type: 'textarea',
      maxLength: 500,
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Description).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.paymentService.updateSpecificFeesDescription({ specificFeesId: this.feesId, feesDescription: this.getInput(EditInputs.Description).model?.trim() })
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
  ]


  constructor(
    private modalCtrl: ModalController,
    private studentService: StudentService,
    private toastCtrl: ToastController,
    private paymentService: ClassCourseService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.getFees();
  }

  getFees() {
    this.paymentService.viewSpecificFees({
      updateType: "2",
      qString: this.feesId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        let response = res.dataResponse[0];

        this.studentFullName = response.studentName;
        this.getInput(EditInputs.Title).model = response.title;
        this.getInput(EditInputs.Amount).model = response.amount;
        this.getInput(EditInputs.Description).model = response.description;
        this.getStudents(response.studentId);

        this.showError = false;
        this.errMessage = "";
                
      }
      else if(res.statuscode == 204){
       this.presentToast("Unkwown error. Try Again");
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
    
  async getStudents(studentId) {
    this.studentService.viewStudent({
      updateType: "2",
      pageSize: "10",
      pageNum: "1",
      studentId,
    })
    .subscribe(res => {
      if(res.statuscode == 200){
        let studentData = res.dataResponse[0];
       
        this.DP = studentData.dpUrl;
                
      }
      else if(res.statuscode == 204){
       this.presentToast("Unkwown error. Try Again");
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

  proceed(res: any) {
    if(res.statuscode == 200) {
      this.dismissLoading();

      this.studentService.saveCredentials({
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

    this.paymentService.deleteSpecificFee({ specificFeeId: this.feesId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.studentService.saveCredentials({
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
    this.modalCtrl.dismiss('', '', editSpecificFeesModalID);
  }
}


enum EditInputs{
  Title,
  Amount,
  Description
}