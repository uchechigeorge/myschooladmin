import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-add-student-logo',
  templateUrl: './add-student-logo.component.html',
  styleUrls: ['./add-student-logo.component.scss'],
})
export class AddStudentLogoComponent implements OnInit {

  @Input() public primary: number = 1;

  constructor() { }

  ngOnInit() {}

}
