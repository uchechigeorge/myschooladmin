import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController, ToastController } from '@ionic/angular';
import { addTermModalID } from 'src/app/models/components-id';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { requiredField, negativeValidator } from 'src/app/helpers/input-validators';

@Component({
  selector: 'app-add-term',
  templateUrl: './add-term.component.html',
  styleUrls: ['./add-term.component.scss'],
})
export class AddTermComponent implements OnInit {

  public formGroup = new FormGroup({
    "session": new FormControl("", [ requiredField ]),
    "term": new FormControl("", [requiredField, negativeValidator, Validators.maxLength(50)]),
  });

  public isLoading: boolean = true;
  public isVerifying: boolean = false;
  public sessionsData: {text: string, value: string}[] = [];
  public term: string = "";
  public session: string = "";

  get sessionControl() {
    return this.formGroup.get("session");
  }

  constructor(
    private modalCtrl: ModalController,
    private termService: ClassCourseService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.getSessions();
  }

  async getSessions() {
    this.termService.viewSession({
      updateType: "1",
      pageSize: "100",
      pageNum: "1"
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        response.forEach(r => {
          this.sessionsData.push({
            text: r.schoolYear,
            value: r.sessionId
          });
        });
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

  onInputChange() {
    this.term = this.formGroup.get("term").value?.trim();
    this.session = this.sessionControl.value;
  }

  upload() {
    if(this.isVerifying || this.formGroup.invalid) return;

    this.isVerifying = true;
    this.termService.addTerm({
      sessionId: this.session,
      terms: [this.term],
    })
    .subscribe(res => {
      if(res.statuscode == 200){
        const response = res.dataResponse;
        this.termService.saveCredentials({
          adminId: response.adminId,
          token: response.token,
        });

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

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  getPosition(value: number): string {
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
    this.modalCtrl.dismiss(addTermModalID);
  }
}
