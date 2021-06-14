import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { addPaymentsModalID } from 'src/app/models/components-id';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ISelectMultipleOptions, ISelectOptions } from 'src/app/models/list-model';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { requiredField, negativeValidator } from 'src/app/helpers/input-validators';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.scss'],
})
export class AddPaymentComponent implements OnInit {

  @Input() classId: string;
  @Input() termId: string;

  public formGroup = new FormGroup({
    "term": new FormControl("", [ requiredField ]),
    "class": new FormControl("", [ requiredField ]),
    "title": new FormControl("", [ requiredField, Validators.maxLength(50) ]),
    "amount": new FormControl("", [ requiredField, negativeValidator, Validators.maxLength(50) ]),
    "description": new FormControl("", [ Validators.maxLength(500) ]),
    "option": new FormControl("0")
  })

  public selectClasses: ISelectMultipleOptions[] = [];
  public selectTerms: ISelectOptions[] = [];

  public isVerifying: boolean = false;


  constructor(
    private modalCtrl: ModalController,
    private paymentsService: ClassCourseService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.getTerms();
    this.getClasses();
  }
  
  async optionChanged(): Promise<FeesModel[]> {
    const option = this.formGroup.get("option").value;
    const subClassId = this.formGroup.get("class").value;
    const termId = this.formGroup.get("term").value;
    const feesTitle = this.formGroup.get("title").value?.trim();
    const feesAmount = this.formGroup.get("amount").value;
    const description = this.formGroup.get("description").value?.trim();
    if(option == "0") {
      return [
        {
          feesAmount,
          feesTitle,
          subClassId,
          termId,
          description
        }
      ]
    }
    else if(option == "1") {
      const { subClasses } = await this.getClasses();
      let fees: FeesModel[] = [];
      subClasses.forEach(subClass => {
        fees.push({
          feesAmount,
          feesTitle,
          termId,
          description,
          subClassId: subClass.subClassId,
        })
      })

      return fees;
    }
    else if(option == "2") {
      const allClasses = await this.getClasses();
      const currentClass = allClasses.classes.map(c => {
        const subClasses = c.subClasses as Array<any>;
        const current = subClasses.find(subClass => {
          return subClass.subClassId == subClassId;
        });
       return current;
      });

      if(!currentClass[0]) return [
        {
          feesAmount,
          feesTitle,
          subClassId,
          termId,
          description
        }
      ]

      const parentClass = allClasses.classes.find(c => {
        return c.classId == currentClass[0].parentClassId
      });
      
      let fees: FeesModel[] = [];
      parentClass.subClasses.forEach(subClass => {
        fees.push({
          feesAmount,
          feesTitle,
          termId,
          description,
          subClassId: subClass.subClassId,
        })
      })

      return fees;
    }
  }

  async add(e?) {
    if(this.isVerifying || this.formGroup.invalid) return;

    this.isVerifying = true;
    const fees = await this.optionChanged();

    if(!fees) {
      this.presentToast("Please, try again later.")
      return;
    }
    
    const btnElem = e?.target;

    this.paymentsService.addGeneralFees(fees)
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        await this.paymentsService.saveCredentials({
          adminId: res.dataResponse.adminid,
          token: res.dataResponse.token
        });
        this.presentToast("Successful");
        this.formGroup.reset();
        btnElem.disabled = true;
      }
      else {
        this.presentToast(res.status);
      }

      this.isVerifying = false;

    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isVerifying = false;
    })
  }

  async getTerms() {
    this.paymentsService.viewTerm({
      updateType: "10",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        response.forEach(term => {
          this.selectTerms.push({
            text: term.term + this.getPosition(term.term) + " Term-" + term.schoolYear,
            value: term.termId,
          });
        });

        if(this.termId)
          this.formGroup.get("term").setValue(this.termId);
      }
    })
  }

  async getClasses() {
    const selectClasses: ISelectMultipleOptions[] = [];
    const classes = await this.paymentsService.viewClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    const subClasses = await this.paymentsService.viewSubClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    if(!classes || !subClasses) return;

    classes.forEach(c => {
      c.subClasses = [];
      subClasses.forEach(s => {
        if(s.parentClassId == c.classId)
          c.subClasses.push(s);
      });
    });

    classes.forEach(c => {
      if(c.subClasses.length > 0){
        selectClasses.push({
          label: c.className,
          options: c.subClasses.map(s => {
            return {
              text: s.subClassName,
              value: s.subClassId,
            }
          })
        })
      }
    })

    if(this.classId)
          this.formGroup.get("class").setValue(this.classId);

    this.selectClasses = selectClasses;
    return {classes, selectClasses, subClasses};
  }
  
  getPosition(value: number): string {
    if(isNaN(value)) return "";
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

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }
  

  dismissModal() {
    this.modalCtrl.dismiss('', '', addPaymentsModalID);
  }
}

interface FeesModel{ 
  feesTitle: string, 
  feesAmount: string, 
  termId: string, 
  subClassId: string, 
  description?: string 
}