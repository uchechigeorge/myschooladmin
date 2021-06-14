import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { editGradeModalID } from 'src/app/models/components-id';
import { IEditInput } from 'src/app/models/list-model';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';

const LOADER_ID = "update-course-loader";

@Component({
  selector: 'app-edit-grade',
  templateUrl: './edit-grade.component.html',
  styleUrls: ['./edit-grade.component.scss'],
})
export class EditGradeComponent implements OnInit {

  @Input() gradeId: string;

  public isLoading: boolean = true;
  public errMessage: string = "";
  public showError: boolean = false;

  public formGroup = new FormGroup({
    canEdit: new FormControl(false),
    min: new FormControl('', [ Validators.maxLength(50) ]),
    max: new FormControl('', [ Validators.maxLength(50) ]),
  });

  public isEditingRange = false;
  public isDeleting = false;

  public details: IEditInput[] = [
    {
      model: "",
      id: EditInput.Grade,
      label: "Grade",
      icon: "grade",
      type: "text",
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInput.Grade).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.gradeService.updateGrade({ gradeId: this.gradeId, grade: this.getInput(EditInput.Grade).model?.trim() })
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
      id: EditInput.Remark,
      label: "Remark",
      icon: "lightbulb",
      type: "textarea",
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.getInput(EditInput.Remark).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.gradeService.updateGradeRemark({ gradeId: this.gradeId, remark: this.getInput(EditInput.Remark).model?.trim() })
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
    private gradeService: ClassCourseService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.getGrades();
  }

  async getGrades() {
    this.gradeService.viewGrades({
      updateType: "2",
      gradeId: this.gradeId,
      pageSize: "20",
      pageNum: "1",
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        const response = res.dataResponse[0];
        this.getInput(EditInput.Grade).model = response.grade;
        this.getInput(EditInput.Remark).model = response.remark;

        this.formGroup.get("min").setValue(response.minValue);
        this.formGroup.get("max").setValue(response.maxValue);
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

  editRange() {
    if(this.formGroup.invalid || this.isEditingRange) return;

    this.isEditingRange = true;

    const min = this.formGroup.get("min").value;
    const max = this.formGroup.get("max").value;

    this.gradeService.updateGradeRange({ gradeId: this.gradeId, min, max })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        this.gradeService.saveCredentials({
          adminId: response.adminid,
          token: response.token,
        });

        this.presentToast("Successful");
      }
      else {
        this.presentToast(res.status);
      }
      
      this.isEditingRange = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isEditingRange = false;
    })
  }

  proceed(res: any) {
    if(res.statuscode == 200) {
      this.dismissLoading();

      this.gradeService.saveCredentials({
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

    this.gradeService.deleteGrade({ gradeId: this.gradeId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.gradeService.saveCredentials({
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
    this.modalCtrl.dismiss('', '', editGradeModalID);
  }
}

enum EditInput {
  Grade,
  Remark
}