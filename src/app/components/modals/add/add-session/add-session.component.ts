import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { addSessionModalID } from 'src/app/models/components-id';
import { requiredField } from 'src/app/helpers/input-validators';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-add-session',
  templateUrl: './add-session.component.html',
  styleUrls: ['./add-session.component.scss'],
})
export class AddSessionComponent implements OnInit {

  public formGroup: FormGroup;
  
  isVerifying: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private termService: ClassCourseService,
    changeDetectorRef: ChangeDetectorRef,
  ) { 
    this.formGroup = this.formBuilder.group({
      session: this.formBuilder.control('', [requiredField, Validators.maxLength(50)]),
      hasChildren: this.formBuilder.control(false),
      terms:  this.formBuilder.array([ this.createBranch("1") ], [this.matchSibling]),
    });

    this.formGroup.valueChanges.subscribe(() => {
      changeDetectorRef.detectChanges();
    });

  }

  ngOnInit() {
    this.initBranches();
  }

  get sessionControl() {
    return this.formGroup.get('session') as FormControl;
  }

  get termBranches() {
    return this.formGroup.get('terms') as FormArray;
  }
  
  get hasChildren() {
    return this.formGroup.get('hasChildren') as FormControl;
  }

  initBranches() {
    const enabled = this.hasChildren.value;
    if(enabled) {
      this.termBranches.enable();
    }
    else {
      this.termBranches.disable();
    }

    this.initCheckbox();
  }

  initCheckbox() {
    const checkEnabled = this.sessionControl.valid;
    if(checkEnabled) {
      this.hasChildren.enable();
    }
    else {
      this.hasChildren.disable();
    }
  }

  createBranch(initValue?: string):FormControl {
    if(!initValue) initValue = '';
    return this.formBuilder.control(initValue, [ requiredField ]);
  }

  addBranch() {
    const length = this.termBranches.controls.length + 1;
    this.termBranches.push(this.createBranch(length.toString()));
  }

  removeBranch() {
    const length = this.termBranches.controls.length;

    if(length < 2) return;
    this.termBranches.removeAt(length - 1);
  }

  upload() {
    if(this.isVerifying || this.formGroup.invalid) return;

    this.isVerifying = true;
    const session = this.formGroup.value?.session?.trim();
    const hasChildren = this.formGroup.value?.hasChildren;
    const terms = this.formGroup.value?.terms?.map(t => {
      return t?.trim();
    });

    this.termService.addSession({
      session,
      terms: hasChildren ? terms : []
    })
    .subscribe(res => {
      if(res.statuscode == 200)
      {
        const response = res.dataResponse;
        this.termService.saveCredentials({
          adminId: response.adminId,
          token: response.token
        })
        this.presentToast("Successful");
        this.formGroup.reset();
      }
      else {
        this.presentToast(res.status);
      }

      this.isVerifying = false;
    }, err => {
      this.isVerifying = false;
      this.presentToast(CHECK_INTERNET_CON);
    })

  }

  onInputChange() {
    this.initCheckbox();
  }

  checkboxChange(e) {
    if(e.checked) {
      this.termBranches.enable();
    }
    else {
      this.termBranches.disable();
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

  getPosition(value: number): string {
    if(value % 100 > 10 && value % 100 < 20) {
      return 'th';
    }
    else if(value % 10 == 1) {
      return 'st';
    }
    else if(value % 10 == 2) {
      return 'nd';
    }
    else if(value % 10 == 3) {
      return 'rd';
    }
    else if(!value){
      return '';
    }
    else {
      return 'th';
    }
  }

  matchSibling = (c: AbstractControl) => {
    // Error matcher to detect if the name of the branch is same as another branch
    const formArray = c as FormArray;
    const childControls = formArray.controls;

    const siblingValues: string[] = [];

    formArray.value.forEach(value => {
      siblingValues.push(value);
    });
    
    let hasDuplicate = this.checkDuplicate(siblingValues).hasDuplicate;
    if(!hasDuplicate) return;

    let duplicates = this.checkDuplicate(siblingValues).duplicates;

    childControls.forEach(control => {
      let controlValue = control.value;
      if(this.arrayContains(duplicates, controlValue)) {
        control.setErrors({ matchSibling: true });
      }
    });

    return {
      matchSibling: true
    }
  }
    
  checkDuplicate(values: string[]): { hasDuplicate: boolean, duplicates?: string[] } {
    const valuesMap = {};
    let duplicates: string[] = [];

    let hasDuplicate = false;
    let maxNum = 0;
    values.forEach(value => {
      if(valuesMap[value]) {
        valuesMap[value]++;
      }
      else {
        valuesMap[value] = 1;
      }
    });

    for (const value in valuesMap) {
      if(valuesMap[value] > 1) {
        // maxNum = valuesMap[value];
        duplicates.push(value);
        hasDuplicate = true;
      }
    }

    return{
      hasDuplicate,
      duplicates
    }
  }

  arrayContains(array: any[], value: any) {
    return array.some(arrayValue => arrayValue == value);
  }

  dismissModal() {
    this.modalCtrl.dismiss(addSessionModalID);
  }
}
