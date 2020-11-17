import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnrichedGameFile, StatsItem } from 'src/interfaces/outputs';
import { TourButton } from 'src/interfaces/tour';
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

  highlightGames;

  showOverlay = false;
  statsCalculation: StatsCalculationProgress;

  constructor(private storeService: StoreService, private cd: ChangeDetectorRef, private router: Router) { }

  ngOnInit(): void {
    this.storeService.getStore().subscribe(value => {
      if (value) {
        console.log('Home - received new store value : ', value);
        if (value.enrichedGameFiles && !value.reset) {
          console.log('Home - Received enrichedGameFiles from store : ', value.enrichedGameFiles);
          this.enrichedGameFiles = value.enrichedGameFiles;
        }
        if (value.gameFilter && !value.reset) {
          console.log('Home - Received gameFilter from store : ', value.gameFilter);
          this.filter = value.gameFilter;
        }
        if (value.playerCharName && !value.reset) {
          console.log('Home - Received playerCharName from store : ', value.playerCharName);
          this.initStatsIfNeeded();
          this.stats.playerCharName = value.playerCharName;
        }
        if (value.gameResults && !value.reset) {
          console.log('Home - Received gameResults from store : ', value.gameResults);
          this.initStatsIfNeeded();
          this.stats.gameResults = value.gameResults;
        }
        if (value.playerConversions && !value.reset) {
          console.log('Home - Received playerConversions from store : ', value.playerConversions);
          this.initStatsIfNeeded();
          this.stats.playerConversions = value.playerConversions;
        }
        if (value.opponentConversions && !value.reset) {
          console.log('Home - Received opponentConversions from store : ', value.opponentConversions);
          this.initStatsIfNeeded();
          this.stats.opponentConversions = value.opponentConversions;
        }
        if (value.playerOveralls && !value.reset) {
          console.log('Home - Received playerOveralls from store : ', value.playerOveralls);
          this.initStatsIfNeeded();
          this.stats.playerOveralls = value.playerOveralls;
        }
        if (value.opponentOveralls && !value.reset) {
          console.log('Home - Received opponentOveralls from store : ', value.opponentOveralls);
          this.initStatsIfNeeded();
          this.stats.opponentOveralls = value.opponentOveralls;
        }
        if (value.punishedActionsForPlayer && !value.reset) {
          console.log('Home - Received punishedActionsForPlayer from store : ', value.punishedActionsForPlayer);
          this.initStatsIfNeeded();
          this.stats.punishedActionsForPlayer = value.punishedActionsForPlayer;
        }
        if (value.punishedActionsForOpponent && !value.reset) {
          console.log('Home - Received punishedActionsForOpponent from store : ', value.punishedActionsForOpponent);
          this.initStatsIfNeeded();
          this.stats.punishedActionsForOpponent = value.punishedActionsForOpponent;
        }
        if (value.lcancelsForPlayer && !value.reset) {
          console.log('Home - Received lcancelsForPlayer from store : ', value.lcancelsForPlayer);
          this.initStatsIfNeeded();
          this.stats.lcancelsForPlayer = value.lcancelsForPlayer;
        }
        if (value.lcancelsForOpponent && !value.reset) {
          console.log('Home - Received lcancelsForOpponent from store : ', value.lcancelsForOpponent);
          this.initStatsIfNeeded();
          this.stats.lcancelsForOpponent = value.lcancelsForOpponent;
        }
        if (value.ledgeDashesForPlayer && !value.reset) {
          console.log('Home - Received ledgeDashesForPlayer from store : ', value.ledgeDashesForPlayer);
          this.initStatsIfNeeded();
          this.stats.ledgeDashesForPlayer = value.ledgeDashesForPlayer;
        }
        if (value.ledgeDashesForOpponent && !value.reset) {
          console.log('Home - Received ledgeDashesForOpponent from store : ', value.ledgeDashesForOpponent);
          this.initStatsIfNeeded();
          this.stats.ledgeDashesForOpponent = value.ledgeDashesForOpponent;
        }
        if (value.selectedGames && !value.reset) {
          console.log('Home - Received selectedGames from store : ', value.selectedGames);
          // When we select games in stats-game-select
          this.selectedGames = value.selectedGames;
        }
        if (value.statsCalculationProgress && !value.reset) {
          console.log('Home - Received statsCalculationProgress from store : ', value.statsCalculationProgress);
          this.statsCalculation = value.statsCalculationProgress;
          if (value.statsCalculationProgress.current !== value.statsCalculationProgress.total) {
            this.showOverlay = true;
          } else {
            this.showOverlay = false;
          }
        }
        if (value.statsCalculationDone && !value.reset) {
          console.log('Home - Received statsCalculationDone from store : ', value.statsCalculationDone);
          this.showOverlay = false;
        }
        if (this.stats) {
          this.startTourStatsGames();
        }
        if (value.reset) {
          console.log('Home - Received reset from store : ', value.reset);
          this.enrichedGameFiles = value?.enrichedGameFiles ? value.enrichedGameFiles : [];
          this.selectedGames = [];
          this.stats = undefined;
          this.filter = undefined;
          this.storeService.set('reset', false);
          this.router.navigate(['']);
        }
        this.cd.detectChanges();
      }
    });
  }

  private initStatsIfNeeded() {
    if (!this.stats) {
      this.stats = {
        playerCharName: undefined,
        gameResults: undefined,
        playerConversions : undefined,
        opponentConversions : undefined,
        playerOveralls : undefined,
        opponentOveralls : undefined,
        punishedActionsForOpponent: undefined,
        punishedActionsForPlayer: undefined,
        lcancelsForPlayer: undefined,
        lcancelsForOpponent: undefined,
        ledgeDashesForPlayer: undefined,
        ledgeDashesForOpponent: undefined
      };
      
    }
  }

  public startTourStatsGames() {
    if (!(localStorage.getItem('stats-tour-games') === 'complete')) {
      const buttons: TourButton[] = [
        {
          label: 'OK',
          click: () => {
            localStorage.setItem('stats-tour-games', 'complete');
            this.highlightGames = false;
            this.cd.detectChanges();
            this.storeService.resetTour();
            this.storeService.set('goodToGo', 'stats-tour');
          }
        }
      ];
      this.highlightGames = true;
      this.storeService.setMultipleTour([
        {
          key: 'title',
          data: 'Adjusting your filtered games'
        },
        {
          key: 'text',
          data: 'You can add or remove games from the list of games used to make the stats by clicking on them here'
        },
        {
          key: 'buttons',
          data: buttons
        },
        {
          key: 'show',
          data: true
        }
      ]);
    }
  }

  get hasList(): boolean {
    return this.enrichedGameFiles && this.enrichedGameFiles.length > 0;
  }

  get statsCalculationProgress(): number {
    return this.statsCalculation.current / this.statsCalculation.total * 100;
  }
}
