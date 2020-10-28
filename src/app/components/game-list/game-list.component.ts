import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ElecService } from 'src/app/elec.service';
import { Conversion, EnrichedGameFile, Overall, StatsWrapper } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit, OnChanges {

  @Input() enrichedGameFiles: EnrichedGameFile[];
  @Input() filter: GameFileFilter;

  filteredGameFiles: EnrichedGameFile[];

  constructor(private cd: ChangeDetectorRef,
    private store: StoreService,
    private elecService: ElecService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.enrichedGameFiles?.currentValue) {
      this.enrichedGameFiles = changes.enrichedGameFiles.currentValue as unknown as EnrichedGameFile[];
    }
    if (changes?.filter?.currentValue) {
      this.filter = changes.filter.currentValue as unknown as GameFileFilter;
      this.filterFiles().then(() => this.cd.detectChanges());
    }
  }

  private async filterFiles(): Promise<void> {
    const filteredGames = [];
    for (let game of this.enrichedGameFiles) {
      let toFilterOut = false;
      if (game.playerCharacterPairs.find(pcp => pcp.player === this.filter.slippiId && pcp.character.name === this.filter.character)) {
        // Player Slippi ID ok && player character ok
        const oppIndex = game.playerCharacterPairs.findIndex(pcp => pcp.player !== this.filter.slippiId);
        if (this.filter.oppSlippiIds) {
          // We have a filter on Opponent's Slippi Ids
          if (this.filter.oppSlippiIds.blacklisted?.length > 0) {
            if (this.filter.oppSlippiIds.blacklisted.includes(game.playerCharacterPairs[oppIndex].player)) {
              // If slippiId in opponent blacklist, KO
              toFilterOut = true;
            }
          }
          if (this.filter.oppSlippiIds.whitelisted?.length > 0) {
            if (!this.filter.oppSlippiIds.whitelisted.includes(game.playerCharacterPairs[oppIndex].player)) {
              // If slippiId not in opponent whitelist AND whitelist.length > 0, KO
              toFilterOut = true;
            }
          }
        }
        if (this.filter.oppCharacters) {
          // We have a filter on Opponent's characters
          if (this.filter.oppCharacters.blacklisted?.length > 0) {
            if (this.filter.oppCharacters.blacklisted.includes(game.playerCharacterPairs[oppIndex].character.shortName)) {
              // If character in opponent blacklist, KO
              toFilterOut = true;
            }
          }
          if (this.filter.oppCharacters.whitelisted?.length > 0) {
            if (!this.filter.oppCharacters.whitelisted.includes(game.playerCharacterPairs[oppIndex].character.shortName)) {
              // If character not in opponent whitelist AND whitelist.length > 0, KO
              toFilterOut = true;
            }
          }
        }
        if (this.filter.stages) {
          // We have a filter on stages
          if (this.filter.stages.blacklisted?.length > 0) {
            if (this.filter.stages.blacklisted.includes(game.stage)) {
              // If stage in blacklist, KO
              toFilterOut = true;
            }
          }
          if (this.filter.stages.whitelisted?.length > 0) {
            if (!this.filter.stages.whitelisted.includes(game.stage)) {
              // If stage not in whitelist AND whitelist.length > 0, KO
              toFilterOut = true;
            }
          }
        }
      } else {
        // Either player slippi Id wasn't in game, or playing another character
        toFilterOut = true;
      }
      filteredGames.push({...game, filteredOut: toFilterOut});
    }
    this.filteredGameFiles = filteredGames.sort((game1, game2) => {
      if (game1.filteredOut && game2.filteredOut) {
        return 0;
      } else if (game1.filteredOut) {
        return 1;
      } else {
        return -1;
      }
    });;
  }

  public generateStats(): void {
    this.elecService.ipcRenderer.on('statsProgressTS', (event, arg) => {
      // Callback pour la gestion de l'avancement du calcul des stats
      console.log('Game List - Received statsProgressTS', arg)
    });

    this.elecService.ipcRenderer.on('statsDoneTS', (event, arg) => {
      // Callback pour la fin du calcul des stats
      console.log('Game List - Received statsDoneTS', arg);
      const playerConversions = arg.conversionsOnOpponent as StatsWrapper<Conversion[]>;
      const opponentConversions = arg.conversionsFromOpponent as StatsWrapper<Conversion[]>;
      const playerOveralls = arg.overallOnOpponent as StatsWrapper<Overall>;
      const opponentOveralls = arg.overallFromOpponent as StatsWrapper<Overall>;
      this.store.setMultiple([
        {
          key : 'playerConversions',
          data: playerConversions
        },
        {
          key : 'opponentConversions',
          data: opponentConversions
        },
        {
          key : 'playerOveralls',
          data: playerOveralls
        },
        {
          key : 'opponentOveralls',
          data: opponentOveralls
        },
      ]);
    });

    const toSend = {
      games: this.filteredGameFiles,
      slippiId: this.filter.slippiId,
      character: this.filter.character
    }

    console.log('Game List - Starting Stats Calculation process');
    this.elecService.ipcRenderer.send('calculateStats', toSend);
  }

  public isSelected(game: EnrichedGameFile) {
    return !game.filteredOut;
  }

  get notAllGamesFilteredOut(): boolean {
    let value = false;
    if (this.filteredGameFiles?.length > 0) {
      for (let game of this.filteredGameFiles) {
        if (!game.filteredOut) value = true;
      }
    }
    return value;
  }

}
