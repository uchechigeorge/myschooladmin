import { Component, OnInit, Input } from '@angular/core';
import { IEditInput, ISelectOptions } from 'src/app/models/list-model';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { viewSubClassModalID } from 'src/app/models/components-id';
import { ApiDataService } from 'src/app/services/api-data.service';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { TeacherService } from 'src/app/services/teacher.service';

const LOADER_ID = "update-subclass-loader";

@Component({
  selector: 'app-view-sub-class',
  templateUrl: './view-sub-class.component.html',
  styleUrls: ['./view-sub-class.component.scss'],
})
export class ViewSubClassComponent implements OnInit {

  @Input() subClassId: string;

  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage: string = "";
  public isDeleting: boolean = false;

  public Class: string = '';
  public Teacher: string = '';
  public NoOfStudents: number;
  public NoOfMale: number;
  public NoOfFemale: number;
  public Average: string;

  public details: IEditInput[] = [
    {
      id: EditInputs.ClassName,
      model: this.Class,
      label: 'Class',
      icon: 'school',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.ClassName).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.classService.updateSubClassName({ classId: this.subClassId, className: this.getInput(EditInputs.ClassName).model?.trim() })
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
      id: EditInputs.Teacher,
      model: this.Teacher,
      label: 'Teacher',
      icon: 'person',
      type: 'select',
      noEdit: false,
      valiators: ['maxLength'],
      selectOptions: [],
      selectMultiple: true,
      inputChange: (e) => {
        this.getInput(EditInputs.Teacher).model = e.model;
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.classService.updateClassTeacher({ classId: this.subClassId, teachersId: this.getInput(EditInputs.Teacher).model })
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
      id: EditInputs.Average,
      model: this.Average,
      label: 'Average',
      icon: 'money',
      type: 'number',
      suffix: '%',
      noEdit: true,
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.Average = e.model;
      },
      updateInput: async () => {
        return true;
      }
    },
    {
      id: EditInputs.NoOfStudents,
      model: this.NoOfStudents,
      label: 'Number of Students',
      icon: 'looks_5',
      type: 'number',
      noEdit: true,
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.NoOfStudents = e.model;
      },
      updateInput: async () => {
        return true;
      }
    },
    {
      id: EditInputs.NoOfMale,
      model: this.NoOfMale,
      label: 'Number of Male Students',
      icon: 'looks_3',
      type: 'number',
      noEdit: true,
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.NoOfMale = e.model;
      },
      updateInput: async () => {
        return true;
      }
    },
    {
      id: EditInputs.NoOfFemale,
      model: this.NoOfFemale,
      label: 'Number of Female Students',
      icon: 'looks_two',
      type: 'number',
      noEdit: true,
      valiators: ['maxLength'],
      inputChange: (e) => {
        this.NoOfFemale = e.model;
      },
      updateInput: async () => {
        return true;
      }
    },
  ]

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private apiData: ApiDataService,
    private classService: ClassCourseService,
    private teacherService: TeacherService,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    this.getClasses();
    this.getTeachers();
  }

  async getClasses() {
    
    this.classService.viewSubClass({
      updateType: "2",
      classId: this.subClassId,
      pageSize: "1",
      pageNum: "1",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        this.getInput(EditInputs.ClassName).model = response.subClassName;
      }
      else if(res.statuscode == 204){
        this.errMessage = "No classes";
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
      updateType: "4",
      pageSize: "20",
      pageNum: "1",
      qString: this.subClassId,
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

  proceed(res: any) {
    if(res.statuscode == 200) {
      this.dismissLoading();

      this.classService.saveCredentials({
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

  delete() {
    if(this.isDeleting) return;

    this.isDeleting = true;

    this.classService.deleteSubClass({ subClassId: this.subClassId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        await this.classService.saveCredentials({
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


  getInput(id: EditInputs) {
    return this.details?.find(detail => detail.id == id);
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
    this.modalCtrl.dismiss('', '', viewSubClassModalID);
  }
}

enum EditInputs{
  ClassName,
  Teacher,
  Average,
  NoOfStudents,
  NoOfMale,
  NoOfFemale,
}