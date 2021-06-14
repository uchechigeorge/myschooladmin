import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalController, IonInfiniteScroll, ToastController, LoadingController } from '@ionic/angular';
import { viewSpecificPaymentModalID, searchSpecificPaymentModalID, addStudentPaymentsModalID, editSpecificFeesModalID } from 'src/app/models/components-id';
import { ICardDetail } from 'src/app/models/card-models';
import { StudentService } from 'src/app/services/student.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { IEditInput, ISelectOptions } from 'src/app/models/list-model';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { AddStudentPaymentComponent } from '../../add/add-student-payment/add-student-payment.component';
import { FormControl } from '@angular/forms';
import { EditSpecificFeesComponent } from '../edit-specific-fees/edit-specific-fees.component';

const LOADER_ID = "get-fees-loader";

@Component({
  selector: 'app-view-specific-fees',
  templateUrl: './view-specific-fees.component.html',
  styleUrls: ['./view-specific-fees.component.scss'],
})
export class ViewSpecificFeesComponent implements OnInit {

  @Input() studentId: string;

  public formControl = new FormControl("");

  public cards: ICardDetail[] = [];
  public showError = false;
  public isLoading = false;
  public errMessage = "";
  public pageNum = 1;
  public noMoreValues = false;
  public selectTerms: ISelectOptions[] = [];

  public studentFullName: string;
  public DP: string;
  public selectedTerm: string;  

  
  public details: IEditInput[] = [];
  
  @ViewChild('scroll') scroll: IonInfiniteScroll;

  constructor(
    private modalCtrl: ModalController,
    private studentService: StudentService,
    private toastCtrl: ToastController,
    private paymentService: ClassCourseService,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {
    this.getStudents();
    this.getTerms();
  }

  async getFees() {

    const termId = this.formControl.value;

    this.paymentService.viewSpecificFees({
      updateType: "1",
      termId,
      studentId: this.studentId,
    })
    .subscribe(res => {
      if(res.statuscode == 200){
        let response = res.dataResponse as Array<any>;
        response.forEach(payment => {
          this.cards.push({
            showImage: false,
            cardData: payment,
            details: {
              "Title": payment.title,
              "Amount": payment.amount,
              "Description": payment.description,
            },
          })
        })
      }
      else {
        this.presentToast(res.status);
      }

      this.dismissLoading();
      
    }, (err) => {
      this.dismissLoading();

      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  async getStudents() {
    this.studentService.viewStudent({
      updateType: "2",
      pageSize: "10",
      pageNum: "1",
      studentId: this.studentId,
    })
    .subscribe(res => {
      if(res.statuscode == 200){
        let response = res.dataResponse[0];
        this.studentFullName = response.fullName;
        this.DP = response.dpUrl;
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

  async getTerms() {
    this.paymentService.viewTerm({
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

  async loadData(e) {
    this.pageNum++;
    // await this.getStudents();
    if(this.noMoreValues) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

  }

  async onInputChange() {
    const term = this.formControl.value;
    if(!term || term == "") return;

    await this.showLoading();
    this.getFees();
  }

  
  async add() {
    const termId = this.formControl.value;
    const modal = await this.modalCtrl.create({
      component: AddStudentPaymentComponent,
      id: addStudentPaymentsModalID,
      componentProps: {
        "studentId": this.studentId,
        termId
      }
    });
    
    await modal.present();
    await modal.onWillDismiss();
    this.cards = [];
    this.onInputChange();
  }

  async view(e) {
    const modal = await this.modalCtrl.create({
      component: EditSpecificFeesComponent,
      id: editSpecificFeesModalID,
      componentProps: {
        "feesId": e.cardData.specificFeesId
      }
    });
    
    await modal.present();
    await modal.onWillDismiss();
    this.cards = [];
    this.onInputChange();
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

  dismissModal() {
    this.modalCtrl.dismiss('', '', viewSpecificPaymentModalID);
  }
}


interface FeesModel{ 
  feesTitle: string, 
  feesAmount: string, 
  description?: string 
}