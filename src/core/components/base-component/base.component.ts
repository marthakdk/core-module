import { Component, Input } from '@angular/core';

@Component({
  selector : 'my-base',
  templateUrl: './base.component.html'
})
export class BaseComponent {
  @Input() isBase: boolean = false;
}