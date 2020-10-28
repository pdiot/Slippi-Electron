import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EnrichedGameFile, StatsItem } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.scss']
})
export class MainPanelComponent implements OnInit, OnChanges {

  @Input() enrichedGameFiles: EnrichedGameFile[];

  @Input() filter: GameFileFilter;

  @Input() stats: StatsItem;

  @Input() selectedGames: EnrichedGameFile[];

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Main Panel - ngOnChanges, changes : ', changes);
    if (changes?.enrichedGameFiles?.currentValue) {
      this.enrichedGameFiles = changes.enrichedGameFiles.currentValue as unknown as EnrichedGameFile[];
    }
    if (changes?.filter?.currentValue) {
      this.filter = changes.filter.currentValue as unknown as GameFileFilter;
    }
    if (changes?.stats?.currentValue) {
      this.stats = changes.stats.currentValue as unknown as StatsItem;
    }
    if (changes?.selectedGames?.currentValue) {
      this.selectedGames = changes.selectedGames.currentValue as unknown as EnrichedGameFile[];
    }
    this.cd.detectChanges();
  }

  get hasEnrichedGameFiles(): boolean {
    return this.enrichedGameFiles && this.enrichedGameFiles.length > 0;
  }

}
