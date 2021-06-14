import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { IEditInput, ISelectMultipleOptions, ISelectOptions } from 'src/app/models/list-model';
import { ViewStudentComponent } from '../view-student/view-student.component';
import { viewStudentModalID, viewPaymentsModalID, addPaymentsModalID, editGeneralFeesModalID } from 'src/app/models/components-id';
import { FormGroup, FormControl } from '@angular/forms';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { AddPaymentComponent } from '../../add/add-payment/add-payment.component';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { MatTableDataSource } from '@angular/material/table';
import { EditGeneralFeesComponent } from '../edit-general-fees/edit-general-fees.component';

const LOADER_ID = "get-payment-loader";

@Component({
  selector: 'app-view-payments',
  templateUrl: './view-payments.component.html',
  styleUrls: ['./view-payments.component.scss'],
})
export class ViewPaymentsComponent implements OnInit {

  public formGroup = new FormGroup({
    "term": new FormControl(""),
    "class": new FormControl("")
  })

  public selectClasses: ISelectMultipleOptions[] = [];
  public selectTerms: ISelectOptions[] = [];

  // public feesTableData: FeesModel[] = [];
  public dataSource = new MatTableDataSource<FeesModel>();
  public displayColumns: string[] = ['fees', 'amount', 'description', 'select'];

  public showError = false;
  public isLoading = true;
  public errMessage = "";
  public isAuthorised = true;

  constructor(
    private modalCtrl: ModalController,
    private classService: ClassCourseService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.getClasses();
    this.getTerms();
  }

  async onInputChange() {
    const termId = this.formGroup.get('term').value;
    const classId = this.formGroup.get('class').value;

    if(!termId || !classId) return;
    await this.showLoading();

    this.dataSource = new MatTableDataSource([]);
    this.classService.viewGeneralFees({
      updateType: "1",
      classId,
      termId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;

        let data: FeesModel[] = [];
        response.forEach(fee => {
          data.push({
            fees: fee.title,
            amount: fee.amount,
            description: fee.description,
            select: fee
          });
        });

        this.dataSource = new MatTableDataSource(data);
        this.isAuthorised = true;

      }
      else if(res.statuscode == 401) {
        this.isAuthorised = false;
        this.errMessage = "Unauthorised";
        this.showError = true;
      }

      else{
        this.presentToast(res.status);
      }

      this.dismissLoading();
    }, err => {
      this.dismissLoading();
      this.presentToast(CHECK_INTERNET_CON);
    })


  }

  async getTerms() {
    this.classService.viewTerm({
      updateType: "10",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        response.forEach(term => {
          this.selectTerms.push({
            text: term.term + this.getPosition(term.term) + " Term-" + term.schoolYear,
            value: term.termId,
          })
        })
      }
    })
  }

  async getClasses() {
    const selectClasses: ISelectMultipleOptions[] = [];
    const classes = await this.classService.viewClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    const subClasses = await this.classService.viewSubClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    if(!classes || !subClasses) return;

    classes.forEach(c => {
      c.subClasses = [];
      subClasses.forEach(s => {
        if(s.parentClassId == c.classId)
          c.subClasses.push(s);
      });
    });

    classes.forEach(c => {
      if(c.subClasses.length > 0){
        selectClasses.push({
          label: c.className,
          options: c.subClasses.map(s => {
            return {
              text: s.subClassName,
              value: s.subClassId,
            }
          })
        })
      }
    })

    this.selectClasses = selectClasses;
    return selectClasses;
  }

  async add() {
    const termId = this.formGroup.get('term').value;
    const classId = this.formGroup.get('class').value;

    const modal = await this.modalCtrl.create({
      component: AddPaymentComponent,
      id: addPaymentsModalID,
      componentProps:{
        termId,
        classId
      }
    });

    return await modal.present();
  }

  async edit(e) {
    const modal = await this.modalCtrl.create({
      component: EditGeneralFeesComponent,
      id: editGeneralFeesModalID,
      componentProps: {
        "feesId": e.select.generalFeesId,
      }
    })

    await modal.present();
    await modal.onWillDismiss();
    this.reset();
  }

  reset() {
    this.dataSource = new MatTableDataSource([]);
    this.formGroup.get("term").setValue("");
    this.formGroup.get("class").setValue("");
  }


  getPosition(value: number): string {
    if(isNaN(value)) return "";
    if(value % 100 > 10 && value % 100 < 20) {
      return 'th';
    }
    else if(value % 10 == 1) {
      return 'st';
    }
    else if(value % 10 == 2) {
      return 'nd';
    }
    else if(value % 10 == 3) {
      return 'rd';
    }
    else if(!value){
      return '';
    }
    else {
      return 'th';
    }
  }


  async showLoading(message?: string) {
    if(!message) message = "Please wait...";
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
    this.modalCtrl.dismiss('', '', viewPaymentsModalID);
  }
}

interface FeesModel {
  fees: string, 
  amount?: string, 
  description?: string,
  select?: string,
}