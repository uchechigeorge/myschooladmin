import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ICardDetail } from 'src/app/models/card-models';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-expansion-cards',
  templateUrl: './expansion-cards.component.html',
  styleUrls: ['./expansion-cards.component.scss'],
})
export class ExpansionCardsComponent implements OnInit {

  @Input() filterTitle: string = '';
  @Input('filterCards') cards: ICardDetail[];
  @Input() amountText: string = 'Amount';

  public searchString: string = '';
  public lastSearchString: string = '';
  public filterCards: ICardDetail[] = [];
  public showDescription: boolean = false;
  public searchMode: boolean = false;

  @ViewChild(IonInput) searchInput: IonInput;

  constructor() { }

  ngOnInit() {}

  async enterSearchMode() {
    this.searchMode = true;
    this.filterCards = [];
  }

  exitSearchMode() {
    this.searchMode = false;
    this.searchString = '';
  }

  search() {
    if((this.searchString.trim() == "" && this.lastSearchString.trim() == "") || this.lastSearchString.trim() == this.searchString.trim()) {
      return;
    };

    if(this.searchString.trim() == "" || this.cards == null || this.cards.length <= 0) {
      this.filterCards = [];
      this.lastSearchString = this.searchString;
      return;
    }

    this.filterCards = this.cards.filter(card => {
      const details = Object.values(card.details);
      return details.some(detail => {
        let regEx = new RegExp(this.searchString, 'gi');
        let result = regEx.test(detail);
        return result;
      });
    });

    this.lastSearchString = this.searchString.trim();
  }

}
