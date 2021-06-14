import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { requiredField } from 'src/app/helpers/input-validators';
import { addGradeModalID } from 'src/app/models/components-id';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-add-grade',
  templateUrl: './add-grade.component.html',
  styleUrls: ['./add-grade.component.scss'],
})
export class AddGradeComponent implements OnInit {

  public formGroup = new FormGroup({
    grade: new FormControl('', [ requiredField, Validators.maxLength(50) ]),
    remark: new FormControl('', [ Validators.maxLength(50) ]),
    min: new FormControl('', [ Validators.maxLength(50) ]),
    max: new FormControl('', [ Validators.maxLength(50) ]),
  });

  public isAdding = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private gradeService: ClassCourseService,
  ) { }

  ngOnInit() {}

  add() {
    if(this.isAdding || this.formGroup.invalid) return;

    this.isAdding = true;

    const grade = this.formGroup.get("grade").value?.trim();
    const remark = this.formGroup.get("remark").value?.trim();
    const min = this.formGroup.get("min").value;
    const max = this.formGroup.get("max").value;

    this.gradeService.addGrade({ grade, remark, min, max })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        await this.gradeService.saveCredentials({
          adminId: response.adminId,
          token: response.token,
        });
        this.formGroup.reset();
        this.presentToast("Successful");
      }
      else {
        this.presentToast(res.status);
      }

      this.isAdding =  false;
      
    }), (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isAdding =  false;
    };
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
    this.modalCtrl.dismiss('', '', addGradeModalID);
  }
}
