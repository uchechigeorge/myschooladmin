import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { PopoverController, ModalController, ToastController, IonInfiniteScroll } from '@ionic/angular';

import { ICardDetail, IFilterCard } from 'src/app/models/card-models';
import { ViewPaymentsComponent } from 'src/app/components/modals/view/view-payments/view-payments.component';
import { viewPaymentsModalID, classPaymentModalID, viewStudentPaymentModalID, viewSpecificPaymentModalID, searchSpecificPaymentModalID } from 'src/app/models/components-id';
import { ViewStudentPaymentComponent } from 'src/app/components/modals/view/view-student-payment/view-student-payment.component';
import { ViewSpecificFeesComponent } from 'src/app/components/modals/view/view-specific-fees/view-specific-fees.component';
import { SearchSpecificFeesComponent } from 'src/app/components/modals/view/search-specific-fees/search-specific-fees.component';
import { asyncTimeOut } from 'src/app/models/storage-model';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { FormControl } from '@angular/forms';
import { ISelectOptions } from 'src/app/models/list-model';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage implements OnInit {

  public formControl = new FormControl("");

  public cards: ICardDetail[] = [];
  public filterCards: ICardDetail[] = [];
  public searchMode: boolean = false;
  // public sortMode: boolean = false;
  public searchString: string = '';
  public lastSearchString: string = '';
  public classCategory: 'class' | 'sub-class' = 'class';
  public filterData: IFilterCard[] = [];
  public inputFirstLoad: boolean = true;

  public showError = false;
  public isLoading = false;
  public errMessage = "";
  public pageNum = 1;
  // public updateType = "1";
  // Flag to check if data from server in exhausted, for disabling ion infinite scroll
  public noMorePayments = false;
  public noOfPayments: number;

  public selectTerms: ISelectOptions[] = [];

  @ViewChild('scroll') scroll: IonInfiniteScroll;

  constructor(
    private modalCtrl: ModalController,
    private paymentService: ClassCourseService,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
  ) { }

  ngOnInit() {
  }

  get termId() {
    return this.formControl.value?.trim();
  }


  ionViewDidEnter() {
    this.getTerms();
  }

  async getPayment() {
    this.paymentService.viewStudentFees({
      updateType: "1",
      termId: this.termId,
      pageSize: "20",
      pageNum: this.pageNum.toString(),
      qString: this.searchString,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        let cards: ICardDetail[] = [];
        res.dataResponse.forEach(async (student) => {
          cards.push({
            showImage: true,
            altImage: "icon",
            cardData: student,
            imageSrc: student.dpUrl,
            details: {
              "Name": student.fullName,
              "Guardian": student.nextOfKin,
              "Contact": student.phonenum1 || student.phonenum2 ? (student.phonenum1 ? student.phonenum1 : student.phonenum2) : student.email,
            },
          });
        });

        if(this.searchMode) {
          this.filterCards.push(...cards);
        }
        else {
          this.cards.push(...cards);
        }

        this.errMessage = "";
        this.showError = false;
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1) {
          this.errMessage = this.searchMode ? "Oops, no result ☹😝" : "No payments";
          this.showError = true;
          this.filterCards = [];
        }
        else{
          this.noMorePayments = true;
        }

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

  toggleBtnClick(e: MatButtonToggleChange) {
    if(this.searchMode) return;
  }

  getTerms() {
    this.selectTerms = [];
    this.paymentService.viewTerm({
      updateType: "10"
    })
    .subscribe(async res => {
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

  onSelectChanged() {

    if(this.termId != "") {
      this.cards = [];
      this.noMorePayments = null;
      this.pageNum = 1;
      this.isLoading = true;
      this.getPayment();
    }

  }

  enterSearchMode() {
    this.searchMode = true;
    this.toggleSearchInput();
  }

  exitSearchMode() {
    this.searchMode = false;
    this.errMessage = "";
    this.showError = false;
    this.pageNum = 1;
    this.noMorePayments = false;
    this.scroll.disabled = false;
  }


  search() {
    if(this.searchString.trim() == "") {
      this.lastSearchString = this.searchString;
      this.filterCards = [];
      return;
    }

    this.pageNum = 1;
    this.isLoading = true;
    this.filterCards = [];
    this.scroll.disabled = false;
    this.getPayment();
    this.lastSearchString = this.searchString.trim();
  }

  async refresh(e?) {
    if(this.isLoading) {
      e?.target.complete()
      return;
    };

    this.isLoading = true;
    this.pageNum = 1;

    if(this.searchMode) {
      this.filterCards = [];
      this.search();
    }
    else {
      this.cards = [];
      await this.getPayment();
    }
    e?.target.complete()
  }

  async loadData(e) {
    this.pageNum++;
    
    await this.getPayment();

    if(this.noMorePayments) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

  }


  toggleSearchInput() {
    if(this.inputFirstLoad == true) {
      this.inputFirstLoad = false;
    }
  }

  async view(e) {
    const modal = await this.modalCtrl.create({
      component: ViewStudentPaymentComponent,
      id: viewStudentPaymentModalID,
      componentProps: {
        studentId: e.cardData.studentId,
        termId: this.termId
      }
    });

    return await modal.present();
  }

  async editGeneralFees() {
    const modal = await this.modalCtrl.create({
      component: ViewPaymentsComponent,
      id: viewPaymentsModalID,
    });

    return await modal.present();
  }

  async editSpecificFees() {
    const modal = await this.modalCtrl.create({
      component: SearchSpecificFeesComponent,
      id: searchSpecificPaymentModalID,
    });

    return await modal.present();
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

  ionViewWillEnter() {
    this.inputFirstLoad = true;
  }
}

