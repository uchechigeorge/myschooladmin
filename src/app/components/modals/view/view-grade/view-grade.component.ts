import { Component, OnInit } from '@angular/core';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { ModalController, ToastController } from '@ionic/angular';
import { ICardDetail } from 'src/app/models/card-models';
import { viewGradeModalID, editGradeModalID, addGradeModalID } from 'src/app/models/components-id';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { EditGradeComponent } from '../edit-grade/edit-grade.component';
import { AddGradeComponent } from '../../add/add-grade/add-grade.component';

@Component({
  selector: 'app-view-grade',
  templateUrl: './view-grade.component.html',
  styleUrls: ['./view-grade.component.scss'],
})
export class ViewGradeComponent implements OnInit {

  public cards: ICardDetail[] = [];

  public isLoading: boolean = true;
  public errMessage: string = "";
  public showError: boolean = false;
  public pageNum: number = 1;
  public noOfGrades: number;
  public noMoreGrades: boolean = false;

  constructor(
    private gradeService: ClassCourseService,
    private modalCrl: ModalController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.getGrades();
  }

  async getGrades() {
    this.gradeService.viewGrades({
      updateType: "1",
      pageSize: "20",
      pageNum: this.pageNum.toString(),
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        res.dataResponse.forEach((grade) => {
          this.cards.push({
            showImage: false,
            cardData: grade,
            details: {
              "Grade": grade.grade,
              "Remark": grade.remark,
              "Range": grade.minValue && grade.maxValue ? grade.minValue + " - " + grade.maxValue : "",
            }
          });
        });

        this.noOfGrades = res.dataResponse[0].totalRows;
        
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No grades";
          this.showError = true;
        }
        else{
          this.noMoreGrades = true;
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

  async refresh(e?) {
    if(this.isLoading) {
      e?.target.complete()
      return;
    };

    this.isLoading = true;
    this.pageNum = 1;

    this.cards = [];
    await this.getGrades();

    e?.target.complete()
  }

  async loadData(e) {
    this.pageNum++;
    
    await this.getGrades();

    if(this.noMoreGrades) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

  }


  async view(e) {
    const modal = await this.modalCrl.create({
      component: EditGradeComponent,
      id: editGradeModalID,
      componentProps: {
        gradeId: e.cardData.gradeId
      }
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
  }

  async add() {
    const modal = await this.modalCrl.create({
      component: AddGradeComponent,
      id: addGradeModalID,
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
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
    this.modalCrl.dismiss('', '', viewGradeModalID);
  }
}
