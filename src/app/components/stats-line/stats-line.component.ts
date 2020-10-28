import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-stats-line',
  templateUrl: './stats-line.component.html',
  styleUrls: ['./stats-line.component.scss']
})
export class StatsLineComponent implements OnInit, OnChanges {

  @Input() label: string
  @Input() value: string | number

  constructor(private cd : ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.label?.currentValue) {
      this.label = changes.label.currentValue;
    }
    if (changes?.value?.currentValue) {
      this.value = changes.value.currentValue;
    }
    this.cd.detectChanges();
  }

}
