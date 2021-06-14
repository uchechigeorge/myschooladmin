import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ViewStudentComponent } from '../view-student/view-student.component';
import { viewStudentModalID, viewStudentPaymentModalID } from 'src/app/models/components-id';
import { MatTableDataSource } from '@angular/material/table';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-view-student-payment',
  templateUrl: './view-student-payment.component.html',
  styleUrls: ['./view-student-payment.component.scss'],
})
export class ViewStudentPaymentComponent implements OnInit {

  @Input() studentId: string;
  @Input() termId: string;

  public studentName: string = '';
  public studentDP: string;
  public schoolYear = "";
  public term: string = "";

  public showError = false;
  public isLoading = true;
  public errMessage = "";

  public feesDataSource: MatTableDataSource<IFeesData> = new MatTableDataSource([]);
  public displayColumns: string[] = ['title', 'amount', 'amountPaid', 'purpose' ];

  constructor(
    private modalCtrl: ModalController,
    private paymentService: ClassCourseService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.getFees();
  }

  async viewStudent() {
    const modal = await this.modalCtrl.create({
      component: ViewStudentComponent,
      id: viewStudentModalID,
      componentProps: {
        studentId: this.studentId
      }
    });

    return await modal.present();
  }

  getFees() {
    this.paymentService.viewFeesPayment({
      updateType: "2",
      qString: this.studentId,
      termId: this.termId,
      pageSize: "50",
      pageNum: "1"
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        let fees: IFeesData[] = [];

        response.forEach(fee => {
          fees.push({
            amount: fee.type == "0" ? fee.generalFeesAmount : fee.specificFeesAmount,
            title: fee.type == "0" ? fee.generalFeesTitle : fee.specificFeesTitle,
            amountPaid: fee.amountPaid,
            purpose: fee.type == "0" ? fee.subClassName + " class fee" : fee.specificFeesDescription,
            
          })
        });

        this.feesDataSource = new MatTableDataSource(fees);

        this.studentName = response[0].studentName;
        this.studentDP = response[0].studentDP;
        this.getTerms();
      }
      else {
        this.presentToast(res.status);
      }

      this.isLoading = false;
    }, () => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isLoading = false;
    });
  }

  getTerms() {
    this.paymentService.viewTerm({
      updateType: "2",
      termId: this.termId,
      pageNum: "1",
      pageSize: "1"
    })
    .subscribe(async res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];

        this.term = response.term + this.getPosition(response.term) + " Term";
        this.schoolYear = response.schoolYear;
      }
    })
  }

  getTotalAmount() {
    const fees = this.feesDataSource.data;
    return fees.map(t => parseFloat(t.amount)).reduce((acc, value) => acc + value, 0).toFixed(2);
  }

  getTotalAmountPaid() {
    const fees = this.feesDataSource.data;
    return fees.map(t => parseFloat(t.amountPaid)).reduce((acc, value) => acc + value, 0).toFixed(2);
  }

  getPosition(value: number): string {
    if(value % 10 == 1) {
      return 'st';
    }
    else if(value % 10 == 2) {
      return 'nd';
    }
    else if(value % 10 == 3) {
      return 'rd';
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
    this.modalCtrl.dismiss('', '', viewStudentPaymentModalID)
  }
}

interface IFeesData{
  title?: string;
  amount?: string;
  description?: string;
  timeOfPayment?: string;
  amountPaid?: string;
  purpose?: string;
}