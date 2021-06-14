import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeskShotComponent } from './desk-shot.component';

describe('DeskShotComponent', () => {
  let component: DeskShotComponent;
  let fixture: ComponentFixture<DeskShotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeskShotComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeskShotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
