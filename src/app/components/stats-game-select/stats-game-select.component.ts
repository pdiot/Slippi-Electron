import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { EnrichedGameFile, StatsItem } from 'src/interfaces/outputs';
import { StoreService } from 'src/services/store/store.service';
import GameFileUtils from '../utils/gameFile.utils';

@Component({
  selector: 'app-stats-game-select',
  templateUrl: './stats-game-select.component.html',
  styleUrls: ['./stats-game-select.component.scss']
})
export class StatsGameSelectComponent implements OnInit {
  
  @Input() stats: StatsItem;
  @Input() enrichedGameFiles: EnrichedGameFile[];

  games: string[];
  filteredEnrichedGameFiles: {active: boolean, shortName: string, enrichedGameFile: EnrichedGameFile}[];

  constructor(private cd: ChangeDetectorRef, private store: StoreService) { }

  ngOnInit(): void {
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.stats?.currentValue) {
      this.stats = changes.stats.currentValue as unknown as StatsItem;
    }
    if (changes?.enrichedGameFiles?.currentValue) {
      this.enrichedGameFiles = changes.enrichedGameFiles.currentValue as unknown as EnrichedGameFile[];
    }
    if (this.stats && this.enrichedGameFiles) {
      this.setupGames();
      this.sendSelectedGames();
    }
    this.cd.detectChanges();
  }

  public toggleGame(gameShortName: string) {
    for (let fegf of this.filteredEnrichedGameFiles) {
      if (fegf.shortName === gameShortName) {
        fegf.active = !fegf.active;
      }
    }
    this.sendSelectedGames();
    this.cd.detectChanges();
  }

  public isActive(gameShortName: string) {
    const game = this.filteredEnrichedGameFiles.find(fegf => fegf.shortName === gameShortName);
    if (game?.active) {
      return true;
    } else {
      return false;
    }
  }

  private sendSelectedGames(): void {
    let gamesToSend: EnrichedGameFile[] = [];
    for (let fegf of this.filteredEnrichedGameFiles) {
      if (fegf.active) {
        gamesToSend.push(fegf.enrichedGameFile);
      }
    }
    this.store.set('selectedGames', gamesToSend);
  }

  private setupGames(): void {
    this.games = [];
    for (let gameFile of Object.keys(this.stats.playerConversions)) {
      this.games.push(gameFile);
    }
    this.filteredEnrichedGameFiles = [];
    for (let eGame of this.enrichedGameFiles) {
      if (eGame.file) {
        if (this.games.includes(GameFileUtils.niceName(eGame.file))) {
          // It's one of the games we got the stats on
          this.filteredEnrichedGameFiles.push({
            active: true,
            shortName: GameFileUtils.niceName(eGame.file),
            enrichedGameFile: eGame
          });
        }
      }
    }
  }

}
