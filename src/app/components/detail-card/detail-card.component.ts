import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { isDefaultImage } from 'src/app/models/card-models';

@Component({
  selector: 'app-detail-card',
  templateUrl: './detail-card.component.html',
  styleUrls: ['./detail-card.component.scss'],
})
export class DetailCardComponent implements OnInit {

  public hasImage: boolean = false;

  @Input() showImage: boolean = true;
  @Input() btnText: string = 'View';
  @Input() altImage: 'icon' | 'text' = 'icon';
  @Input() imageText = '';
  @Input() imgSrc = '';
  @Input() cardData: any;
  @Input() showMenu = false;
  @Input() showBtn = true;
  @Input() allowDblClick = true;

  @Output('btnClick') btnClickEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output('onLoad') onLoadEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output('menuOpen') onMenuClick: EventEmitter<any> = new EventEmitter<any>();


  public details: IDetails[] = [];

  constructor(
    
  ) { }

  private _detailsData: { [key: string]: string } = {};

  @Input() get detailsData() {
    return this._detailsData;
  }

  set detailsData(value) {
    this._detailsData = value;
    this.loadDetails();
  }

  ngOnInit() {
    this.loadDetails();
  }

  loadDetails() {
    this.details = [];
    if(!this.detailsData) return;
    Object.keys(this.detailsData).forEach(key => {
      this.details.push({ title: key });
    });
    Object.values(this.detailsData).forEach((value, i) => {
      this.details[i].value = value;
    });
  }

  onLoad() {
    this.onLoadEvent.emit();
  }

  btnClick(dbl?: boolean) {
    if(dbl && !this.allowDblClick)
      return;

    this.btnClickEvent.emit();
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

  menuOpen(e) {
    this.onMenuClick.emit(e);
  }
}

interface IDetails{
  title?: string,
  value?: string,
}