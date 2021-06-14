import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-home-card',
  templateUrl: './home-card.component.html',
  styleUrls: ['./home-card.component.scss'],
})
export class HomeCardComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

  @Input('header') title = '';
  @Input() value = '0';
  @Input() toolTip = '';

}
