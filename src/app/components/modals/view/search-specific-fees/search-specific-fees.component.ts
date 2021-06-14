import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, ToastController, IonInfiniteScroll } from '@ionic/angular';
import { searchSpecificPaymentModalID, viewSpecificPaymentModalID } from 'src/app/models/components-id';
import { StudentService } from 'src/app/services/student.service';
import { ICardDetail } from 'src/app/models/card-models';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ViewSpecificFeesComponent } from '../view-specific-fees/view-specific-fees.component';

@Component({
  selector: 'app-search-specific-fees',
  templateUrl: './search-specific-fees.component.html',
  styleUrls: ['./search-specific-fees.component.scss'],
})
export class SearchSpecificFeesComponent implements OnInit {

  public searchString: string = "";
  public lastSearchString: string = "";
  public cards: ICardDetail[] = [];
  public filterCards: ICardDetail[] = [];
  public searchMode: boolean = false;
  public inputFirstLoad: boolean = true;
  public showError = false;
  public isLoading = false;
  public errMessage = "";
  public pageNum = 1;
  public noMoreStudents = false;
  
  @ViewChild('scroll') scroll: IonInfiniteScroll;

  constructor(
    private modalCtrl: ModalController,
    private studentService: StudentService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {}

  async loadData(e) {
    this.pageNum++;
    this.searchRemote(this.searchString.trim());
    if(this.noMoreStudents) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }
  }

  search() {
    if(this.searchString.trim() == "") {
      this.lastSearchString = this.searchString;
      this.filterCards = [];
      return;
    }

    this.pageNum = 1;
    this.filterCards = [];
    this.scroll.disabled = false;
    this.searchRemote(this.searchString.trim());
    this.lastSearchString = this.searchString.trim();
  }

  async searchRemote(searchString: string) {
    this.isLoading = true;
    this.studentService.viewStudent({
      updateType: "3",
      pageSize: "10",
      pageNum: this.pageNum.toString(),
      qString: searchString,
    })
      .subscribe(res => {
        if (res.statuscode == 200) {
          res.dataResponse.forEach(student => {
            this.filterCards.push({
              showImage: true,
              altImage: "icon",
              cardData: student,
              imageSrc: student.dpUrl,
              details: {
                "Name": student.fullName.trim(),
                "Guardian": student.nextOfKin,
                "Contact": student.phonenum1,
              }
            });
          });
          this.showError = false;

        }
        else if (res.statuscode == 204) {
          if (this.pageNum == 1) {
            this.errMessage = "Oops, no result ☹😝";
            this.showError = true;
            this.filterCards = [];
          }
          else {
            this.noMoreStudents = true;
          }
        }
        else if (res.statuscode == 401) {
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

  add() {

  }

  async view(e) {
    const modal = await this.modalCtrl.create({
      component: ViewSpecificFeesComponent,
      id: viewSpecificPaymentModalID,
      componentProps: {
        "studentId": e.cardData.studentId
      }
    });
    
    await modal.present();
  }

  enterSearchMode() {
    this.searchMode = true;
    this.toggleSearchInput();
  }

  exitSearchMode() {
    this.searchMode = false;
  }

  toggleSearchInput() {
    if(this.inputFirstLoad == true) {
      this.inputFirstLoad = false;
    }
  }

  ionViewWillEnter() {
    this.inputFirstLoad = true;
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
    this.modalCtrl.dismiss('', '', searchSpecificPaymentModalID)
  }

}
