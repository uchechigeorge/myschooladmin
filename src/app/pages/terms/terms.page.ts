import { Component, OnInit } from '@angular/core';
import { IFilterCard, ICardDetail } from 'src/app/models/card-models';
import { PopoverController, ModalController, ToastController } from '@ionic/angular';
import { ClassCourseService } from 'src/app/services/class-course.service';
import { CHECK_INTERNET_CON } from 'src/app/components/login/login.component';
import { AddSessionComponent } from 'src/app/components/modals/add/add-session/add-session.component';
import { addSessionModalID, addTermModalID, viewTermModalID, viewSessionModalID } from 'src/app/models/components-id';
import { AddTermComponent } from 'src/app/components/modals/add/add-term/add-term.component';
import { ViewTermComponent } from 'src/app/components/modals/view/view-term/view-term.component';
import { ViewSessionComponent } from 'src/app/components/modals/view/view-session/view-session.component';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage implements OnInit {

  public sessionCards: SessionExpansionCard[] = [];
  public pageNum: number = 1;
  public noOfSessions: number;
  public errMessage: string = "";
  public showError: boolean = false;
  public noMoreSessions: boolean = false;
  public isLoading: boolean = true;


  constructor(
    private termService: ClassCourseService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.isLoading = true;
    this.reset();
    this.getActiveTerm();
    this.getSessions();
  }

  async getSessions() {
    
    this.termService.viewSession({
      updateType: "1",
      pageSize: "100",
      pageNum: this.pageNum.toString(),
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        res.dataResponse.forEach(session => {
          this.sessionCards.push({
            id: session.sessionId,
            title: session.schoolYear,
            cardData: session,
            isLoading: true,
            pageNum: 1,
            termCards: [],
            description: session.isCurrent ? "Current" : "",
            onOpen: () => {
              this.getSessionTerms(session.sessionId);
            },
            refresh: async (e) => {
              this.getSessionCard(session.sessionId).isLoading = true;
              this.getSessionCard(session.sessionId).termCards = [];
              this.getSessionCard(session.sessionId).pageNum = 1;
              await this.getSessionTerms(session.sessionId);
              e?.target.complete()
            },
            onClose: () => {
              this.getSessionCard(session.sessionId).termCards = [];
            },
            actionClick: async () => {
              const modal = await this.modalCtrl.create({
                component: ViewSessionComponent,
                id: viewSessionModalID,
                componentProps: {
                  "sessionId": session.sessionId
                }
              });

              await modal.present();
              await modal.onWillDismiss();
              this.refresh(); 
            }
          });
        });
        this.noOfSessions = res.dataResponse[0].totalRows;
      }
      else if(res.statuscode == 204){
        if(this.pageNum == 1){
          this.errMessage = "No sessions";
          this.showError = true;
        }
        else{
          this.noMoreSessions = true;
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

  async getSessionTerms(id: any) {
    this.getSessionCard(id).isLoading = true;
    this.termService.viewTerm({
      updateType: "4",
      pageSize: "100",
      pageNum: "1",
      qString: id,
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        res.dataResponse.forEach(term => {
          this.getSessionCard(id).termCards.push(
            {
              cardData: term,
              imageText: term.term,
              details: {
                "School Year": term.schoolYear,
                "Term Start": term.termStart ? new Date(term.termStart).toLocaleDateString() : "",
                "Term End": term.termEnd ? new Date(term.termEnd).toLocaleDateString() : "",
              },
              btnClick: async () => {
                const modal = await this.modalCtrl.create({
                  component: ViewTermComponent,
                  id: viewTermModalID,
                  componentProps: {
                    "termId": term.termId
                  }
                });
  
                await modal.present();
                await modal.onWillDismiss();
                this.refresh();
              }
          });
        });
        this.getSessionCard(id).isLoading = false;
        this.getSessionCard(id).showError = false;
      }
      else if(res.statuscode == 204) {
        if(this.getSessionCard(id).pageNum == 1){
          this.getSessionCard(id).errMessage = "No terms";
          this.getSessionCard(id).showError = true;
        }
      }
      else if(res.statuscode == 401) {
        this.getSessionCard(id).errMessage = "Unauthorized";
        this.getSessionCard(id).showError = true;
      }
      else {
        this.presentToast(res.status);
      }

      this.getSessionCard(id).isLoading = false;

    }, (err) => {
      this.getSessionCard(id).isLoading = false;

      this.presentToast(CHECK_INTERNET_CON);
    })

  }

  activeTermCard: ICardDetail[] = [];

  async getActiveTerm() {
    this.termService.viewTerm({
      updateType: "3",
      pageSize: "10",
      pageNum: "1",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const cards = res.dataResponse;
        this.activeTermCard = [];
        cards.forEach(card => {
          this.activeTermCard.push({
            cardData: card,
            details: {
              "School Year": card.schoolYear,
              "Term Start": card.termStart ? new Date(card.termStart).toLocaleDateString() : "",
              "Term End": card.termEnd ? new Date(card.termEnd).toLocaleDateString() : "",
            },
            imageText: card.term,
            btnClick: async () => {
              const modal = await this.modalCtrl.create({
                component: ViewTermComponent,
                id: viewTermModalID,
                componentProps: {
                  "termId": card.termId
                }
              });

              await modal.present();
              await modal.onWillDismiss();
              this.refresh();
            }
          })
        })
      }
    }, err => {
      
    });
  }

  reset() {
    this.pageNum = 1;
    this.showError = false;
    this.errMessage = "";
    this.noMoreSessions = false;
    // this.scroll.disabled = false;
    this.sessionCards = [];
    this.activeTermCard = [];
  }

  async loadData(e) {
    this.pageNum++;
    
    await this.getSessions();
    
    if(this.noMoreSessions) {
      e.target.disabled = true;
    }
    else {
      e.target.complete();
    }

  }

  async addSession() {
    const modal = await this.modalCtrl.create({
      component: AddSessionComponent,
      id: addSessionModalID,
    });

    await modal.present();

    await modal.onWillDismiss();
    this.refresh();
  }

  async addTerm() {
    const modal = await this.modalCtrl.create({
      component: AddTermComponent,
      id: addTermModalID,
    });

    await modal.present();

    await modal.onWillDismiss()
    this.refresh();
  }

  async refresh(e?) {
    this.isLoading = true;
    this.sessionCards = [];
    this.pageNum = 1;
    await this.getActiveTerm();
    await this.getSessions();
    e?.target.complete()
  }

  getSessionCard(id: any) {
    return this.sessionCards.find(card => card.id == id);
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }

}

class SessionExpansionCard{
  id?: any;
  title: string;
  description?: string;
  cardData?: any;
  termCards?: ICardDetail[] = [];
  isLoading?: boolean = false;
  errMessage?: string;
  showError?: boolean;
  pageNum?: number;
  onOpen?: () => any;
  onClose?: () => any;
  refresh?: (e: any) => any;
  actionClick?: (e: any) => any;
}