import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WebcamImage, WebcamUtil, WebcamInitError } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { desktopCamModalID } from 'src/app/models/components-id';

@Component({
  selector: 'app-desk-shot',
  templateUrl: './desk-shot.component.html',
  styleUrls: ['./desk-shot.component.scss'],
})
export class DeskShotComponent implements OnInit {

  @Output()
  public pictureTaken = new EventEmitter<WebcamImage>();
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
  width: {ideal: 1024},
  height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  public webCamImage: WebcamImage;
  public imageTaken: boolean = false;
  public imageSrc: string;

  constructor(
    private modalCtrl: ModalController,
  ) {

  }

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices: MediaDeviceInfo[]) => {
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }
  public handleImage(webcamImage: WebcamImage): void {
    this.pictureTaken.emit(webcamImage);
    this.webCamImage = webcamImage;
    this.imageTaken = true;
    this.imageSrc = webcamImage.imageAsDataUrl;
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  retake() {
    this.imageTaken = false;
    this.webCamImage = null;
    this.imageSrc = null;
  }

  confirm() {
    this.dismissModal(this.webCamImage);
  }

  dismissModal(image?: any) {
    this.modalCtrl.dismiss(image, '',desktopCamModalID);
  }
}