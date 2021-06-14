import { Component, OnInit, ViewChildren, ViewChild, Input } from '@angular/core';
import { ModalController, Platform, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { viewStudentModalID } from 'src/app/models/components-id';
import { IEditInput, ISelectMultipleOptions, ISelectOptions } from 'src/app/models/list-model';
import { ApiDataService } from 'src/app/services/api-data.service';
import { MatSelect } from '@angular/material/select';
import { MatDatepicker } from '@angular/material/datepicker';
import { StudentService } from 'src/app/services/student.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { EditDetailsInputComponent } from 'src/app/components/edit-details-input/edit-details-input.component';

const LOADER_ID = "update-student-loader";

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.scss'],
})
export class ViewStudentComponent implements OnInit {

  @Input() studentId: string;
  @Input() active: string;

  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage: string = "";
  
  public DP: string = '';

  public isDeleting: boolean = false;

  @ViewChildren('inputs') detailInputs: EditDetailsInputComponent[];

  public details: IEditInput[] = [
    {
      id: EditInputs.FirstName,
      model: '',
      label: 'First Name',
      hasHeader: true,
      headerTitle: 'Name',
      icon: 'person',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.FirstName).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updateFirstName({ studentid: this.studentId, firstName: this.getInput(EditInputs.FirstName).model?.trim() })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        
        return value;
      }
    },
    {
      id: EditInputs.LastName,
      model: '',
      label: 'Last Name',
      icon: 'person',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.LastName).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updateLastName({ studentid: this.studentId, lastName: this.getInput(EditInputs.LastName).model?.trim() })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.OtherNames,
      model: '',
      label: 'Other Names',
      icon: 'person',
      type: 'text',
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.OtherNames).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updateOtherNames({ studentid: this.studentId, otherNames: this.getInput(EditInputs.OtherNames).model?.trim() })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.Gender,
      model: '',
      label: 'Gender',
      icon: 'person',
      type: 'select',
      valiators: ['maxLength'],
      selectOptions: this.getGenderOptions(),
      selectMultiple: false,
      inputChange: (e) => {
        this.getInput(EditInputs.Gender).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updateGender({ studentid: this.studentId, gender: this.getInput(EditInputs.Gender).model?.trim() })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.UserName,
      model: '',
      label: 'Username',
      icon: 'account_circle',
      type: 'text',
      noEdit: true,
      hasHeader: true,
      headerTitle: 'User Login Credentials',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        
      },
      updateInput: async () => {
        return true;
      }
    },
    {
      id: EditInputs.Password,
      model: '',
      label: 'Password',
      icon: 'vpn_key',
      type: 'password',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Password).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updatePassword({ studentid: this.studentId, password: this.getInput(EditInputs.Password).model?.trim() })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.ScratchCard,
      model: '',
      label: 'Scratch Card',
      icon: 'credit_card',
      okText: "Generate",
      type: 'text',
      valiators: ['maxLength'],
      noEdit: true,
      showSecondaryBtn: true,
      secondaryIcon: "restart_alt",
      inputChange: (e) => {
        this.getInput(EditInputs.ScratchCard).model = e.model?.trim();
      },
      secondaryBtnCLick: async () => {
        await this.showLoading();

        const scratchCardNumber = this.generateScratchCard();

        await this.studentService.updateScratchCard({ studentid: this.studentId, scratchCardNumber })
        .toPromise()
        .then(res => {
          if(res.statuscode == 200) {
            this.detailInputs.find(d => d.id == EditInputs.ScratchCard).formValue = this.formatCardNo(scratchCardNumber);
          }

          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
      },
      updateInput: async () => {
        
      }
    },
    {
      id: EditInputs.Class,
      model: "",
      label: 'Class',
      icon: 'school',
      type: 'select',
      hasHeader: true,
      headerTitle: 'School Details',
      selectMultiple: false,
      selectOptions: [],
      multipleSelectOptions: true,
      inputChange: (e) => {
        this.getInput(EditInputs.Class).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updateClass({ studentId: this.studentId, classId: this.getInput(EditInputs.Class).model })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.Courses,
      model: '',
      label: 'Course',
      icon: 'book',
      type: 'select',
      selectOptions: [],
      selectMultiple: true,
      multipleSelectOptions: true,
      inputChange: (e) => {
        this.getInput(EditInputs.Courses).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updateCourse({ studentId: this.studentId, courseIds: this.getInput(EditInputs.Courses).model })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.NextOfKin,
      model: '',
      label: 'Next of Kin/Guardian',
      icon: 'escalator_warning',
      type: 'text',
      headerTitle: 'Other Details',
      hasHeader: true,
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.NextOfKin).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updateNextOfKin({ studentid: this.studentId, nextOfKin: this.getInput(EditInputs.NextOfKin).model })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.PhoneNumber1,
      model: '',
      label: 'Guardians Phone Number 1',
      icon: 'phone',
      type: 'number',
      valiators: ['negative', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.PhoneNumber1).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updatePhoneNumber({ studentid: this.studentId, phoneNumber: [
          this.getInput(EditInputs.PhoneNumber1).model?.trim(),
          this.getInput(EditInputs.PhoneNumber2).model?.trim(),
        ]
        })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.PhoneNumber2,
      model: '',
      label: 'Guardians Phone Number 2',
      icon: 'phone',
      type: 'number',
      valiators: ['negative', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.PhoneNumber2).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updatePhoneNumber({ studentid: this.studentId, phoneNumber: [
          this.getInput(EditInputs.PhoneNumber1).model?.trim(),
          this.getInput(EditInputs.PhoneNumber2).model?.trim(),
        ]
        })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.Email,
      model: '',
      label: 'Guardians Email',
      icon: 'email',
      type: 'email',
      valiators: ['email', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Email).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.studentService.updateEmail({ studentid: this.studentId, email: this.getInput(EditInputs.Email).model?.trim() })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
    {
      id: EditInputs.DOB,
      model: '',
      label: 'Date of Birth',
      icon: 'cake',
      type: 'date',
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.DOB).model = e.model;
      },
      updateInput: async () => {
        const dateString = this.getInput(EditInputs.DOB).model;
        const date = new Date(dateString);
        const dob = dateString ? date.toLocaleDateString() : "";
        
        await this.showLoading();
        let value = await this.studentService.updateDOB({ studentid: this.studentId, dob })
        .toPromise()
        .then(res => {
          return this.proceed(res);
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        return value;
      }
    },
  ]

  @ViewChildren(MatSelect) selectElems: MatSelect[];
  @ViewChild(MatDatepicker) datePicker: MatDatepicker<any>;

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private studentService: StudentService,
    private classcourseService: ClassCourseService,
  ) { 
    this.setBackBtnPriority();
  }

  getInput(id: EditInputs) {
    return this.details?.find(detail => detail.id == id);
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getStudents();
    this.getClasses();
    this.getCourses();
    this.getScratchCard();
  }

  async getStudents() {
    this.studentService.viewStudent({
      updateType: this.active == "active" ? "2" : "11",
      pageSize: "10",
      pageNum: "1",
      studentId: this.studentId,
    })
    .subscribe(res => {
      if(res.statuscode == 200){
        let studentData = res.dataResponse[0];
       
        this.getInput(EditInputs.FirstName).model = studentData.firstName;
        this.getInput(EditInputs.LastName).model = studentData.lastName;
        this.getInput(EditInputs.OtherNames).model = studentData.otherNames;
        this.getInput(EditInputs.Gender).model = studentData.gender;
        this.getInput(EditInputs.UserName).model = studentData.username;
        this.getInput(EditInputs.Password).model = "somepassword";
        this.getInput(EditInputs.NextOfKin).model = studentData.nextOfKin;
        this.getInput(EditInputs.PhoneNumber1).model = studentData.phonenum1;
        this.getInput(EditInputs.PhoneNumber2).model = studentData.phonenum2;
        this.getInput(EditInputs.Email).model = studentData.email;
        this.getInput(EditInputs.DOB).model = studentData.dob;

        this.DP = studentData.dpUrl;
                
      }
      else if(res.statuscode == 204){
       this.presentToast("Unkwown error. Try Again");
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

  async getCourses() {
    let selectCourses: ISelectMultipleOptions[] = [];
    const courses = await this.classcourseService.viewCourse({
      updateType: "10"
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode) {
        const response = res.dataResponse as Array<any>;;
        return response;
      }
    });

    const studentCourse = await this.classcourseService.viewCourse({
      updateType: "5",
      pageNum: "1",
      pageSize: "1",
      qString: this.studentId,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    if(!courses) return;
    
    const classes = await this.classcourseService.viewClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });
    
    classes.forEach(c => {
      c.courses = [];
      courses.forEach(s => {
        if(s.classId == c.classId)
          c.courses.push(s);
      });
    });

    if(!courses || !classes) return;
    
    classes.forEach(c => {
        if(c.courses.length > 0){ 
        selectCourses.push({
          label: c.className,
          options: c.courses.map(course => {
            return {
              text: course.course,
              value: course.courseId,
            }
          }),
        });
      }
    });

    this.getInput(EditInputs.Courses).selectOptions = selectCourses;
    if(studentCourse){
      this.getInput(EditInputs.Courses).model = studentCourse.map((course) => course.courseId);
    }
    return selectCourses;
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

    const studentClass = await this.classcourseService.viewSubClass({
      updateType: "5",
      pageNum: "1",
      pageSize: "1",
      qString: this.studentId,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response[0];
      }
    });

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
    });
    
    this.getInput(EditInputs.Class).selectOptions = selectClasses;
    this.getInput(EditInputs.Class).model = studentClass?.subClassId;

    return {selectClasses, classes};
  }

  async getScratchCard() {
    this.studentService.viewScratchCard({
      updateType: "1",
      studentId: this.studentId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        const cardNo = response[0].scratchCardNo;

        const input = this.detailInputs.find(d => d.id == EditInputs.ScratchCard);

        if(input)
          input.formValue = this.formatCardNo(cardNo);
        else 
          this.getScratchCard();
      }
    });

  }

  getGenderOptions(): ISelectOptions[] {
    return [
      { text: 'Male', value: 'male' },
      { text: 'Female', value: 'female' },
      { text: "Rather not say", value: "custom" }
    ]
  }

  refresh(e) {
    // const details = this.detailInputs.find(detail => detail.id == EditInputs.ScratchCard);
    // details.formValue = this.formatCardNo(this.generateScratchCard());
  }

  proceed(res: any) {
    if(res.statuscode == 200) {
      this.dismissLoading();

      this.studentService.saveCredentials({
        adminId: res.dataResponse.adminid,
        token: res.dataResponse.token
      });
      this.presentToast("Successful");
      return true;
    }
    else {
      this.dismissLoading();
      this.presentToast(res.status);
      return false;
    }
  }

  async setStudentActive() {
    await this.showLoading();

    this.studentService.setActive({ studentId: this.studentId })
    .subscribe(async (res) => {
      this.proceed(res);
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.dismissLoading();
    })
  }

  async setStudentInactive() {
    await this.showLoading();

    this.studentService.setInactive({ studentId: this.studentId })
    .subscribe(async (res) => {
      this.proceed(res);
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.dismissLoading();
    })
  }

  delete() {
    if(this.isDeleting) return;

    this.isDeleting = true;

    this.studentService.deleteStudent({ studentId: this.studentId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.studentService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token
        });
        await this.presentToast("Successful");
        this.dismissModal();
      }
      else {
        await this.presentToast(res.status);
      }
      
      this.isDeleting = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isDeleting = false;
    })
  }

  async showDeleteAlert() {
    const alert = await this.alertCtrl.create({
      header: "Alert",
      message: "Are you sure want to delete?",
      buttons: [
        { text: "Yes", handler: () => this.delete() },
        { text: "Cancel", role: "cancel" }
      ]
    });

    await alert.present();
  }

  async showLoading(message?: string) {
    if(!message) message = "Uploading credentials";
    const loader = await this.loadingCtrl.create({
      id: LOADER_ID,
      message,
      spinner: "crescent",
    });

    return await loader.present();
  }

  async dismissLoading() {
    await this.loadingCtrl.dismiss();
  }

  generateScratchCard() {
    let cardNo = '';
    const chars = "QWERTYUIOPASDFGHJKLZXCVBNM0123456789";
    
    for (let i = 0; i < 16; i++) {
      let index = Math.floor(Math.random() * 36)
      cardNo += chars[index];
    }

    return cardNo;
  }

  formatCardNo(cardNo: string) {
    let cardArr = cardNo.split('');

    let newCardArr = [];
    cardArr.forEach((val, i) => {
      if(i % 4 == 0 && i != 0) {
        newCardArr.push("-");
      }
      newCardArr.push(val);
    });

    let newCardNo = newCardArr.join('');
    return newCardNo;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  setBackBtnPriority() {
    this.platform.backButton.subscribeWithPriority(205, () => {
      if(this.datePicker.opened)
        this.datePicker.close();
    });
    this.platform.backButton.subscribeWithPriority(200, () => {
      this.selectElems.forEach(elem => {
        if(elem.panelOpen)
          elem.close();
      })
    });
  }

  dismissModal() {
    this.modalCtrl.dismiss('', '', viewStudentModalID);
  }
}

enum EditInputs{
  FirstName,
  LastName,
  OtherNames,
  Gender,
  DOB,
  Email,
  NextOfKin,
  PhoneNumber1,
  PhoneNumber2,
  UserName,
  Password,
  ScratchCard,
  Courses,
  Class,
}