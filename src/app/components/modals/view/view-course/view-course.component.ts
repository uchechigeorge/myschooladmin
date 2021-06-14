import { Component, OnInit, ViewChildren, Input } from '@angular/core';
import { IEditInput, ISelectOptions } from 'src/app/models/list-model';
import { ModalController, Platform, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { viewCourseModalID } from 'src/app/models/components-id';
import { MatSelect } from '@angular/material/select';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { TeacherService } from 'src/app/services/teacher.service';

const LOADER_ID = "update-course-loader";

@Component({
  selector: 'app-view-course',
  templateUrl: './view-course.component.html',
  styleUrls: ['./view-course.component.scss'],
})
export class ViewCourseComponent implements OnInit {

  @Input() courseId: string;

  public CourseName: string = '';
  public Class: string = '';
  public Teacher: string = '';
  public StudentsOffering: string = '';
  public Average: string = '';

  public selectClasses: { text: string, value?: string }[] = [];
  public selectTeachers: { text: string, value?: string }[] = [];

  @ViewChildren(MatSelect) selectElems: MatSelect[]; 

  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage: string = "";
  public isDeleting: boolean = false;

  public details: IEditInput[] = [
    {
      id: EditInputs.CourseName,
      model: this.CourseName,
      label: 'Course',
      icon: 'book',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.CourseName).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.courseService.updateCourseName({ courseId: this.courseId, courseName: this.getInput(EditInputs.CourseName).model?.trim() })
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
      model: '',
      label: 'Class',
      icon: 'school',
      type: 'text',
      noEdit: true,
      valiators: ['required'],
      inputChange: (e) => {
      },
      updateInput: async () => {
        return false;
      }
    },
    {
      id: EditInputs.Teacher,
      model: [],
      label: 'Teacher',
      icon: 'person',
      type: 'select',
      selectMultiple: true,
      selectOptions: [],
      inputChange: (e) => {
        this.getInput(EditInputs.Teacher).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.courseService.updateCourseTeacher({ courseId: this.courseId, teachersId: this.getInput(EditInputs.Teacher).model })
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
      id: EditInputs.StudentsOffering,
      model: this.StudentsOffering,
      label: 'Students Offering',
      icon: 'groups',
      type: 'number',
      noEdit: true,
      inputChange: (e) => {
        this.StudentsOffering = e.model;
      },
      updateInput: async () => {
        return true;
      }
    },
    {
      id: EditInputs.Average,
      model: this.Average,
      label: 'Average',
      icon: 'money',
      type: 'number',
      noEdit: true,
      suffix: '%',
      inputChange: (e) => {
        this.Average = e.model;
      },
      updateInput: async () => {
        return true;
      }
    },
  ]

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private courseService: ClassCourseService,
    private teacherService: TeacherService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) { 
    this.setBackBtnPriority();
  }

  ngOnInit() {
    this.getCourses();
    this.getTeachers();
  }

  async getCourses() {
    
    this.courseService.viewCourse({
      updateType: "2",
      courseId: this.courseId,
      pageSize: "1",
      pageNum: "1",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        this.getInput(EditInputs.CourseName).model = response.courseName;
        this.getInput(EditInputs.Class).model = response.courseClass;
        
      }
      else if(res.statuscode == 204){
        this.errMessage = "No course";
        this.showError = true;
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


  async getTeachers() {
    const selectTeachers: ISelectOptions[] = [];

    const teachers = await this.teacherService.viewTeacher({
      updateType: "10",
    }).toPromise()
    .then(async res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
      else 
        return null;
    }, err => null)

    const classTeachers = await this.teacherService.viewTeacher({
      updateType: "5",
      pageSize: "20",
      pageNum: "1",
      qString: this.courseId,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        return response;
      }
      else {
        return [{}];
      }
    }, err => {
      return [{}];
    });


    if(!teachers) return;

    teachers.forEach(teacher => {
      selectTeachers.push({
        text: teacher.fullName,
        value: teacher.teacherId,
      });
    });
    this.getInput(EditInputs.Teacher).selectOptions = selectTeachers;
    const classTeacherIds = classTeachers.map(c => c.teacherId);
    this.getInput(EditInputs.Teacher).model = classTeacherIds;
    return selectTeachers;
  }

  delete() {
    if(this.isDeleting) return;

    this.isDeleting = true;

    this.courseService.deleteCourse({ courseId: this.courseId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.courseService.saveCredentials({
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

  getInput(id: EditInputs) {
    return this.details?.find(detail => detail.id == id);
  }

  proceed(res: any) {
    if(res.statuscode == 200) {
      this.dismissLoading();

      this.courseService.saveCredentials({
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


  setBackBtnPriority() {
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


  dismissModal() {
    this.modalCtrl.dismiss('', '', viewCourseModalID);
  }
}

enum EditInputs{
  CourseName,
  Class,
  Teacher,
  StudentsOffering,
  Average,
}