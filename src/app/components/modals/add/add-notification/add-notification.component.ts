import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ToastController, IonButton } from '@ionic/angular';
import { addNotificationModalID } from 'src/app/models/components-id';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { requiredField } from 'src/app/helpers/input-validators';
import { AuthService } from 'src/app/services/auth.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { SlideAnimations } from 'src/app/helpers/slide-animations';
import { ViewProfilePicComponent } from 'src/app/components/view-profile-pic/view-profile-pic.component';

@Component({
  selector: 'app-add-notification',
  templateUrl: './add-notification.component.html',
  styleUrls: ['./add-notification.component.scss'],
})
export class AddNotificationComponent implements OnInit {

  @Input() entityType: "admin" | "teacher" | "student";

  public formGroup = new FormGroup({
    title: new FormControl('', [ Validators.maxLength(50) ]),
    description: new FormControl('', [requiredField]),
    add: new FormControl({ value: '', disabled: true }),
  });

  public isVerifying = false;
  public addedNotificationId: string = "";
  public isUploadingImage: boolean = false;
  public formData: FormData;
  public hasImg = false;
  public slideAnimation: SlideAnimations;
  @ViewChild("profile") profileElem: ViewProfilePicComponent;
  @ViewChild("addBtn") addBtn: IonButton;
  
  constructor(
    private modalCtrl: ModalController,
    private notificationService: AuthService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.getSlides();
  }

  get formGroupInvalid() {
    return this.formGroup.invalid || this.formGroup.pristine || this.formGroup.untouched 
        || this.formGroup.controls.description.invalid || this.formGroup.controls.description.pristine;
  }

  getSlides() {
    const slideParent = document.querySelector('.custom-slides');
    const slides = slideParent.querySelectorAll('.slide');
   
    const slideArray = Array.prototype.slice.call(slides);
    this.slideAnimation = new SlideAnimations(slideArray, 0);
  }

  add() {
    if(this.isVerifying || this.formGroup.invalid) return;

    this.isVerifying = true;

    const title = this.formGroup.get("title").value?.trim();
    const description = this.formGroup.get("description").value?.trim();

    this.notificationService.addNotification({ title, description, userType: this.getNotificationType() })
    .subscribe(async res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        this.notificationService.saveCredentials({
          adminId: response.adminid,
          token: response.token,
        });

        this.addedNotificationId = response.notificationId;
        this.presentToast("Successful");
        this.formGroup.reset();
        this.slideAnimation.slideNext();
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

  uploadPicture() {
    if(this.isUploadingImage || !this.hasImg) return;

    this.isUploadingImage = true;

    this.notificationService.updateNotificationImage({
      notificationId: this.addedNotificationId,
      formData: this.formData,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        
        await this.notificationService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token,
        });
        this.formGroup.reset();
        await this.presentToast("Succesful");
        this.hasImg = false;
        this.formData.delete("photos");
        this.addedNotificationId = "";
        this.profileElem.imgSrc = "";
        this.addBtn.disabled = true;
        this.slideAnimation.slidePrev();
      }
      else {
        this.presentToast(res.status);
      }

      this.isUploadingImage = false;
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isUploadingImage = false;
    })
  }

  skipUploadPicture() {
    this.formGroup.reset();
    this.hasImg = false;
    this.formData?.delete("photos");
    this.addedNotificationId = "";
    this.profileElem.imgSrc = "";
    this.addBtn.disabled = true;
    this.slideAnimation.slidePrev();
  }

  onPictureChange(e) {
    this.formData = e.formData;
    this.hasImg = e.hasImg;
  }

  modifyTitle() {
    return this.entityType?.slice(0, 1).toUpperCase() + this.entityType?.slice(1);
  }

  getNotificationType() {
    switch (this.entityType) {
      case "admin":
        return "1"
      case "teacher":
        return "2"
      case "student":
        return "3"
      default:
        return "1";
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
    this.modalCtrl.dismiss('', '', addNotificationModalID);
  }
}
