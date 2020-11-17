import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TourButton } from 'src/interfaces/tour';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-app-tour',
  templateUrl: './app-tour.component.html',
  styleUrls: ['./app-tour.component.scss']
})
export class AppTourComponent implements OnInit {

  title: string;
  text: string;
  buttons: TourButton[];
  anchor: ViewChild;
  placement: 'left' | 'right' | 'top' | 'bottom';
  show: boolean;

  constructor(private store: StoreService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.store.getStoreTour().subscribe(value => {
      if (value) {
        if (value.anchor) {
          this.anchor = value.anchor;
        }
        if (value.title) {
          this.title = value.title;
        }
        if (value.text) {
          this.text = value.text;
        }
        if (value.placement) {
          this.placement = value.placement;
        }
        if (value.show) {
          this.show = value.show;
        }
        if (value.buttons) {
          this.buttons = value.buttons;
        }
        if (value.reset) {
          this.anchor = undefined;
          this.title = undefined;
          this.text = undefined;
          this.placement = undefined;
          this.show = undefined;
          this.buttons = undefined;
          this.store.setTour('reset', false);
        }
        this.cd.detectChanges();
      }
    });
  }



}
