import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { ToastController, ActionSheetController, ModalController, isPlatform } from '@ionic/angular';
import { ActionSheetOptions } from "@ionic/core";

import { profilePhotoActionSheetID, profilePhotoModalID, desktopCamModalID } from 'src/app/models/components-id';
import { ToastPosition } from 'src/app/models/shadow-component-models';
import { ProfilePictureComponent } from '../modals/profile-picture/profile-picture.component';
import { isDefaultImage } from 'src/app/models/card-models';
import { DeskShotComponent } from '../modals/desk-shot/desk-shot.component';

@Component({
  selector: 'app-view-profile-pic',
  templateUrl: './view-profile-pic.component.html',
  styleUrls: ['./view-profile-pic.component.scss'],
})
export class ViewProfilePicComponent implements OnInit {

  public hasImage: boolean = false;
  public lastImgSrc: string = "";
  public formData: FormData;

  @Input() icon = "person";
  @Input() userId = "";
  @Input() updateType: 'student' | 'teacher' | 'admin' | ''  = "";
  @Input() public imgSrc: string;
  @Input() canView: boolean = false;
  @Input() type: 'view' | 'upload' = 'view';
  @Input() showEditBtn: boolean = true;
  @Input() showRemoveBtmSheet: boolean = false;
  @Output('changes') changeEvent = new EventEmitter<any>();

  public uploadedImg: string;
  public hasUploadedImage: boolean = false;

  @Output() modalClosed: EventEmitter<any> = new EventEmitter<any>(); 
  @Output() removePicture: EventEmitter<any> = new EventEmitter<any>(); 

  constructor(
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() { }

  imgErr(e) {
    this.hasImage = false;
  } 

  imgLoaded(e) {
    this.hasImage = true;
    if(isDefaultImage(this.imgSrc)) {
      this.imgSrc = "";
      this.hasImage = false;
    }
  }

  async choosePictureAsync(){
    const options: ActionSheetOptions = {
      buttons: [
        {
          icon: 'image',
          text: 'Choose from Gallery',
          cssClass: 'profile-action-sheet-button',
          handler: () => {
            if(!this.canView) {
              this.choosePicture();
            }
            else {
              this.viewPictureAsync('choose');
            }
          }
        },
        {
          icon: 'camera',
          text: 'Take a photo',
          cssClass: 'profile-action-sheet-button',
          handler: () => {
            if(!this.canView) {
              this.takePicture();
            }
            else {
              this.viewPictureAsync('capture');
            }
          }
        },
      ],
      header: 'Profile Photo',
      id: profilePhotoActionSheetID,
    }

    if(this.showRemoveBtmSheet) {
      options.buttons.push({
        icon: 'trash',
        text: 'Remove photo',
        cssClass: 'profile-action-sheet-button',
        handler: () => {
          this.removePicture.emit();
        }
      });

    }
    const actionSheet = await this.actionSheetCtrl.create(options);

    return await actionSheet.present();
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

        this.changeEvent.emit({ event, formData: this.formData, imgSrc: this.imgSrc, hasImg: this.hasUploadedImage });
      }
      reader.readAsDataURL(event.target.files[0]);
    }
   
  }

  async viewPictureAsync(action?: string) {
    if(!this.canView) return;

    const modal = await this.modalCtrl.create({
      component: ProfilePictureComponent,
      id: profilePhotoModalID,
      componentProps: {
        'imgSrc': this.imgSrc,
        'userId': this.userId,
        'updateType': this.updateType,
        action,
      }
    });

    await modal.present();
    await modal.onWillDismiss();
    this.modalClosed.emit();
  }

  takePicture() {
    if(!isPlatform("capacitor")) {
      this.deskCam();
    }
    else {
      const input = document.querySelector('#pick-picture-epm') as HTMLInputElement;
    
      input.click();
    }
  }

  choosePicture() {
    const input = document.querySelector('#camera-picture-epm') as HTMLInputElement;
    
    input.click();
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

    this.changeEvent.emit({ event, formData: this.formData, imgSrc: this.imgSrc, hasImg: this.hasUploadedImage });

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

  async showToast(message: string, position?: ToastPosition) {
    if(!message) message = "";
    if(!position) position = "bottom";

    const toast = await this.toastCtrl.create({
      message,
      position,
      duration: 3000,
    });

    return await toast.present();
  }

}
