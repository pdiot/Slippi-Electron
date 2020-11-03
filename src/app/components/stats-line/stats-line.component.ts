import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-stats-line',
  templateUrl: './stats-line.component.html',
  styleUrls: ['./stats-line.component.scss']
})
export class StatsLineComponent implements OnInit, OnChanges {

  @Input() label: string;
  @Input() value: string;
  @Input() value2: string;
  @Input() unit1: string;
  @Input() unit2: string;

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
    if (changes?.value2?.currentValue) {
      this.value2 = changes.value2.currentValue;
    }
    if (changes?.unit1?.currentValue) {
      this.unit1 = changes.unit1.currentValue;
    }
    if (changes?.unit2?.currentValue) {
      this.unit2 = changes.unit2.currentValue;
    }
    this.cd.detectChanges();
  }

}
