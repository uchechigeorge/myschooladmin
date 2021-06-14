import { Directive, Input, HostListener, ElementRef } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appScratchCardInput]'
})
export class ScratchCardInputDirective {

  @Input('appScratchCardInput') isScratchCard: boolean;

  public lastValue: string = '';
  public isBackSpacing: boolean = false;

  constructor(
    private elem: ElementRef<HTMLInputElement>,
    private domCtrl: DomController,
  ) { }

  @HostListener('input', ['$event']) async onInputChange($event) {
    if(!this.isScratchCard) return;

    let input = this.elem.nativeElement;
    let initValue = input.value as any;
    initValue = initValue.replace(/-/g, '');
    
    let initValueArray = initValue.split('') as Array<string>;
    initValueArray.forEach((val, i) => {
      if(i > 3 && (i + 1) % 4 == 0) {
        initValueArray.push('-');
      } 
    })

    let finalValue = initValueArray.join('');

    console.log({initValue, finalValue})
    this.domCtrl.write(() => {
       
      input.value = finalValue;
      this.lastValue = input.value;
    });
  }
}
