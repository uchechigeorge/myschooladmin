import { Component, OnInit, ChangeDetectorRef, ViewChildren, Input } from '@angular/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { addClassModalID } from 'src/app/models/components-id';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { requiredField } from 'src/app/helpers/input-validators';
import { ApiDataService } from 'src/app/services/api-data.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelect } from '@angular/material/select';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-add-class',
  templateUrl: './add-class.component.html',
  styleUrls: ['./add-class.component.scss'],
})
export class AddClassComponent implements OnInit {

  @Input() type: "class" | "subclass";

  public classForm = new FormControl("", [requiredField, Validators.maxLength(50)]);
  public subClassForm = new FormGroup({
    "parent": new FormControl("", [requiredField]),
    "child": new FormControl("", [requiredField]),
  });
  public teachers: string[] = [];
  public selectClasses: { value: string, text: string }[] = [];
  public isVerifying: boolean = false;

  @ViewChildren(MatSelect) selectElem: MatSelect[];

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private classService: ClassCourseService,
    private apiData: ApiDataService,
    changeDetectorRef: ChangeDetectorRef,
  ) { 
    this.setBackBtnPriority();
  }

  ngOnInit() {
    this.getClasses();
  }

  addSubClass(e) {
    if(this.isVerifying || this.subClassForm.invalid) return;

    const btnElem = e.target;
    const subClassName = this.subClassForm.value?.child.trim();
    const parentClassId = this.subClassForm.value?.parent.trim();
    this.isVerifying = true;

    this.classService.addSubClass({ subClassName, parentClassId })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        await this.classService.saveCredentials({
          adminId: response.adminid,
          token: response.token,
        });
        this.classForm.reset();
        btnElem.disabled = true;
        this.presentToast("Successful");
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

  addClass(e) {
    if(this.isVerifying || this.classForm.invalid) return;

    const btnElem = e.target;
    
    this.isVerifying = true;
    this.classService.addClass({ className: this.classForm.value?.trim() })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        await this.classService.saveCredentials({
          adminId: response.adminid,
          token: response.token,
        });
        this.classForm.reset();
        btnElem.disabled = true;
        this.presentToast("Successful");
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

  async getClasses() {
    
    this.classService.viewClass({
      updateType: "10",
      // pageSize: "20",
      // pageNum: "10"
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        res.dataResponse.forEach(aClass => {
          this.selectClasses.push({
           text: aClass.className,
           value: aClass.classId
        });
      })
    }

    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
    })
  }


  matchParent = (c: AbstractControl): { matchParent: boolean } => {
    // Error matcher to detect if the name of the parent class is same as a branch
    const value = c.value as string;
    const parent = c.parent?.parent?.parent;

    if(!parent) return;
    const className = parent.get('className');
    if(value == null || value == '' || className.value == null) return;

    
    if(this.normalizeClass(value) == this.normalizeClass(className.value)) {
      return { matchParent: true };
    }
  }

  matchChild = (c: AbstractControl): { matchChild: boolean} => {
    const value = c.value as string;
    const hasChildren = c.parent?.get('hasChildren').value as boolean;
    if(!hasChildren) return;

    const childControls = c.parent?.get('classBranches') as FormArray;
    if(!childControls) return;

    const childValues: string[] = [];
      childControls?.value.forEach(value => {
      childValues.push(value.classBranch);
    });

    let hasMatch = this.checkChildMatch(childValues, value).hasMatch;
    if(!hasMatch) return;

    let matches = this.checkChildMatch(childValues, value).matches;
    childControls.controls.forEach(control => {
      let controlValue = this.normalizeClass(control.value.classBranch);
      if(this.arrayContains(matches, controlValue)) {
        control.get('classBranch').setErrors({ matchParent: true });
      }
    });

  }

  matchSibling = (c: AbstractControl) => {
  // Error matcher to detect if the name of the branch class is same as another branch
    const formArray = c as FormArray;
    const childControls = formArray.controls;

    const siblingValues: string[] = [];

    formArray.value.forEach(value => {
      siblingValues.push(value.classBranch);
    });
    
    let hasDuplicate = this.checkDuplicate(siblingValues).hasDuplicate;
    if(!hasDuplicate) return;

    let duplicates = this.checkDuplicate(siblingValues).duplicates;

    childControls.forEach(control => {
      let controlValue = this.normalizeClass(control.value.classBranch);
      if(this.arrayContains(duplicates, controlValue)) {
        control.get('classBranch').setErrors({ matchSibling: true });
      }
    });

    return {
      matchSibling: true
    }
  }

  wait = (ms: number) => new Promise<any>(resolve => setTimeout(resolve, ms)); 
  
  normalizeClass(value: string) {
    return value?.toLowerCase().replace(/\s/g, '');
  }

  checkDuplicate(values: string[]): { hasDuplicate: boolean, duplicates?: string[] } {
    const valuesMap = {};
    let duplicates: string[] = [];

    let hasDuplicate = false;
    let maxNum = 0;
    values.forEach(value => {
      if(valuesMap[this.normalizeClass(value)]) {
        valuesMap[this.normalizeClass(value)]++;
      }
      else {
        valuesMap[this.normalizeClass(value)] = 1;
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

  checkChildMatch(values: string[], matchValue: string): { hasMatch: boolean, matches?: string[]  } {
    let hasMatch: boolean;
    let matches: string[] = [];
   
    values.forEach(value => {
      if(this.normalizeClass(value) == this.normalizeClass(matchValue)) {
        hasMatch = true;
        matches.push(this.normalizeClass(value));
      }
    });

    return {
      hasMatch,
      matches
    }
  }

  setBackBtnPriority() {
    this.platform.backButton.subscribeWithPriority(200, () => {
      this.selectElem.forEach(elem => {
        if(elem.panelOpen)
          elem.close();
      })
    });
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
    this.modalCtrl.dismiss('', '', addClassModalID);
  }
}
