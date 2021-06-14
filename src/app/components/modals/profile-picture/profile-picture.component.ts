import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController, ToastController, IonImg, isPlatform } from '@ionic/angular';
import { profilePhotoModalID, desktopCamModalID } from 'src/app/models/components-id';
import { StudentService } from 'src/app/services/student.service';
import { CHECK_INTERNET_CON } from '../../login/login.component';
import { TeacherService } from 'src/app/services/teacher.service';
import { DeskShotComponent } from '../desk-shot/desk-shot.component';
import { AuthService } from 'src/app/services/auth.service';
import { isDefaultImage } from 'src/app/models/card-models';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss'],
})
export class ProfilePictureComponent implements OnInit {

  public PageTitle: string = 'Profile Photo';

  @Input() imgSrc: string;
  @Input() userId: string = "";
  @Input() action: 'capture' | 'choose' | 'none' | '' = 'none';
  @Input() updateType: 'teacher' | 'student' | 'admin' | '' = "";
  @Input() upload: () => Promise<any>;
  @Output() changeEvent = new EventEmitter<any>();
  @ViewChild('profile-pic') imgElem: IonImg;

  public hasUploadedImage: boolean = false;
  public lastImageSrc: string = '';
  public formData: FormData;
  public isVerifying: boolean = false;

  public firstLoad: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private teacherService: TeacherService,
    private toastCtrl: ToastController,
    private studentService: StudentService,
    private authService: AuthService,
    ) { }

  ngOnInit() {
    if(this.action == 'capture') {
      this.takePicture();
    }
    else if(this.action == 'choose') {
      this.choosePicture();
    }

    this.lastImageSrc = this.imgSrc;
  }

  hasImage: boolean = false;

  async dismissModal() {
    const modal = await this.modalCtrl.getTop();
    modal.animated = true;
    this.modalCtrl.dismiss({ imgSrc: this.imgSrc, formData: this.formData }, '', profilePhotoModalID);
  }

  takePicture() {
    if(!isPlatform("capacitor")) {
      this.deskCam();
    }
    else {
      const input = document.querySelector('#camera-picture-pp') as HTMLInputElement;
      input.click();
    }
  }

  choosePicture() {
    const input = document.querySelector('#pick-picture-pp') as HTMLInputElement;
    input.click();
  }

  imgErr(e) {
    this.hasImage = false;
  } 

  imgLoaded(e) {
    this.hasImage = true;
    if(isDefaultImage(this.imgSrc)){
      this.imgSrc = "";
      this.hasImage = false;
    }
  }

  onPictureChange(event) {
    var fileList = event.target.files;
    var myFile = fileList[0];

    if(!myFile) return;
    
    var fileSize = myFile.size;

    if (fileSize > (1024 * 5000)){
      this.showToast("Choose an image below 5mb");
      return;
    }

    this.formData = new FormData();
    Array.from(event.target.files).forEach((file: File) => {
      this.formData.append('photos', file, file.name);
    });


    if(event.target.files && event.target.files[0]) {
      let reader = new FileReader();
  
      reader.onload = (loadevent:any) => {
        this.imgSrc = loadevent.target.result;
        this.hasUploadedImage = true;
        this.hasImage = true;

        this.changeEvent.emit({ event, formData: this.formData, imgSrc: this.imgSrc, hasImg: this.hasUploadedImage });
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  uploadPic() {
    if(this.updatePicture() == null) return;
    if(this.isVerifying || !this.hasUploadedImage) return;

    this.isVerifying = true;

    this.updatePicture()
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.lastImageSrc = this.imgSrc;
        this.hasUploadedImage = false;
        this.showToast("Successful");
        this.studentService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token,
        })
      }
      else {
        this.showToast(res.status);
      }
      this.isVerifying = false;
    }, err => {
      this.showToast(CHECK_INTERNET_CON);
    });
  }

  async removeProfilePic() {
    if(!this.updatePicture()) return;

    this.formData = null;
    this.updatePicture()
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.lastImageSrc = null;
        this.imgSrc = null;
        this.hasImage = false;
        this.hasUploadedImage = false;
        this.showToast("Successful");
        this.studentService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token,
        });
      }
      else {
        this.showToast(res.status);
      }
      this.isVerifying = false;
    }, err => {
      this.showToast(CHECK_INTERNET_CON);
    });
  }

  updatePicture() {
    if(!(this.updateType == "student" || this.updateType == "teacher" || this.updateType == "admin")) {
      this.showToast("Try again later");
      return;
    }

    if(this.updateType == "student")
      return this.studentService.updateProfilePic(this.formData, { studentid: this.userId });
    if(this.updateType == "teacher")
      return this.teacherService.updateProfilePic(this.formData, { teacherId: this.userId });
    if(this.updateType == "admin")
      return this.authService.updateAdminProfilePic(this.formData);
  }

  cancelUploadPic() {
    this.imgSrc = this.lastImageSrc;
    this.hasUploadedImage = false;
    this.isVerifying = false;

    const input = document.querySelector('#pick-picture-pp') as HTMLInputElement;
    input.value = '';
  }

  async deskCam() {
    const modal = await this.modalCtrl.create({
      component: DeskShotComponent,
      id: desktopCamModalID,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if(!data) return;
    const img = data?.imageAsDataUrl;
    this.imgSrc = img;
    const blobImg = this.dataURItoBlob(img);
    if (blobImg.size > (1024 * 5000)){
      this.showToast("Choose an image below 5mb");
      return;
    }
    this.hasUploadedImage = true;
    this.hasImage = true;
    this.formData = new FormData();

    this.formData.append("photos", blobImg, "image.jpeg");
  }

  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
  
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
  
    // create a view into the buffer
    var ia = new Uint8Array(ab);
  
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
  
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  }

  async showToast(message: string, position?: 'bottom' | 'top') {
    if(!message) message = "";
    if(!position) position = "bottom";

    const toast = await this.toastCtrl.create({
      message,
      position,
      duration: 3000,
    });

    return await toast.present();
  }

  wait = (ms: number) => new Promise<any>(resolve => setTimeout(resolve, ms));

}
