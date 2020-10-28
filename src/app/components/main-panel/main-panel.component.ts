import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EnrichedGameFile } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.scss']
})
export class MainPanelComponent implements OnInit, OnChanges {

  @Input() enrichedGameFiles: EnrichedGameFile[];

  @Input() filter: GameFileFilter;

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Main Panel - ngOnChanges, changes : ', changes);
    if (changes?.enrichedGameFiles?.currentValue) {
      this.enrichedGameFiles = changes.enrichedGameFiles.currentValue;
      this.cd.detectChanges();
    }
    if (changes?.filter?.currentValue) {
      this.filter = changes.filter.currentValue as unknown as GameFileFilter;
      this.cd.detectChanges();
    }
  }

  get hasEnrichedGameFiles(): boolean {
    return this.enrichedGameFiles && this.enrichedGameFiles.length > 0;
  }

}
