import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { manageAdminsModalID, setAdminRolesModalID } from 'src/app/models/components-id';
import { IEditInput } from 'src/app/models/list-model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { requiredField, passwordConfirming } from 'src/app/helpers/input-validators';
import { asyncTimeOut } from 'src/app/models/storage-model';
import { SetAdminRolesComponent } from '../set-admin-roles/set-admin-roles.component';
import { AuthService } from 'src/app/services/auth.service';
import { CHECK_INTERNET_CON } from '../../login/login.component';

@Component({
  selector: 'app-manage-admins',
  templateUrl: './manage-admins.component.html',
  styleUrls: ['./manage-admins.component.scss'],
})
export class ManageAdminsComponent implements OnInit {

  public addFormGroup = new FormGroup({
    'username': new FormControl('', [ requiredField, Validators.maxLength(50) ]),
    'password': new FormControl('', [ requiredField, Validators.maxLength(50) ]),
    'confirmPassword': new FormControl('', [ requiredField, passwordConfirming, Validators.maxLength(50) ]),
  });

  public admins: IAdminInput[] = []

  public hidePassword: boolean = true;
  public hidePassword2: boolean = true;
  public addMode: boolean = false;

  public isAdding: boolean = false;
  public details: IEditInput[] = [];

  public isLoading: boolean = true;
  public isAuthorised: boolean = false;
  public errMessage: string = "";
  public showError: boolean = false;
  public pageNum: number = 1;
  public noOfAdmins: number;
  public noMoreAdmins: boolean = false;


  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.getAdmins();
  }

  async loadData(e) {
    if(this.addMode) {
      e.target.disabled = true;
      return;
    };

    this.pageNum++;
    await this.getAdmins();

    if(this.noMoreAdmins) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }
  }

  async getAdmins() {
    this.authService.viewAdmin({
      updateType: "1",
      pageSize: "20",
      pageNum: this.pageNum.toString()
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200){
        res.dataResponse.forEach(async (admin, i) => {
          this.details.push({
            model: admin.username,
            label: 'Username',
            id: admin.id,
            icon: 'person',
            type: 'text',
            secondaryBtnCLick: async () => {
              const modal = await this.modalCtrl.create({
                component: SetAdminRolesComponent,
                id: setAdminRolesModalID,
                componentProps: {
                  "adminId": admin.adminId
                }
              });

              await modal.present();
              await modal.onWillDismiss();
              this.refresh();
            }
          });
        });

        this.noOfAdmins = res.dataResponse[0].totalRows;
        this.isAuthorised = true;
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No admins";
          this.showError = true;
        }
        else{
          this.noMoreAdmins = true;
        }
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

  async refresh(e?) {
    if(this.isLoading) return;

    this.isLoading = true;
    this.pageNum = 1;

    this.details = [];
    await this.getAdmins();
    
    e?.target.complete()
  }

  enterAddMode() {
    this.addMode = true;
  }

  addAdmin(e) {
    if(this.isAdding || this.addFormGroup.invalid) return;

    this.isAdding = true;

    const elem = e.target;
    const username = this.addFormGroup.get("username").value?.trim();
    const password = this.addFormGroup.get("password").value?.trim();

    this.authService.addAdmin({ username, password })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.authService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token
        });
        this.presentToast("Successful");
        this.addFormGroup.reset();
        elem.disabled = true;
      }
      else {
        this.presentToast(res.status);
      }
      this.isAdding = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
    });
  }

  getPosition(value: number): string {
    value = ++value;
    let valueString = value.toString();
    if(value % 10 == 1) {
      return valueString + 'st';
    }
    else if(value % 10 == 2) {
      return valueString + 'nd';
    }
    else if(value % 10 == 3) {
      return valueString + 'rd';
    }
    else {
      return valueString + 'th';
    }
  }

  toggleAddMode() {
    this.addMode = !this.addMode;
    this.refresh();
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
    this.modalCtrl.dismiss('', '', manageAdminsModalID);
  }
}

interface IAdminInput {
  username: string, 
  password: string, 
  id: string
}