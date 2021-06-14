import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { editStudentRequestModalID } from 'src/app/models/components-id';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { requiredField, negativeValidator, preventArrowKeyChange } from 'src/app/helpers/input-validators';
import { MatDatepicker } from '@angular/material/datepicker';
import { MediaMatcher } from '@angular/cdk/layout';
import { StudentService } from 'src/app/services/student.service';
import { CHECK_INTERNET_CON, SUCCESS_RESPONSE } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-edit-student-request',
  templateUrl: './edit-student-request.component.html',
  styleUrls: ['./edit-student-request.component.scss'],
})
export class EditStudentRequestComponent implements OnInit, OnDestroy {

  @Input() studentId: string;

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

  public imgSrc: string;
  public showErr = false;
  public errMsg = '';
  public isLoading: boolean = true;
  public isVerifying: boolean = false;

  @ViewChild(MatDatepicker) datePicker: MatDatepicker<any>;

  private _mobileQueryListener: () => void;
  public mobileQuery: MediaQueryList;

  constructor(
    private modalCtrl: ModalController,
    private studentService: StudentService,
    private toastCtrl: ToastController,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.populateValue();
  }

  async uploadDetails() {

    if(this.isVerifying || this.formGroup.invalid) return;

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
    
    this.studentService.addStudent({
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
        const response = res.dataResponse;
        
        await this.studentService.saveCredentials({
          adminId: response.adminid,
          token: response.token
        });

        this.formGroup.reset();
        await this.presentToast("Succesful");
        this.deleteRequest();
        this.formGroup.reset();
        // await this.slides.lockSwipes(false);
        // this.slides.slideNext();
        // this.slides.lockSwipes(true);
        // this.studentId = res.dataResponse;
        // this.pictureMode = true;
        // this.content.scrollToTop();
        // this.storeRequests(res.dataResponse);
      }
      else{
        this.presentToast(res.status);
      }

      this.isVerifying = false;
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isVerifying = false;
    });
  }

  deleteRequest() {
    this.studentService.declineStudentRequest(this.studentId)
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        await this.studentService.saveCredentials({
          adminId: response.adminid,
          token: response.token
        });

      }

    }, err => { })

  }

  async populateValue() {
    
    this.studentService.viewStudentRequest({
      updateType: "2",
      studentId: this.studentId,
      pageNum: "1",
      pageSize: "1",
    })
    .subscribe(async (res) => {

      if(res.statuscode == 200) {

        const response = res.dataResponse[0];
        
        this.formGroup.get("firstName").setValue(response.firstName);
        this.formGroup.get("lastName").setValue(response.lastName);
        this.formGroup.get("otherNames").setValue(response.otherNames);
        this.formGroup.get("nextOfKin").setValue(response.nextOfKin);
        this.formGroup.get("email").setValue(response.email);
        this.formGroup.get("gender").setValue(response.gender);
        this.formGroup.get("phoneNumber").setValue(response.phoneNum1);
        this.formGroup.get("phoneNumber2").setValue(response.phoneNum2);
        this.formGroup.get("dob").setValue(response.dob);
        
        this.imgSrc = response.dpUrl;
        
        this.showErr = false;
        this.errMsg = '';
      }
      else {
        this.showErr = true;
        this.errMsg = '';
        this.presentToast(res.status);
      }

      this.isLoading = false;
    }, err => {
      this.showErr = true;
      this.errMsg = '';
      this.isLoading = false;
      this.presentToast(CHECK_INTERNET_CON);
    })

  }

  phoneNumberKeyDown(e) {
    preventArrowKeyChange(e);
  }

  showDatePicker() {
    this.datePicker.open();
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
    this.modalCtrl.dismiss('', '', editStudentRequestModalID);
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
