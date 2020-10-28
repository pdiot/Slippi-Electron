import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EnrichedGameFile, StatsItem } from 'src/interfaces/outputs';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})
export class SidePanelComponent implements OnInit, OnChanges {

  @Input()
  enrichedGameFiles: EnrichedGameFile[];
  
  @Input() stats: StatsItem;

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Side Panel - ngOnChanges, changes : ', changes);
    if (changes?.enrichedGameFiles?.currentValue) {
      this.enrichedGameFiles = changes.enrichedGameFiles.currentValue;
    }
    if (changes?.stats?.currentValue) {
      this.stats = changes.stats.currentValue as unknown as StatsItem;
    }
    this.cd.detectChanges();
  }
}
