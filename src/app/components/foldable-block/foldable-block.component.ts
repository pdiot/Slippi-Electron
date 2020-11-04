import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

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

  @Output()
  toggledEmit = new EventEmitter<boolean>();

  public toggled: boolean = false;
  
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

  toggleDisplay() {
    this.toggled = !this.toggled;
    this.toggledEmit.emit(this.toggled);
    this.cd.detectChanges();
  }

}
