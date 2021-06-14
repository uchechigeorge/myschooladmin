import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { IClassModel } from 'src/app/models/entity-model';
import { requiredField } from 'src/app/helpers/input-validators';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { ModalController, ActionSheetController, ToastController, Platform } from '@ionic/angular';
import { ApiDataService } from 'src/app/services/api-data.service';
import { addCourseModalID } from 'src/app/models/components-id';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss'],
})
export class AddCourseComponent implements OnInit {

  public formGroup = new FormGroup({
    'course': new FormControl('', [requiredField, Validators.maxLength(50)]),
    'class': new FormControl('', [requiredField]),
  });

  public selectClasses: { text: string, value?: string }[] = [];
  public isVerifying: boolean = false;

  @ViewChildren(MatSelect) selectElem: MatSelect[];

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private courseService: ClassCourseService,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
  ) { 
    this.setBackBtnPriority();
  }

  ngOnInit() {
    this.getClasses();
  }

  async getClasses() {
    this.courseService.viewClass({
      updateType: "10",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        res.dataResponse.forEach(aClass => {
          this.selectClasses.push({
           text: aClass.className,
           value: aClass.classId
        });
      })
    }

    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  uploadDetails(e) {
    if(this.isVerifying || this.formGroup.invalid) return;

    const btnElem = e.target;
    
    this.isVerifying = true;
    const courseName = this.formGroup.get("course").value?.trim();
    const classId = this.formGroup.get("class").value?.trim();

    this.courseService.addCourse({ classId, courseName })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        await this.courseService.saveCredentials({
          adminId: response.adminid,
          token: response.token,
        });
        this.formGroup.reset();
        // btnElem.disabled = true;
        this.presentToast("Successful");
      }
      else {
        this.presentToast(res.status);
      }
      this.isVerifying = false;
    }, err => {
      this.isVerifying = false;
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  setBackBtnPriority() {
    this.platform.backButton.subscribeWithPriority(200, () => {
      this.selectElem.forEach(elem => {
        if(elem.panelOpen)
          elem.close();
      })
    });
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
    this.modalCtrl.dismiss('', '', addCourseModalID);
  }
}
