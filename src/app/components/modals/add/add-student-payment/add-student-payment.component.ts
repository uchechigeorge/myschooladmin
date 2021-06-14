import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';

import { requiredField, negativeValidator, validAmount } from 'src/app/helpers/input-validators';
import { ISelectOptions } from 'src/app/models/list-model';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { addStudentPaymentsModalID } from 'src/app/models/components-id';
import { StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-add-student-payment',
  templateUrl: './add-student-payment.component.html',
  styleUrls: ['./add-student-payment.component.scss'],
})
export class AddStudentPaymentComponent implements OnInit {

  @Input() studentId: string;
  @Input() termId: string;

  public formGroup = new FormGroup({
    "term": new FormControl("", [ requiredField ]),
    "title": new FormControl("", [ requiredField, Validators.maxLength(50) ]),
    "amount": new FormControl("", [ requiredField, negativeValidator, validAmount, Validators.maxLength(50) ]),
    "description": new FormControl("", [ Validators.maxLength(500) ]),
  });

  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage: string = "";

  public selectTerms: ISelectOptions[] = [];

  public isVerifying: boolean = false;

  public studentFullName: string;
  public termName: string;

  constructor(
    private modalCtrl: ModalController,
    private paymentsService: ClassCourseService,
    private toastCtrl: ToastController,
    private studentService: StudentService,
  ) { }

  ngOnInit() {
    this.getTerms();
    this.getStudents();
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

  async add(e) {
    if(this.isVerifying || this.formGroup.invalid) return;

    this.isVerifying = true;
    const studentId = this.studentId;
    const termId = this.formGroup.get("term").value;
    const feesTitle = this.formGroup.get("title").value?.trim();
    const feesAmount = this.formGroup.get("amount").value;
    const description = this.formGroup.get("description").value?.trim();

    const fees: FeesModel[] = [
      { studentId, termId, feesTitle, feesAmount, description }
    ]
    this.paymentsService.addSpecificFees(fees)
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        await this.paymentsService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token
        });
        this.presentToast("Successful");
        this.formGroup.reset();
      }
      else {
        this.presentToast(res.status);
      }

      this.isVerifying = false;

    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isVerifying = false;
    })
  }

  async getTerms() {
    this.paymentsService.viewTerm({
      updateType: "10",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        response.forEach(term => {
          this.selectTerms.push({
            text: term.term + this.getPosition(term.term) + " Term-" + term.schoolYear,
            value: term.termId,
          });
        });

        if(this.termId)
          this.formGroup.get("term").setValue(this.termId);
      }
    })
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

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }
  

  dismissModal() {
    this.modalCtrl.dismiss('', '', addStudentPaymentsModalID);
  }
}

interface FeesModel{ 
  feesTitle: string, 
  feesAmount: string, 
  termId: string, 
  studentId: string, 
  description?: string 
}