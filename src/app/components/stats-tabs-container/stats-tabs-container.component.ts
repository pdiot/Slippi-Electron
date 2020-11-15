import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stats-tabs-container',
  templateUrl: './stats-tabs-container.component.html',
  styleUrls: ['./stats-tabs-container.component.scss']
})
export class StatsTabsContainerComponent implements OnInit {

  constructor(private cd : ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  selectedIndexChange(data) {
    console.log('Selected Index Change', data);
  }
  selectedTabChange(data) {
    console.log('Selected Tab Change', data);
  }

  focusChange(data) {
    console.log('Focus change', data);
    this.cd.detectChanges();
  }


}
