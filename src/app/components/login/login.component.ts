import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Plugins } from "@capacitor/core";

import { requiredField } from 'src/app/helpers/input-validators';
import { homeRoute } from 'src/app/models/app-routes';
import { AuthService, TOKEN_KEY } from 'src/app/services/auth.service';
import { ToastController, ModalController } from '@ionic/angular';
import { ForgotPasswordComponent } from '../modals/forgot-password/forgot-password.component';
import { forgotPasswordModalID } from 'src/app/models/components-id';

const { Storage } = Plugins;
export const CHECK_INTERNET_CON = "Check internet connection";
export const SUCCESS_RESPONSE = "Succeesful";

@Component({
  selector: 'app-login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  public Username: string = '';
  public Password: string = '';
  public IsVerifying: boolean = false;
  @Input() public showTitle: boolean = true;
  @Input('title') public titleText: string = 'Welcome';

  @Input() public isMobile = true;
  
  public loginForm = new FormGroup({
    'username': new FormControl('', [
      requiredField
    ]),
    'password': new FormControl('', [
      requiredField
    ])
  });

  public hidePassword: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {}

  onChange() {
    this.Username = this.loginForm.get('username').value?.trim();
    this.Password = this.loginForm.get('password').value?.trim();
  }

  login() {
    if(this.IsVerifying || this.loginForm.invalid) return;

    this.IsVerifying = true;
    
    this.authService.login({ username: this.Username, password: this.Password })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.IsVerifying = false;
        this.authService.isAuthenticated.next(true);
        
        this.authService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token,
          credentials: JSON.stringify(res.dataResponse)
        })
        this.proceed();
      }
      else if(res.statuscode == 401) {
        this.authService.isAuthenticated.next(false);
        await Storage.remove({ key: TOKEN_KEY });
        this.loginForm.get("password").setErrors({ invalidCredentials: true });

        this.loginForm.get("username").setErrors({ invalidCredentials: true });
      }
      else {
        this.presentToast(res.status);
        console.log(res);
      }
      
      this.IsVerifying = false;
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.IsVerifying = false;
    })
  }

  async forgotPassword() {
    const modal = await this.modalCtrl.create({
      component: ForgotPasswordComponent,
      id: forgotPasswordModalID,
    });

    await modal.present();
  }

  proceed() {
    this.IsVerifying = false;
    this.loginForm.reset();
    this.router.navigateByUrl(homeRoute, { replaceUrl: true });
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  wait = (ms: number) => new Promise<any>(resolve => setTimeout(resolve, ms));
}

export interface AdminDataModel{
  adminName?: string;
  email?: string;
  totalRows?: string;
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