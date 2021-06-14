import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { ModalController, ActionSheetController, ToastController, Platform, AlertController, IonButton } from '@ionic/angular';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { Plugins } from "@capacitor/core";

import { IClassModel } from 'src/app/models/entity-model';
import { ApiDataService } from 'src/app/services/api-data.service';
import { SlideAnimations } from 'src/app/helpers/slide-animations';
import { addStudentModalID } from 'src/app/models/components-id';
import { StudentService } from 'src/app/services/student.service';
import { requiredField, negativeValidator, preventArrowKeyChange } from 'src/app/helpers/input-validators';
import { TOKEN_KEY, ADMINID_KEY, ADMINCREDENTIALS_KEY } from 'src/app/services/auth.service';
import { AdminDataModel, CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ViewProfilePicComponent } from 'src/app/components/view-profile-pic/view-profile-pic.component';

const { Storage } = Plugins;

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.scss'],
})
export class AddStudentComponent implements OnInit, OnDestroy {

  public formGroup = new FormGroup({
    'firstName': new FormControl('', [requiredField, Validators.maxLength(50)]),
    'lastName': new FormControl('', [requiredField, Validators.maxLength(50)]),
    'otherNames': new FormControl('', [Validators.maxLength(50)]),
    'gender': new FormControl('', [ Validators.maxLength(50) ]),
    'nextOfKin': new FormControl('', [Validators.maxLength(50)]),
    'email': new FormControl('', [Validators.email, Validators.maxLength(50)]),
    'phoneNumber': new FormControl('', [Validators.maxLength(50), negativeValidator]),
    'phoneNumber2': new FormControl('', [Validators.maxLength(50), negativeValidator]),
    'dob': new FormControl('', [Validators.maxLength(50)]),
  });

  public classes: IClassModel[] = [];

  public FirstName: string = '';
  public LastName: string = '';
  public OtherNames: string = '';
  public Class: string[] = [];
  public Courses: string[] = [];
  public Gender: string = '';
  public Email: string = '';
  public NextOfKin: string = '';
  public PhoneNumber: string = '';
  public PhoneNumber2: string = '';
  public DOB: any;
  public formData: FormData;
  public hasImg = false;

  public isVerifying: boolean = false;
  public addedStudentId: string = "";
  public isUploadingImage: boolean = false;

  public slideAnimation: SlideAnimations;
  @ViewChildren(MatSelect) selectElem: MatSelect[];
  @ViewChild(MatDatepicker) datePicker: MatDatepicker<any>;
  @ViewChild("profile") profileElem: ViewProfilePicComponent;
  @ViewChild("addBtn") addBtn: IonButton;
  
  private _mobileQueryListener: () => void;
  public mobileQuery: MediaQueryList;

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private apiData: ApiDataService,
    private studentService: StudentService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.setBackBtnPriority(platform);
  }

  ngOnInit() {
    this.getClasses();
    this.getSlides();
  }

  getSlides() {
    const slideParent = document.querySelector('.custom-slides');
    const slides = slideParent.querySelectorAll('.slide');
   
    const slideArray = Array.prototype.slice.call(slides);
    this.slideAnimation = new SlideAnimations(slideArray, 0);
  }

  onInputChange() {
    this.FirstName = this.formGroup.get('firstName').value?.trim();
    this.LastName = this.formGroup.get('lastName').value?.trim();
    this.OtherNames = this.formGroup.get('otherNames').value?.trim();
    this.Gender = this.formGroup.get('gender').value;
    this.NextOfKin = this.formGroup.get('nextOfKin').value?.trim();
    this.Email = this.formGroup.get('email').value?.trim();
    this.PhoneNumber = this.formGroup.get('phoneNumber').value?.trim();
    this.PhoneNumber2 = this.formGroup.get('phoneNumber2').value?.trim();

  }

  onDateChange() {
    this.DOB = this.formGroup.get('dob').value?.toLocaleDateString();
  }

  getClasses() {
    this.classes = this.apiData.getClasses();
  }

  phoneNumberKeyDown(e) {
    preventArrowKeyChange(e);
  }

  uploadDetails() {
    if(this.isVerifying) return;

    this.isVerifying = true;

    this.studentService.addStudent({
      firstName: this.FirstName,
      lastName: this.LastName,
      otherNames: this.OtherNames,
      nextOfKin: this.NextOfKin,
      email: this.Email,
      gender: this.Gender ? this.Gender : "",
      phoneNum1: this.PhoneNumber,
      phoneNum2: this.PhoneNumber2,
      dob: this.DOB ? this.DOB : "",
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.isVerifying = false;
        
        this.studentService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token,
          credentials: res.dataResponse,
        });
        this.addedStudentId = res.dataResponse.studentid;
        this.formGroup.reset();
        this.onInputChange();
        await this.presentToast("Succesful");
        this.slideAnimation.slideNext();
      }
      else if(res.statuscode == 401) {
        this.showAlert("It seems you do not have permissions to perform this action. You can try logging in again");
      }
      else{
        this.presentToast(res.status);
      }

      this.isVerifying = false;
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
    });

  }

  uploadPicture() {
    if(this.isUploadingImage || !this.hasImg) return;

    this.isUploadingImage = true;

    this.studentService.updateProfilePic(this.formData, {
      studentid: this.addedStudentId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        
        await this.studentService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token,
        });
        this.formGroup.reset();
        this.onInputChange();
        await this.presentToast("Succesful");
        this.slideAnimation.slideTo(0);
        this.hasImg = false;
        this.formData.delete("photos");
        this.addedStudentId = "";
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
    this.onInputChange();
    this.hasImg = false;
    this.formData?.delete("photos");
    this.addedStudentId = "";
    this.profileElem.imgSrc = "";
    this.addBtn.disabled = true;
    this.slideAnimation.slidePrev();
  }

  onPictureChange(e) {
    this.formData = e.formData;
    this.hasImg = e.hasImg;
  }

  showDatePicker() {
    this.datePicker.open();
  }

  resetImg() {
    this.formData = null;
    this.hasImg = false;
  }

  wait = (ms: number) => new Promise<any>(resolve => setTimeout(resolve, ms)); 

  setBackBtnPriority(platform: Platform) {
    platform.backButton.subscribeWithPriority(205, () => {
      if(this.datePicker.opened)
        this.datePicker.close();
    });
    platform.backButton.subscribeWithPriority(200, () => {
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

  async showAlert(message: string) {
    const toast = await this.alertCtrl.create({
      message,
      buttons: [
        { text: "OK", role: "cancel" }
      ],
      header: "Error",
    });

    return await toast.present();
  }



  dismissModal() {
    this.modalCtrl.dismiss('', '', addStudentModalID);
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  next() {
    this.slideAnimation.slideNext();
  }

  prev() {
    this.slideAnimation.slidePrev();
  }
}
