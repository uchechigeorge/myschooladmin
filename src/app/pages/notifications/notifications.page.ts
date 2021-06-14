import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ToastController, PopoverController, ModalController } from '@ionic/angular';
import { isDefaultImage } from 'src/app/models/card-models';
import { AuthService } from 'src/app/services/auth.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { RadioPopoverComponent } from 'src/app/components/popovers/radio-popover/radio-popover.component';
import { radioPopOverID, addNotificationModalID, viewNotificationModalID } from 'src/app/models/components-id';
import { AddNotificationComponent } from 'src/app/components/modals/add/add-notification/add-notification.component';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ViewNotificationComponent } from 'src/app/components/modals/view/view-notification/view-notification.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  public searchMode: boolean = false;
  public newNotifications: number;
  public inputFirstLoad: boolean = true;

  public isLoading: boolean = true;
  public errMessage: string = "";
  public showError: boolean = false;
  public pageNum: number = 1;
  public noMoreNotifications = false;
  public searchString: string;

  public entityType: 'admin' | 'teacher' | 'student' = 'admin';
  public notifications: IOptions[] = [];

  public filterNotifications: IOptions[] = [];
  public pageMode: PageMode = PageMode.General;

  @ViewChild('scroll') scroll: IonInfiniteScroll;

  constructor(
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
    private notificationService: AuthService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.isLoading = true;
    this.reset();
    this.getNotifications();
  }

  enterSearchMode() {
    this.searchMode = true;
    this.toggleSearchInput();
  }

  exitSearchMode() {
    this.searchMode = false;
    this.errMessage = "";
    this.showError = false;
    this.pageNum = 1;
    this.noMoreNotifications = false;
    this.scroll.disabled = false;
  }

  async getNotifications() {

    this.notificationService.viewNotifications({
      updateType: this.getEntityType(),
      postId: this.getNotificationType(),
      pageSize: "20",
      pageNum: this.pageNum.toString(),
      qString: this.notificationService.requestSubject.getValue().adminid,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;

        response.forEach((notification, i, arr) => {
          const header = this.getHeader(this.checkHeader(notification));

          this.notifications.push({
            message: notification.description,
            title: notification.title,
            data: notification,
            header: header == "ago" ? "Few days ago" : header?.slice(0, 1).toUpperCase() + header?.slice(1),
            imgSrc: notification.imageUrl,
            time: notification.dateModified,
            handler: () => {

            },
            id: notification.notificationId,
            icon: 'newspaper',
            headerStatus: header,
            showEdit: this.entityType != "admin",
            editHandler: async () => {
              const modal = await this.modalCtrl.create({
                component: ViewNotificationComponent,
                id: viewNotificationModalID,
                componentProps: {
                  notificationId: notification.notificationId
                }
              });

              await modal.present();
              await modal.onWillDismiss();
              this.refresh();
            }
          })
        });
        this.showError = false;

        if(this.notifications.find(n => n.headerStatus == "today")) this.notifications.find(n => n.headerStatus == "today").hasHeader = true;
        
        if(this.notifications.find(n => n.headerStatus == "yesterday")) this.notifications.find(n => n.headerStatus == "yesterday").hasHeader = true;
        
        if(this.notifications.find(n => n.headerStatus == "ago")) this.notifications.find(n => n.headerStatus == "ago").hasHeader = true;

        this.showError = false;
        this.showTime();
        setInterval(() => this.showTime(), 60000);
        this.errMessage = '';
        
      }
      else if(res.statuscode == 204) {
        if(this.pageNum == 1) {
          this.showError = true;
          this.errMessage = "No notifications";
        }
        else{
          this.noMoreNotifications = true;
        }
      }
      else {
        this.presentToast(res.status);
      }
      
      this.isLoading = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isLoading = false;
    })
  }

  getHeader(value: string) {
    const valueNum = parseInt(value);

    if(isNaN(valueNum)) return;
    switch (valueNum) {
      case 0:
        return "today"
      case 1:
        return "yesterday"
      default:
        return "ago";
    }
  }

  search() {
    if(this.searchString.trim() == "") {
      this.filterNotifications = [];
      return;
    }

    this.pageNum = 1;
    this.filterNotifications = [];
    this.scroll.disabled = false;
    this.searchRemote(this.searchString.trim());
  }

  async searchRemote(searchString: string) {
    this.isLoading = true;
    this.notificationService.viewNotifications({
      updateType: this.getEntityType(),
      postId: this.getNotificationType(),
      pageSize: "20",
      pageNum: this.pageNum.toString(),
      qString: this.notificationService.requestSubject.getValue().adminid,
      qStringb: searchString,
    })
      .subscribe(res => {
        if (res.statuscode == 200) {
          res.dataResponse.forEach(notification => {
            this.filterNotifications.push({
              message: notification.description,
              title: notification.title,
              data: notification,
              imgSrc: notification.imageUrl,
              handler: () => {

              },
              id: notification.notificationId,
              icon: 'newspaper',
              displayTime: new Date(new Date(notification.dateModified).getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).toLocaleString(),
            });
          });
        // notification.displayTime = new Date(new Date(notification.time).getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).toLocaleString();


          this.errMessage = "";
          this.showError = false;
          
        }
        else if (res.statuscode == 204) {
          if (this.pageNum == 1) {
            this.errMessage = "Oops, no result ☹😝";
            this.showError = true;
            this.filterNotifications = [];
          }
          else {
            this.noMoreNotifications = true;
          }
        }
        else if (res.statuscode == 401) {
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

  async add() {
    const modal = await this.modalCtrl.create({
      component: AddNotificationComponent,
      id: addNotificationModalID,
      componentProps: {
        entityType: this.entityType,
      }
    });

    await modal.present();
    await modal.onWillDismiss();
    this.refresh();
  }

  async loadData(e) {
    this.pageNum++;
    if(this.searchMode){
      await this.searchRemote(this.searchString.trim());
    }
    else {
      await this.getNotifications();
    }

    if(this.noMoreNotifications) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

  }

  async refresh(e?) {
    if(this.isLoading) {
      e?.target.complete()
      return;
    };

    this.isLoading = true;
    this.pageNum = 1;

    if(this.searchMode) {
      this.filterNotifications = [];
      this.search();
    }
    else {
      this.notifications = [];
      await this.getNotifications();
    }
    e?.target.complete()
  }

  async showMenu(e) {
    const options: { text: string, value: string }[] = [
      {
        text: 'Admin Notifications',
        value: 'admin',
      },
      {
        text: 'Teacher Notifications',
        value: 'teacher',
      },
      {
        text: 'Student Notifications',
        value: 'student',
      },
    ]
    const popover = await this.popoverCtrl.create({
      component: RadioPopoverComponent,
      id: radioPopOverID,
      event: e,
      componentProps: {
        value: this.entityType,
        options
      }
    });

    await popover.present();
    const { data } = await popover.onWillDismiss();
    if(data == 'admin' || data == 'teacher' || data == 'student') {
      this.entityType = data;

      this.isLoading = true;
      this.notifications = [];
      this.pageNum = 1;
      this.getNotifications();
      // this.pageTitle = options.find(opt => opt.value == data).text;
    }
  }

  checkHeader(option) {
    var date = new Date(option.dateModified).getTime();
    var currentDate = new Date(new Date().toUTCString()).getTime();

    let diffTime = Math.abs(currentDate - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const sameDay = (new Date(option.dateModified).getDay() == new Date(new Date().toUTCString()).getDay()) && diffDays < 2;

    return sameDay ? "0" : diffDays.toString();
  }
  
  showTime() {
    this.notifications.forEach(notification => {
      if(notification.headerStatus != "today") {
        
        notification.displayTime = new Date(new Date(notification.time).getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).toLocaleString();
        return
      };

      const time = new Date(new Date(notification.time).getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).getTime();
      const currentTime = new Date().getTime();
      let diffTime = Math.abs(currentTime - time);
      
      if(diffTime <= (1000 * 60)) {
        notification.displayTime = "Just now";
      }
      else if(diffTime <= (1000 * 60 * 60)) {
        notification.displayTime = Math.floor(diffTime / (1000 * 60)) + " min(s) ago";
      }
      else if(diffTime <= (1000 * 60 * 60 * 24)) {
        notification.displayTime = Math.floor(diffTime / (1000 * 60 * 60)) + " hour(s) ago";
      }
    })
  }

  async toggleBtnClick(e: MatButtonToggleChange) {
    this.notifications = [];
    this.isLoading = true;
    this.reset();
    if(e.value == 'general') {
      this.pageMode = PageMode.General;
    }
    else if(e.value == 'private') {
      this.pageMode = PageMode.Private;
    }
    else if(e.value == 'all') {
      this.pageMode = PageMode.All;
    }
    this.getNotifications();
  }

  reset() {
    this.pageNum = 1;
    this.showError = false;
    this.errMessage = "";
    this.noMoreNotifications = false;
    this.scroll.disabled = false;
    this.searchMode = false;
    this.searchString = "";
    this.notifications = [];
  }

  toggleSearchInput() {
    if(this.inputFirstLoad == true) {
      this.inputFirstLoad = false;
    }
  }

  getEntityType() {

    switch (this.entityType) {
      case "admin":
        return "2"
      case "teacher":
        return "3"
      case "student":
        return "4"
      default:
        return "2";
    }
  }

  getNotificationType() {
    if(this.entityType != "admin") return "2";

    switch (this.pageMode) {
      case PageMode.General:
        return "2"
      case PageMode.Private:
        return "3"
      case PageMode.All:
        return "1"
      default:
        return "1";
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

  ionViewWillEnter() {
    this.inputFirstLoad = true;
  }

}

interface IOptions{
  message?: string;
  title?: string;
  data?: any;
  id?: any;
  button?: boolean;
  icon?: string;
  iconSrc?: string;
  imgSrc?: string;
  hasImg?: boolean;
  hasHeader?: boolean;
  header?: string;
  unread?: boolean,
  showSecondaryIcon?: boolean;
  secondaryIcon?: string;
  time?: any;
  displayTime?: any;
  showDelete?: boolean;
  showEdit?: boolean;
  headerStatus?: 'today' | 'yesterday' | 'ago' | '';
  handler?: () => void;
  editHandler?: () => void;
  deleteHandler?: () => void;
}

enum PageMode {
  General,
  Private,
  All
}