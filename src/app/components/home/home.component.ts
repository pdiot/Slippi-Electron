import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EnrichedGameFile, StatsItem } from 'src/interfaces/outputs';
import { GameFileFilter, StatsCalculationProgress } from 'src/interfaces/types';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  enrichedGameFiles: EnrichedGameFile[];
  selectedGames: EnrichedGameFile[];
  filter: GameFileFilter;
  stats: StatsItem;

  showOverlay = false;
  statsCalculation: StatsCalculationProgress;

  constructor(private storeService: StoreService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.storeService.getStore().subscribe(value => {
      if (value) {
        if (value.enrichedGameFiles) {
          console.log('Home - Received enrichedGameFiles from store : ', value.enrichedGameFiles);
          this.enrichedGameFiles = value.enrichedGameFiles;
        }
        if (value.gameFilter) {
          console.log('Home - Received gameFilter from store : ', value.gameFilter);
          this.filter = value.gameFilter;
        }
        if (value.playerConversions) {
          console.log('Home - Received playerConversions from store : ', value.playerConversions);
          this.initStatsIfNeeded();
          this.stats.playerConversions = value.playerConversions;
        }
        if (value.opponentConversions) {
          console.log('Home - Received opponentConversions from store : ', value.opponentConversions);
          this.initStatsIfNeeded();
          this.stats.opponentConversions = value.opponentConversions;
        }
        if (value.playerOveralls) {
          console.log('Home - Received playerOveralls from store : ', value.playerOveralls);
          this.initStatsIfNeeded();
          this.stats.playerOveralls = value.playerOveralls;
        }
        if (value.opponentOveralls) {
          console.log('Home - Received opponentOveralls from store : ', value.opponentOveralls);
          this.initStatsIfNeeded();
          this.stats.opponentOveralls = value.opponentOveralls;
        }
        if (value.selectedGames) {
          console.log('Home - Received selectedGames from store : ', value.selectedGames);
          // When we select games in stats-game-select
          this.selectedGames = value.selectedGames;
        }
        if (value.statsCalculationProgress) {
          console.log('Home - Received statsCalculationProgress from store : ', value.statsCalculationProgress);
          this.statsCalculation = value.statsCalculationProgress;
          if (value.statsCalculationProgress.current !== value.statsCalculationProgress.total) {
            this.showOverlay = true;
          } else {
            this.showOverlay = false;
          }
        }
        if (value.statsCalculationDone) {
          console.log('Home - Received statsCalculationDone from store : ', value.statsCalculationDone);
          this.showOverlay = false;
        }
        if (value.reset) {
          console.log('Home - Received reset from store : ', value.reset);
          this.enrichedGameFiles = [];
          this.selectedGames = [];
          this.stats = undefined;
          this.filter = undefined;
          this.storeService.set('reset', false);
        }
        this.cd.detectChanges();
      }
    });
  }

  public resetApp(): void {
    this.storeService.reset();
  }

  private initStatsIfNeeded() {
    if (!this.stats) {
      this.stats = {
        playerConversions : undefined,
        opponentConversions : undefined,
        playerOveralls : undefined,
        opponentOveralls : undefined,
      };
    }
  }

  get hasList(): boolean {
    return this.enrichedGameFiles && this.enrichedGameFiles.length > 0;
  }

  get statsCalculationProgress(): number {
    return this.statsCalculation.current / this.statsCalculation.total * 100;
  }
}
