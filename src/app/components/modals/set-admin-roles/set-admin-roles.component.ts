import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { setAdminRolesModalID } from 'src/app/models/components-id';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { IEditInput } from 'src/app/models/list-model';
import { asyncTimeOut } from 'src/app/models/storage-model';
import { AuthService } from 'src/app/services/auth.service';
import { CHECK_INTERNET_CON } from '../../login/login.component';

const LOADER_ID = "update-admin-loader";

@Component({
  selector: 'app-set-admin-roles',
  templateUrl: './set-admin-roles.component.html',
  styleUrls: ['./set-admin-roles.component.scss'],
})
export class SetAdminRolesComponent implements OnInit {

  @Input() adminId: string;
  public formGroup: FormGroup;

  public result: AdminDataModel = {};
  // public lastResult: AdminDataModel = {};
  public isVerifying: boolean;
  public isDeleting: boolean = false;

  public isLoading: boolean = true;
  public hasLoaded: boolean = false;
  public errMessage: string = "";
  public showError: boolean = false;
  public password: string = "";
  public valueHasChanged: boolean = false;

  public details: IEditInput[] = [
    {
      id: EditInputs.Username,
      model: '',
      label: 'Username',
      icon: 'person',
      type: 'text',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Username).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showAlert();
        if(!this.password) return false;

        await this.showLoading();
        let value = await this.authService.updateAdminUsername({ 
          adminpassword: this.password, 
          admin: this.adminId, 
          username: this.getInput(EditInputs.Username).model?.trim() })
        .toPromise()
        .then(res => {
          this.password = "";
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
      id: EditInputs.Password,
      model: 'somepassword',
      label: 'Password',
      icon: 'vpn_key',
      type: 'password',
      valiators: ['required', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Password).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showAlert();
        if(!this.password) return false;

        await this.showLoading();
        let value = await this.authService.updateAdminPassword({ 
          adminpassword: this.password,
          admin: this.adminId, 
          password: this.getInput(EditInputs.Password).model?.trim() })
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

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
  ) { 
  }

  ngOnInit() {
    this.getAdmins();
  }

  initFormGroup(result: AdminDataModel) {
    this.formGroup = this.formBuilder.group({
      view: this.formBuilder.group({
        viewAll: this.formBuilder.control(result.viewStudent || result.viewTeacher || result.viewCourse || result.viewClass),
        viewStudent: this.formBuilder.control(result.viewStudent),
        viewTeacher: this.formBuilder.control(result.viewTeacher),
        viewCourse: this.formBuilder.control(result.viewCourse),
        viewClass: this.formBuilder.control(result.viewClass),
      }),
      add: this.formBuilder.group({
        addAll: this.formBuilder.control(result.addStudent || result.addTeacher || result.addCourse || result.addClass),
        addStudent: this.formBuilder.control(result.addStudent),
        addTeacher: this.formBuilder.control(result.addTeacher),
        addCourse: this.formBuilder.control(result.addCourse),
        addClass: this.formBuilder.control(result.addClass),
      }),
      edit: this.formBuilder.group({
        editAll: this.formBuilder.control(result.editStudent || result.editTeacher || result.editCourse || result.editClass),
        editStudent: this.formBuilder.control(result.editStudent),
        editTeacher: this.formBuilder.control(result.editTeacher),
        editCourse: this.formBuilder.control(result.editCourse),
        editClass: this.formBuilder.control(result.editClass),
      }),
      setPayment: this.formBuilder.control(result.setPayment),
      editAdmin: this.formBuilder.control(result.editAdmin)
    })
  }

  //#region View Check group
  get viewFormGroup() {
    return this.formGroup.get('view');
  }

  get viewAll() {
    return this.viewFormGroupValues.viewClasses && this.viewFormGroupValues.viewCourses
    && this.viewFormGroupValues.viewStudents && this.viewFormGroupValues.viewTeachers;
  }

  get viewFormGroupValues() {
    const viewStudents = this.viewFormGroup.get('viewStudent').value;
    const viewTeachers = this.viewFormGroup.get('viewTeacher').value;
    const viewCourses = this.viewFormGroup.get('viewCourse').value;
    const viewClasses = this.viewFormGroup.get('viewClass').value;
    return {
      viewStudents,
      viewTeachers,
      viewCourses,
      viewClasses,
    }
  }

  get someViewsComplete(): boolean {
    const arr = [];
    arr.push(this.viewFormGroupValues.viewClasses, this.viewFormGroupValues.viewCourses, 
      this.viewFormGroupValues.viewStudents, this.viewFormGroupValues.viewTeachers);
    
    return arr.filter(value => value).length > 0 && !this.viewAll;
  }

  setViewAll(e: boolean) {
    this.viewFormGroup.get('viewStudent').setValue(e);
    this.viewFormGroup.get('viewTeacher').setValue(e);
    this.viewFormGroup.get('viewCourse').setValue(e);
    this.viewFormGroup.get('viewClass').setValue(e);

  }

  //#endregion

  //#region Edit Check group
  get editFormGroup() {
    return this.formGroup.get('edit');
  }

  get editAll() {
    return this.editFormGroupValues.editClasses && this.editFormGroupValues.editCourses
    && this.editFormGroupValues.editStudents && this.editFormGroupValues.editTeachers; 
  }

  get editFormGroupValues() {
    const editStudents = this.editFormGroup.get('editStudent').value;
    const editTeachers = this.editFormGroup.get('editTeacher').value;
    const editCourses = this.editFormGroup.get('editCourse').value;
    const editClasses = this.editFormGroup.get('editClass').value;
    return {
      editStudents,
      editTeachers,
      editCourses,
      editClasses,
    }
  }

  get someEditComplete(): boolean {
    const arr = [];
    arr.push(this.editFormGroupValues.editClasses, this.editFormGroupValues.editCourses, 
      this.editFormGroupValues.editStudents, this.editFormGroupValues.editTeachers);
    
      return arr.filter(value => value).length > 0 && !this.editAll;
  }

  setEditAll(e: boolean) {
    this.editFormGroup.get('editStudent').setValue(e);
    this.editFormGroup.get('editTeacher').setValue(e);
    this.editFormGroup.get('editCourse').setValue(e);
    this.editFormGroup.get('editClass').setValue(e);
  }
  //#endregion

  //#region Add Check group
  get addFormGroup() {
    return this.formGroup.get('add');
  }

  get addAll() {
    return this.addFormGroupValues.addClasses && this.addFormGroupValues.addCourses
    && this.addFormGroupValues.addStudents && this.addFormGroupValues.addTeachers; 
  }

  get addFormGroupValues() {
    const addStudents = this.addFormGroup.get('addStudent').value;
    const addTeachers = this.addFormGroup.get('addTeacher').value;
    const addCourses = this.addFormGroup.get('addCourse').value;
    const addClasses = this.addFormGroup.get('addClass').value;
    return {
      addStudents,
      addTeachers,
      addCourses,
      addClasses,
    }
  }

  get someAddComplete(): boolean {
    const arr = [];
    arr.push(this.addFormGroupValues.addClasses, this.addFormGroupValues.addCourses, 
      this.addFormGroupValues.addStudents, this.addFormGroupValues.addTeachers);
    
      return arr.filter(value => value).length > 0 && !this.addAll;
  }

  setAddAll(e: boolean) {
    this.addFormGroup.get('addStudent').setValue(e);
    this.addFormGroup.get('addTeacher').setValue(e);
    this.addFormGroup.get('addCourse').setValue(e);
    this.addFormGroup.get('addClass').setValue(e);
  }
  //#endregion

  async getAdmins() {
    this.authService.viewAdmin({
      updateType: "2",
      pageSize: "20",
      pageNum: "1",
      adminid: this.adminId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        const response = res.dataResponse[0];
        this.getInput(EditInputs.Username).model = response.username;
        this.result = {...response};
        this.initFormGroup(this.result);
        this.hasLoaded = true;
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

  async showAlert() {
    const alert = await this.alertCtrl.create({
      buttons: [
        { 
          text: "OK", 
          handler: (e) => {
            const value = e["0"];
            if(value?.trim() == "") {
              return false;
            }
          }  
         }
      ],
      inputs: [
        { type: "password", label: "Password" }
      ],
      header: "Security",
      message: "Enter your password to continue",
    });

    await alert.present();
    const { data } = await alert.onWillDismiss();
    this.password = data?.values["0"].trim();
  }

  roleChange() {
    this.valueHasChanged = true;
  }

  reset() {
    this.initFormGroup(this.result);
    this.valueHasChanged = false;
  }

  async uploadRoles() {
    if(this.isVerifying) return;

    await this.showAlert();
    if(!this.password) {
      return;
    }
    this.isVerifying = true;

    let roles: AdminDataModel = {};
    this.valueHasChanged = false;
    roles = {...this.formGroup.value?.add, ...this.formGroup.value?.view, ...this.formGroup.value?.edit };
    roles.editAdmin = this.formGroup.value?.editAdmin;
    roles.setPayment = this.formGroup.value?.setPayment;

    this.authService.updateRoles({
      admin: this.adminId,
      adminpassword: this.password,
      roles
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        
        this.authService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token
        });
        this.presentToast("Successful");
        this.valueHasChanged = false;
        this.result = roles;
      }
      else {
        this.presentToast(res.status);
        this.reset();
      }
      this.isVerifying = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.reset();
      this.isVerifying = false;
    })
  }

  async deleteAdmin() {
    if(this.isDeleting) return;

    await this.showAlert();
    if(!this.password) {
      return;
    }
    this.isDeleting = true;

    this.authService.deleteAdmin({
      admin: this.adminId,
      adminpassword: this.password,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        
        if(this.authService.requestSubject.getValue().adminid == this.adminId) {
          const overlays = document.querySelectorAll('ion-modal');1
          overlays.forEach(modal => {
            modal.dismiss();
          });
          this.authService.logout();
        }
        else {
          this.presentToast("Successful");
          this.dismissModal();
        }
      }
      else {
        this.presentToast(res.status);
        this.reset();
      }

      this.isDeleting = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.reset();
      this.isDeleting = false;
    })
  }

  proceed(res: any) {
    if(res.statuscode == 200) {
      this.dismissLoading();

      this.authService.saveCredentials({
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

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  getInput(id: EditInputs) {
    return this.details?.find(detail => detail.id == id);
  }

  dismissModal() {
    this.modalCtrl.dismiss('', '', setAdminRolesModalID);
  }
}

enum EditInputs {
  Username,
  Password
}

class AdminDataModel {
  viewStudent?: boolean;
  viewTeacher?: boolean;
  viewCourse?: boolean;
  viewClass?: boolean;
  addStudent?: boolean;
  addTeacher?: boolean;
  addCourse?: boolean;
  addClass?: boolean;
  editStudent?: boolean;
  editTeacher?: boolean;
  editCourse?: boolean;
  editClass?: boolean;
  viewPayment?: boolean;
  setPayment?: boolean;
  editAdmin?: boolean;
}