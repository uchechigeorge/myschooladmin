import { Component, OnInit, ViewChildren, ViewChild, Input } from '@angular/core';
import { ModalController, Platform, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { viewTeacherModalID } from 'src/app/models/components-id';
import { IEditInput, ISelectMultipleOptions, ISelectOptions } from 'src/app/models/list-model';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

const LOADER_ID = "update-teacher-loader";


@Component({
  selector: 'app-view-teacher',
  templateUrl: './view-teacher.component.html',
  styleUrls: ['./view-teacher.component.scss'],
})
export class ViewTeacherComponent implements OnInit {

  @Input() teacherId: string;
  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage: string = "";

  public FirstName: string = '';
  public LastName: string = '';
  public OtherNames: string = '';
  public Gender: string = '';
  public Username: string = '';
  public Password: string = '';
  public Class: string[] = [];
  public Courses: string[] = [];
  public Email: string = '';
  public PhoneNumber: string = '';
  public DOB: string = '';
  public DP: string;

  public isDeleting: boolean = false;

  public details: IEditInput[] = [
    {
      id: EditInputs.FirstName,
      model: this.FirstName,
      label: 'First Name',
      hasHeader: true,
      headerTitle: 'Name',
      icon: 'person',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.FirstName).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.teacherService.updateFirstName({ teacherid: this.teacherId, firstName: this.getInput(EditInputs.FirstName).model?.trim() })
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
      model: this.LastName,
      label: 'Last Name',
      icon: 'person',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.LastName).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.teacherService.updateLastName({ teacherid: this.teacherId, lastName: this.getInput(EditInputs.LastName).model?.trim() })
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
      model: this.OtherNames,
      label: 'Other Names',
      icon: 'person',
      type: 'text',
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.OtherNames).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.teacherService.updateOtherNames({ teacherid: this.teacherId, otherNames: this.getInput(EditInputs.OtherNames).model?.trim() })
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
      model: this.Gender,
      label: 'Gender',
      icon: 'person',
      type: 'select',
      valiators: ['maxLength'],
      selectOptions: this.getGenderOptions(),
      selectMultiple: false,
      inputChange: (e) => {
        this.getInput(EditInputs.Gender).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.teacherService.updateGender({ teacherid: this.teacherId, gender: this.getInput(EditInputs.Gender).model })
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
      id: EditInputs.Username,
      model: this.Username,
      label: 'Username',
      icon: 'account_circle',
      type: 'text',
      hasHeader: true,
      noEdit: true,
      headerTitle: 'User Login Credentials',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.Username = e.model;
      },
      updateInput: async () => {
        return false;
      }
    },
    {
      id: EditInputs.Password,
      model: this.Password,
      label: 'Password',
      icon: 'vpn_key',
      type: 'password',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Password).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.teacherService.updatePassword({ teacherid: this.teacherId, password: this.getInput(EditInputs.Password).model })
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
      id: EditInputs.Class,
      model: this.Class,
      label: 'Class',
      icon: 'school',
      type: 'select',
      hasHeader: true,
      headerTitle: 'School Details',
      selectMultiple: true,
      selectOptions: [],
      multipleSelectOptions: true,
      inputChange: (e) => {
        this.getInput(EditInputs.Class).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.teacherService.updateClass({ teacherid: this.teacherId, classIds: this.getInput(EditInputs.Class).model })
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
      model: this.Courses,
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
        let value = await this.teacherService.updateCourse({ teacherid: this.teacherId, courseIds: this.getInput(EditInputs.Courses).model })
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
      id: EditInputs.PhoneNumber,
      model: this.PhoneNumber,
      label: 'Phone Number',
      icon: 'phone',
      type: 'number',
      headerTitle: 'Other Details',
      hasHeader: true,
      valiators: ['negative', 'maxLength'],
      inputChange: (e) => {
        this.PhoneNumber = e.model;
      },
      updateInput: async () => {
        return true;
      }
    },
    {
      id: EditInputs.Email,
      model: this.Email,
      label: 'Email',
      icon: 'email',
      type: 'email',
      valiators: ['email', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Email).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.teacherService.updateEmail({ teacherid: this.teacherId, email: this.getInput(EditInputs.Email).model?.trim() })
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
      model: this.DOB,
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
        let value = await this.teacherService.updateDOB({ teacherid: this.teacherId, dob })
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
    private classcourseService: ClassCourseService,
    private teacherService: TeacherService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) { 
    this.setBackBtnPriority();
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.getTeacher();
    this.getClasses();
    this.getCourses();
  }

  async getTeacher() {
    this.teacherService.viewTeacher({
      updateType: "2",
      pageSize: "10",
      pageNum: "1",
      teacherId: this.teacherId,
    })
    .subscribe(res => {
      if(res.statuscode == 200){
        let studentData = res.dataResponse[0];
       
        this.getInput(EditInputs.FirstName).model = studentData.firstName;
        this.getInput(EditInputs.LastName).model = studentData.lastName;
        this.getInput(EditInputs.OtherNames).model = studentData.otherNames;
        this.getInput(EditInputs.Gender).model = studentData.gender;
        this.getInput(EditInputs.Username).model = studentData.username;
        this.getInput(EditInputs.Password).model = "somepassword";
        this.getInput(EditInputs.PhoneNumber).model = studentData.phonenum;
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

    const teacherClasses = await this.classcourseService.viewSubClass({
      updateType: "6",
      qString: this.teacherId,
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
    });

    if(teacherClasses) {
      let options = [];
      teacherClasses.forEach(c => {
        options.push(c.subClassId);
      });

      this.getInput(EditInputs.Class).model = options;
    }


    this.getInput(EditInputs.Class).selectOptions = selectClasses;

    
    return selectClasses;
  }

  async getCourses() {
    let selectCourses: ISelectMultipleOptions[] = [];

    const classes = await this.classcourseService.viewClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    const courses = await this.classcourseService.viewCourse({
      updateType: "10"
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    if(!classes || !courses) return;

    classes.forEach(c => {
      c.courses = [];
      courses.forEach(course => {
        if(course.classId == c.classId)
          c.courses.push(course);
      });
    });

    const teacherCourses = await this.classcourseService.viewCourse({
      updateType: "6",
      qString: this.teacherId,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    classes.forEach(c => {
      if(c.courses.length > 0){
        selectCourses.push({
          label: c.className,
          options: c.courses.map(s => {
            return {
              text: s.course,
              value: s.courseId,
            }
          })
        })
      }
    });

    if(teacherCourses) {
      let options = [];
      teacherCourses.forEach(c => {
        options.push(c.courseId);
      });

      this.getInput(EditInputs.Courses).model = options;
    }

    this.getInput(EditInputs.Courses).selectOptions = selectCourses;
    return selectCourses;
  }


  getInput(id: EditInputs) {
    return this.details.find(detail => detail.id == id);
  }

  proceed(res: any) {
    if(res.statuscode == 200) {
      this.dismissLoading();

      this.teacherService.saveCredentials({
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

  getGenderOptions(): ISelectOptions[] {
    return [
      { text: 'Male', value: 'male' },
      { text: 'Female', value: 'female' },
      { text: 'Rather not say', value: 'custom' },
    ]
  }

  delete() {
    if(this.isDeleting) return;

    this.isDeleting = true;

    this.teacherService.deleteTeacher({ teacherId: this.teacherId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.teacherService.saveCredentials({
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

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
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

  dismissModal() {
    this.modalCtrl.dismiss('', '', viewTeacherModalID);
  }

}

enum EditInputs{
  FirstName,
  LastName,
  OtherNames,
  Gender,
  DOB,
  Email,
  PhoneNumber,
  Username,
  Password,
  Courses,
  Class,
}