import { Component, OnInit, ViewChild, ViewChildren, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ModalController, ActionSheetController, ToastController, Platform, IonButton } from '@ionic/angular';
import { addTeacherModalID, profilePhotoModalID } from 'src/app/models/components-id';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { requiredField, negativeValidator, preventArrowKeyChange } from 'src/app/helpers/input-validators';
import { IClassModel, ICourseModel } from 'src/app/models/entity-model';
import { MatOption } from '@angular/material/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { SlideAnimations } from 'src/app/helpers/slide-animations';
import { MatSelect } from '@angular/material/select';
import { MatDatepicker } from '@angular/material/datepicker';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { ISelectMultipleOptions, ISelectOptions } from 'src/app/models/list-model';
import { TeacherService } from 'src/app/services/teacher.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ViewProfilePicComponent } from 'src/app/components/view-profile-pic/view-profile-pic.component';
import { async } from 'rxjs/internal/scheduler/async';

@Component({
  selector: 'app-add-teacher',
  templateUrl: './add-teacher.component.html',
  styleUrls: ['./add-teacher.component.scss'],
})
export class AddTeacherComponent implements OnInit, OnDestroy {

  public formGroup = new FormGroup({
    'firstName': new FormControl('', [requiredField, Validators.maxLength(50)]),
    'lastName': new FormControl('', [requiredField, Validators.maxLength(50)]),
    'otherNames': new FormControl('', [Validators.maxLength(50)]),
    'gender': new FormControl(""),
    'class': new FormControl([]),
    'course': new FormControl([]),
    'email': new FormControl('', [Validators.email, Validators.maxLength(50)]),
    'phoneNumber': new FormControl('', [Validators.maxLength(50), negativeValidator]),
    'dob': new FormControl('', [Validators.maxLength(50)]),
  });

  public selectClasses: ISelectMultipleOptions[] = [];
  public selectCoures: ISelectOptions[] = [];

  public FirstName: string = '';
  public LastName: string = '';
  public OtherNames: string = '';
  public Gender: string = '';
  public Classes: string[] = [];
  public Courses: string[] = [];
  public Email: string = '';
  public PhoneNumber: string = '';
  public DOB: string = '';
  
  public teacherId: string = "";
  public formData: FormData;
  public hasImg = false;


  public isVerifying: boolean = false;
  public isUploadingImage: boolean = false;

  public slideAnimation: SlideAnimations;

  @ViewChild('classNone') classNoneOpt: MatOption;
  @ViewChild('courseNone') courseNoneOpt: MatOption;
  @ViewChildren('classOpts') classOpts: MatOption[];
  @ViewChildren('courseOpts') courseOpts: MatOption[];
  @ViewChildren(MatSelect) selectElem: MatSelect[];
  @ViewChild(MatDatepicker) datePicker: MatDatepicker<any>;
  @ViewChild("profile") profileElem: ViewProfilePicComponent;
  @ViewChild("addBtn") addBtn: IonButton;

  private _mobileQueryListener: () => void;
  public mobileQuery: MediaQueryList;

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private classcourseService: ClassCourseService,
    private teacherService: TeacherService,
    private toastCtrl: ToastController,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.setBackBtnPriority();
  }

  ngOnInit() {
    this.getClasses();
    this.getCourses();
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
    this.Classes = this.formGroup.get('class').value;
    this.Courses = this.formGroup.get('course').value;
    this.Email = this.formGroup.get('email').value?.trim();
    this.PhoneNumber = this.formGroup.get('phoneNumber').value?.trim();
  }

  onDateChange() {
    this.DOB = this.formGroup.get('dob').value?.toLocaleDateString();
  }

  async getClasses() {
    const selectClasses: ISelectMultipleOptions[] = [];
    const classes = await this.classcourseService.viewClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    const subClasses = await this.classcourseService.viewSubClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    if(!classes || !subClasses) return;

    classes.forEach(c => {
      c.subClasses = [];
      subClasses.forEach(s => {
        if(s.parentClassId == c.classId)
          c.subClasses.push(s);
      });
    });

    classes.forEach(c => {
      if(c.subClasses.length > 0){
        selectClasses.push({
          label: c.className,
          options: c.subClasses.map(s => {
            return {
              text: s.subClassName,
              value: s.subClassId,
            }
          })
        })
      }
    })

    this.selectClasses = selectClasses;
    return selectClasses;
  }

  async getCourses() {
    let selectCourses: ISelectOptions[] = [];
    const courses = await this.classcourseService.viewCourse({
      updateType: "10"
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode) {
        const response = res.dataResponse as Array<any>;;
        return response;
      }
    });

    if(!courses) return;
    courses.forEach(course => {
      selectCourses.push({
        text: course.course,
        value: course.courseId,
      });
    });

    this.selectCoures = selectCourses;
    return selectCourses;
  }

  //#region UI fixes
  classNoneClick() {
    if(!this.classNoneOpt.selected) return;

    this.classOpts.forEach(option => option.deselect());
    this.Classes = [];
  }

  classOptClick() {
    this.classNoneOpt.deselect();
  }

  courseOptClick() {
    this.courseNoneOpt.deselect();
  }

  courseNoneClick() {
    if(!this.courseNoneOpt.selected) return;

    this.courseOpts.forEach(option => option.deselect());
    this.Courses = [];
  }

  phoneNumberKeyDown(e) {
    preventArrowKeyChange(e);
  }

  //#endregion

  uploadDetails() {
    if(this.isVerifying || this.formGroup.invalid) return;

    this.isVerifying = true;

    this.teacherService.addTeacher({
      firstName: this.FirstName,
      lastName: this.LastName,
      otherNames: this.OtherNames,
      gender: this.Gender ? this.Gender : "",
      email: this.Email,
      phoneNum: this.PhoneNumber,
      classIds: this.Classes ? this.Classes : [],
      courseIds: this.Courses ? this.Courses : [],
      dob: this.DOB ? this.DOB : "",
    })
    .subscribe(async (res)=> {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        await this.teacherService.saveCredentials({
          adminId: response.adminid,
          token: response.token,
        });
        this.teacherId = response.teacherid;
        this.resetFormGroup();
        this.slideAnimation.slideNext();
        await this.presentToast("Successful");
      }
      else {
        await this.presentToast(res.status);  
      }
      this.isVerifying = false;
    }, async (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isVerifying = false;
    })
  }

  uploadPicture() {
    if(this.isUploadingImage || !this.hasImg) return;

    this.isUploadingImage = true;

    this.teacherService.updateProfilePic(this.formData, {
      teacherId: this.teacherId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        await this.teacherService.saveCredentials({
          adminId: response.adminid,
          token: response.token,
        });
        this.teacherId = "";
        this.resetImg();
        this.slideAnimation.slidePrev();
        await this.presentToast("Successful");
      }
      else {
        this.presentToast(res.status);
      }
      this.isUploadingImage = false;
      
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  skipUploadPicture() {
    this.slideAnimation.slidePrev();
  }

  onPictureChange(e) {
    this.formData = e.formData;
    this.hasImg = e.hasImg;
  }

  resetImg() {
    this.formData = new FormData();
    this.hasImg = false;
  }

  resetFormGroup() {
    this.formGroup.reset();
    this.onInputChange();
    this.onDateChange();
    this.addBtn.disabled = true;
  }

  wait = (ms: number) => new Promise<any>(resolve => setTimeout(resolve, ms)); 

  setBackBtnPriority() {
    this.platform.backButton.subscribeWithPriority(205, () => {
      if(this.datePicker.opened)
        this.datePicker.close();
    });
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
    this.modalCtrl.dismiss('', '', addTeacherModalID);
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
