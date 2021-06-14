import { Component, OnInit, ViewChildren, ViewChild, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatDatepicker } from '@angular/material/datepicker';
import { IonButton, Platform, ModalController, AlertController, ToastController, IonSlide, IonSlides, IonContent, PopoverController } from '@ionic/angular';
import { MediaMatcher } from '@angular/cdk/layout';
import { Plugins } from "@capacitor/core";

import { StudentService } from 'src/app/services/student.service';
import { ViewProfilePicComponent } from 'src/app/components/view-profile-pic/view-profile-pic.component';
import { requiredField, negativeValidator, preventArrowKeyChange } from 'src/app/helpers/input-validators';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ICardDetail } from 'src/app/models/card-models';
import { ListItemPopoverComponent } from 'src/app/components/popovers/list-item-popover/list-item-popover.component';

const { Storage } = Plugins;
const REQUESTIDS = "requests";

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.page.html',
  styleUrls: ['./add-student.page.scss'],
})
export class AddStudentPage implements OnInit, AfterViewInit, OnDestroy {

  public hasRequests = false;
  public updateMode = false;
  public pictureMode = false;

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

  public cards: ICardDetail[] = [];
  public studentId: string;
  public pageNum: number = 1;
  public noMoreStudents: boolean;
  public formData: FormData;
  public hasImg = false;
  public imgSrc: string;
  public isVerifying: boolean = false;
  public isUploadingImage: boolean = false;
  public isLoading = true;

  // @ViewChildren(MatSelect) selectElem: MatSelect[];
  @ViewChild(MatDatepicker) datePicker: MatDatepicker<any>;
  // @ViewChild("profile") profileElem: ViewProfilePicComponent;
  // @ViewChild("addBtn") addBtn: IonButton;
  @ViewChild(IonSlides) slides: IonSlides;
  @ViewChild(IonContent) content: IonContent;

  private _mobileQueryListener: () => void;
  public mobileQuery: MediaQueryList;

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private studentService: StudentService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
  }
  
  async ionViewWillEnter() {
    this.getRemoteRequests();
  }

  ngAfterViewInit() {
    this.slides.lockSwipes(true);
  }

  //#region Get requests

  async getLocalRequests() {
    const { value } = await Storage.get({ key: REQUESTIDS });
    let ids = JSON.parse(value) as Array<string>;
    
    this.hasRequests = !ids || ids?.length > 0;

    return ids;
  }

  async getRemoteRequests(refresh?: boolean) {
    const ids = await this.getLocalRequests();

    if(!ids || ids?.length < 1) {
      this.hasRequests = false;
      this.isLoading = false;
      return;
    }

    if(refresh) this.pageNum = 1;

    this.studentService.viewStudentRequest({
      updateType: "3",
      pageNum: refresh ? "1" : this.pageNum.toString(),
      pageSize: "20",
      qString: JSON.stringify(ids)
    })
    .subscribe(res => {
      if(res.statuscode == 200) {

        const response = res.dataResponse as Array<any>;

        response.forEach(async (student) => {
          this.cards.push({
            showImage: true,
            altImage: "icon",
            cardData: student,
            imageSrc: student.dpUrl,
            details: {
              "Name": (`${ student.firstName ?? "" } ${ student.lastName ?? ""} ${student.otherNames ?? ""}`)?.trim(),
              "Guardian": student.nextOfKin,
              "Contact": student.phonenum1 || student.phonenum2 ? (student.phonenum1 ? student.phonenum1 : student.phonenum2) : student.email
            }
          });
        });

        this.hasRequests = true;
        const ids = response.map(student => student.studentRequestId);
        Storage.set({ key: REQUESTIDS, value: JSON.stringify(ids) })
      }
      else if(res.statuscode == 204) {
        if(this.pageNum == 1) {
          Storage.remove({ key: REQUESTIDS });
          this.hasRequests = false;
        }
      }
      else {
        this.hasRequests = false;
      }

      this.isLoading = false;
    }, () => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isLoading = false;
    })
  }

  //#endregion
  
  //#region Add/Update

  async uploadDetails() {

    if(this.isVerifying) return;

    this.isVerifying = true;

    const firstName = this.formGroup.get("firstName").value?.trim();
    const lastName = this.formGroup.get("lastName").value?.trim();
    const otherNames = this.formGroup.get("otherNames").value?.trim();
    const nextOfKin = this.formGroup.get("nextOfKin").value?.trim();
    const email = this.formGroup.get("email").value?.trim();
    const gender = this.formGroup.get("gender").value?.trim();
    const phoneNum1 = this.formGroup.get("phoneNumber").value?.trim();
    const phoneNum2 = this.formGroup.get("phoneNumber2").value?.trim();
    let dob = this.formGroup.get("dob").value;

    dob = dob ? dob.toLocaleDateString() : "";
    
    this.checkUpdateMode({
      studentRequestId: this.studentId,
      firstName,
      lastName,
      otherNames,
      nextOfKin,
      email,
      gender,
      phoneNum1,
      phoneNum2,
      dob,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.isVerifying = false;
        
        this.formGroup.reset();
        await this.presentToast("Succesful");
        await this.slides.lockSwipes(false);
        this.slides.slideNext();
        this.slides.lockSwipes(true);
        this.studentId = res.dataResponse;
        this.pictureMode = true;
        this.content.scrollToTop();
        this.storeRequests(res.dataResponse);
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.presentToast(res.status);
        }
        else{
          this.noMoreStudents = true;
        }
      }
      else{
        this.presentToast(res.status);
      }

      this.isVerifying = false;
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
    });
  }

  checkUpdateMode(details: any) {
    if(this.updateMode)
      return this.studentService.updateStudentRequest(details);
    else 
      return this.studentService.addStudentRequest(details);
  }

  async editStudent(card) {
    this.hasRequests = false;
    this.updateMode = true;
    this.pictureMode = false;
    const details = card.cardData;

    this.formGroup.get("firstName").setValue(details.firstName);
    this.formGroup.get("lastName").setValue(details.lastName);
    this.formGroup.get("otherNames").setValue(details.otherNames);
    this.formGroup.get("nextOfKin").setValue(details.nextOfKin);
    this.formGroup.get("email").setValue(details.email);
    this.formGroup.get("gender").setValue(details.gender);
    this.formGroup.get("phoneNumber").setValue(details.phoneNum1);
    this.formGroup.get("phoneNumber2").setValue(details.phoneNum2);
    this.formGroup.get("dob").setValue(details.dob);
    
    this.imgSrc = details.dpUrl;
    this.studentId = details.studentRequestId;

    await this.slides.lockSwipes(false);
    this.slides.slideTo(0);
    this.slides.lockSwipes(true);
  }

  async add() {
    this.formGroup.reset();
    this.imgSrc = null;
    this.hasRequests = false;
    this.updateMode = false;
    this.pictureMode = false;
    await this.slides.lockSwipes(false);
    this.slides.slideTo(0);
    this.slides.lockSwipes(true);
  }

  async remove(e, card) {
    const id = card.cardData.studentRequestId;

    const popover = await this.popoverCtrl.create({
      component: ListItemPopoverComponent,
      event: e,
      componentProps: {
        options: [
          {
            text: "Delete",
            handler: async () => {
              this.popoverCtrl.dismiss();
              const alert = await this.alertCtrl.create({
                message: "Are you sure you want to delete?",
                header: "Notice",
                buttons: [
                  {
                    text: "Ok",
                    handler: async () => {
                      this.studentService.deleteStudentRequest(id)
                      .subscribe(res => {
                        if(res.statuscode == 200) {
                          this.presentToast("Successful");
                          
                          this.refresh();
                        }
                        else {
                          this.presentToast(res.status);
                        }
                      }, err => {
                        this.presentToast(CHECK_INTERNET_CON);
                      })
                    }
                  },
                  {
                    text: "Cancel",
                    role: "cancel"
                  }
                ]
              });

              await alert.present()
            }
          }
        ]
      }
    });

    await popover.present();

  }

  async loadData(e) {
    console.log('hit bottom');
    this.pageNum++;

    await this.getRemoteRequests();

    if(this.noMoreStudents) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }
  }

  uploadPicture(removePicture?: boolean) {
    if(!removePicture && (this.isUploadingImage || !this.hasImg)) return;

    if(removePicture) {
      this.formData = null;
    }
    this.isUploadingImage = true;

    this.studentService.updateStudentRequestProfilePic(this.formData, {
      studentid: this.studentId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        
        this.hasRequests = true;
        this.formGroup.reset();
        this.pictureMode = false;
        await this.presentToast("Succesful");
        this.hasImg = false;
        this.imgSrc = null;
        this.formData?.delete("photos");
        this.studentId = "";

        this.refresh();
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

  refresh() {
    this.isLoading = true;
    this.content.scrollToTop();
    this.cards = [];
    this.pageNum = 1;
    this.noMoreStudents = false;
    
    this.getRemoteRequests(true);
  }

  skipUploadPicture() {
    this.hasRequests = true;
    this.pictureMode = false;
    this.formGroup.reset();
    this.hasImg = false;
    this.imgSrc = null;
    this.formData?.delete("photos");
    this.studentId = "";
    
    this.refresh();
  }

  //#endregion


  //#region Helpers

  onPictureChange(e) {
    this.formData = e.formData;
    this.hasImg = e.hasImg;
  }

  phoneNumberKeyDown(e) {
    preventArrowKeyChange(e);
  }

  showDatePicker() {
    this.datePicker.open();
  }

  resetImg() {
    this.formData = null;
    this.hasImg = false;
  }

  wait = (ms: number) => new Promise<any>(resolve => setTimeout(resolve, ms)); 

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  async storeRequests(newValue: string) {
    const { value } = await Storage.get({ key: REQUESTIDS });

    let ids: Array<string> = JSON.parse(value) as Array<string>;
    if(!ids) ids = [];
    if(ids.indexOf(newValue) == -1)
      ids.push(newValue);
    
    await Storage.set({ value: JSON.stringify(ids), key: REQUESTIDS });
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

  //#endregion

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

}