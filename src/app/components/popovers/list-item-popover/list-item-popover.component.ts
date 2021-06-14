import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-list-item-popover',
  templateUrl: './list-item-popover.component.html',
  styleUrls: ['./list-item-popover.component.scss'],
})
export class ListItemPopoverComponent implements OnInit {

  @Input() options: { text: string, handler: () => void }[] = [];

  constructor() { }

  ngOnInit() {}

}
