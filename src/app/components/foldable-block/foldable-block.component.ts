import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-foldable-block',
  templateUrl: './foldable-block.component.html',
  styleUrls: ['./foldable-block.component.scss']
})
export class FoldableBlockComponent implements OnInit, OnChanges {

  @Input()
  label: string;

  @Input()
  collapseId: string;
  
  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.label?.currentValue) {
      this.label = changes.label.currentValue;
    }
    if (changes?.collapseId?.currentValue) {
      this.collapseId = changes.collapseId.currentValue;
    }
    this.cd.detectChanges();
  }

}
