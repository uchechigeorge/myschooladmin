import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentRef } from '@ionic/core'
import { ModalController, isPlatform, AlertController, ToastController, IonToggle } from '@ionic/angular';
import { Plugins, StatusBarStyle, PushNotification, PushNotificationActionPerformed, PushNotificationToken, Capacitor } from "@capacitor/core";
import { Router } from '@angular/router';
import { themeKeyValue } from 'src/app/models/storage-model';
import { loginRoute } from 'src/app/models/app-routes';
import { ManageAdminsComponent } from 'src/app/components/modals/manage-admins/manage-admins.component';
import { manageAdminsModalID, resetPasswordModalID, recoverEmailModalID, profilePhotoModalID } from 'src/app/models/components-id';
import { ResetPasswordComponent } from 'src/app/components/modals/reset-password/reset-password.component';
import { AuthService, ADMINCREDENTIALS_KEY, ADMINID_KEY } from 'src/app/services/auth.service';
import { RecoveryEmailComponent } from 'src/app/components/modals/recovery-email/recovery-email.component';
import { ProfilePictureComponent } from 'src/app/components/modals/profile-picture/profile-picture.component';

const { Storage, StatusBar, PushNotifications, Device } = Plugins;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public Theme: IThemeType = 'light';
  public LogOutBtnText: string = "Log Out";
  public hasDetails= false;
  public details: any;

  @ViewChild('toggle') toggle: IonToggle;

  public options: ISettingsOptions[] = [
    // Theme
    {
      title: 'Theme',
      id: ListItemID.Theme,
      subtitle: 'Light',
      hasHeader: true,
      header: 'Preferences',
      icon: isPlatform('ios') ? 'sunny-outline' : 'sunny-sharp',
      button: true,
      handler: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Select Theme',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Ok',
              handler: (e) => {
                if(e == undefined) return false;
                this.changeTheme(e);
              }
            },
          ],
          inputs: [
            {
              type: 'radio',
              label: 'System Preferrence',
              value: 'system-preference' as IThemeType,
              checked: this.Theme == 'system-preference',
            },
            {
              type: 'radio',
              label: 'Light',
              value: 'light' as IThemeType,
              checked: this.Theme == 'light',
            },
            {
              type: 'radio',
              label: 'Dark',
              value: 'dark' as IThemeType,
              checked: this.Theme == 'dark',
            },
          ]
        });

        return await alert.present();
      }
    },
    // Notifications
    {
      title: 'Push Notifications',
      checkDisabled: true,
      id: ListItemID.Notifications,
      subtitle: "Off",
      icon: "notifications",
      button: false,
      toggle: true,
      handler: async (e?: any) => {
        if(!e) return;
        

        const listItem = this.getListItem(ListItemID.Notifications);

        const state = !this.toggle.checked;

        
        // if(Capacitor.platform != "web") {
              
          this.authService.updateNotificationState({ state })
          .subscribe(async (res) => { 
            listItem.checkDisabled = true;
            if(res.statuscode == 200) {
              await this.presentToast("Success");
              this.getNotification();
            }
            else {
              this.presentToast(res.status);
              this.toggle.checked = !this.toggle.checked;
              listItem.checkDisabled = false;
            }
          },
          err => { 
            this.toggle.checked = !this.toggle.checked;
            listItem.checkDisabled = false;
            this.presentToast("Could not update");
          });


        // }

        // if(this.toggle.checked == false) {
        //   listItem.icon = isPlatform('ios') ? 'notifications-outline' : 'notifications-sharp';
        //   listItem.subtitle = 'On';
        // }
        // else {
        //   listItem.icon = isPlatform('ios') ? 'notifications-off-outline' : 'notifications-off-sharp';
        //   listItem.subtitle = 'Off';
        // }
      },
    },
    // Reset Password
    {
      title: 'Reset Password',
      subtitle: 'Secure your account',
      hasHeader: true,
      header: 'Account Settings',
      button: true,
      icon: isPlatform('ios') ? 'key-outline' : 'key-sharp',
      handler: async () => {
        const modal = await this.modalCtrl.create({
          component: ResetPasswordComponent,
          id: resetPasswordModalID,
        });

        return await modal.present();
      }
    },
    // Manage Admins
    {
      title: 'Manage Admins',
      subtitle: 'Add, edit, remove Admin',
      icon: isPlatform('ios') ? 'person-circle-outline' : 'person-circle-sharp',
      button: true,
      handler: async () => {
        const modal = await this.modalCtrl.create({
          component: ManageAdminsComponent,
          id: manageAdminsModalID
        });

        return await modal.present();
      }
    },
    // Recovery Email
    {
      title: 'Recovery Email',
      subtitle: 'Add an email for recovery',
      icon: isPlatform('ios') ? 'mail-outline' : 'mail-sharp',
      button: true,
      handler: async () => {
        const modal = await this.modalCtrl.create({
          component: RecoveryEmailComponent,
          id: recoverEmailModalID
        });

        await modal.present();
      }
    },
    // Update Pic
    {
      title: 'Update Picture',
      subtitle: 'Customize your account',
      icon: isPlatform('ios') ? 'image-outline' : 'image-sharp',
      button: true,
      handler: async () => {
        if(!this.hasDetails) return;

        const modal = await this.modalCtrl.create({
          component: ProfilePictureComponent,
          id: profilePhotoModalID,
          componentProps: {
            imgSrc: this.authService.dpUrlSubject.getValue(),
            userId: this.details.adminId,
            updateType: "admin",
          }
        });
    
        await modal.present();
        await modal.onWillDismiss();
        this.hasDetails = false;
        this.getAdmin();
      }
    },
   
    // Help
    {
      title: 'Help and Support',
      subtitle: 'Having an issue? Contact us. FAQs',
      button: true,
      icon: isPlatform('ios') ? 'help-outline' : 'help-sharp',
      handler: () => {
        
      }
    },
  ]

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
  }
  
  ionViewWillEnter() {
    this.getUserDetails();
    this.getAdmin();
    this.getNotification()
  }

  async getUserDetails() {
    const { value } = await Storage.get({ key: themeKeyValue });
    
    if(value == 'null' || value == null) {
      this.Theme = "system-preference"
      await Storage.set({
        key: themeKeyValue,
        value: this.Theme,
      });
    }
    else {
      this.Theme = value as IThemeType;
    }
    this.changeTheme(this.Theme);
  }

  async getAdmin() {

    const { value } = await Storage.get({ key: ADMINID_KEY });
    if(!value) return;
    this.authService.viewAdmin({
      updateType: "2",
      pageSize: "10",
      pageNum: "1",
      adminid: value
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        this.details = response;
        this.hasDetails = true;
        this.authService.dpUrlSubject.next(response.dpUrl);
        Storage.set({ key: ADMINCREDENTIALS_KEY, value: JSON.stringify(response) });

      }
    }, err => { });
    
  }

  async getNotification() {
    const { value } = await Storage.get({ key: ADMINID_KEY });
    if(!value) return;

    return this.authService.viewFBId({
      updateType: "1",
      postId: "2",
      pageNum: "1",
      pageSize: "1",
      qString: value,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];

        this.toggle.checked = response.notificationState;
        
        const listItem = this.getListItem(ListItemID.Notifications);
        if(this.toggle.checked == true) {
          listItem.icon = isPlatform('ios') ? 'notifications-outline' : 'notifications-sharp';
          listItem.subtitle = 'On';
        }
        else {
          listItem.icon = isPlatform('ios') ? 'notifications-off-outline' : 'notifications-off-sharp';
          listItem.subtitle = 'Off';
        }
        listItem.checkDisabled = false;
      }
    })
  }

  getListItem(id: ListItemID) {
    return this.options.find(item => item.id == id);
  }

  changeTheme(value?: IThemeType) {
    let listItem = this.getListItem(ListItemID.Theme);
    
    switch (value) {
      case 'system-preference':
        listItem.subtitle = 'System Preference';
        listItem.icon = isPlatform('ios') ? 'desktop-outline' : 'desktop-sharp';
        this.Theme = 'system-preference';
        break;
      case 'light':
        listItem.subtitle = 'Light';
        listItem.icon = isPlatform('ios') ? 'sunny-outline' : 'sunny-sharp';
        this.Theme = 'light';
        break;
      case 'dark':
        listItem.subtitle = 'Dark';
        listItem.icon = isPlatform('ios') ? 'moon-outline' : 'moon-sharp';
        this.Theme = 'dark';
        break;
      default:
        break;
    }

    Storage.set({
      key: themeKeyValue,
      value: this.Theme
    });
    this.toggleTheme();
  }

  toggleTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if(this.Theme == 'light') {
      this.setLight();
    }
    else if(this.Theme == 'dark') {
      this.setDark();
    }
    else if(this.Theme == 'system-preference') {
      if(prefersDark.matches) {
        this.setDark();
      }
      else {
        this.setLight();
      }
    }
  }

  setLight() {
    document.body.classList.remove('dark');
    if(!isPlatform('capacitor')) return;
    StatusBar.setBackgroundColor({
      color: '#673AB7',
    });
    StatusBar.setStyle({
      style: StatusBarStyle.Light,
    });
  }

  setDark() {
    document.querySelector('body').classList.add('dark');
    if(!isPlatform('capacitor')) return;
    StatusBar.setBackgroundColor({
      color: '#323233',
    });
    StatusBar.setStyle({
      style: StatusBarStyle.Dark,
    });
  }

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: "Notice",
      message: "Log Out?",
      buttons: [
        {
          text: "Ok",
          handler: async () => {
            await this.authService.logout();
          },
        },
        {
          text: "Cancel",
          role: "cancel"
        }
      ]
    });

    return await alert.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }


  ionViewDidLeave() {
    this.hasDetails = false;
  }
}

type IThemeType = 'light' | 'dark' | 'system-preference';

enum ListItemID{
  Theme,
  Notifications
}

interface ISettingsOptions{
  title: string,
  id?: any,
  subtitle?: string,
  button?: boolean,
  icon?: string,
  iconSrc?: string,
  hasHeader?: boolean,
  toggle?: boolean,
  disabled?: boolean,
  checkDisabled?: boolean,
  header?: string,
  showSecondaryIcon?: boolean,
  secondaryIcon?: string,
  handler?: () => void,
}
