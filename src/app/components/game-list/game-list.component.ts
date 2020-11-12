import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ElecService } from 'src/app/elec.service';
import { Conversion, EnrichedGameFile, LCancels, Ledgedashes, Overall, PunishedActions, StatsWrapper } from 'src/interfaces/outputs';
import { GameFileFilter, StatsCalculationProgress } from 'src/interfaces/types';
import { StoreService } from 'src/services/store/store.service';
import GameFileUtils from '../utils/gameFile.utils';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit, OnChanges {

  @Input() enrichedGameFiles: EnrichedGameFile[];
  @Input() filter: GameFileFilter;

  filteredGameFiles: EnrichedGameFile[];

  overrideFilter: {game: EnrichedGameFile, toProcess: boolean}[] = [];

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

  public toggleGame(game: EnrichedGameFile) {
    const gameIndexInFilter = this.overrideFilter.findIndex(filter => GameFileUtils.niceName(filter.game.file) === GameFileUtils.niceName(game.file));
    if (gameIndexInFilter !== -1) {
      if (this.overrideFilter[gameIndexInFilter].toProcess) {
        // If we were forcing the game in, we now force it out
        this.overrideFilter[gameIndexInFilter].toProcess = false;
      } else {
        // If we were forcing the game out, we now remove it from the filter and let the standard filter do it's job
        this.overrideFilter = this.overrideFilter.filter(filter => filter.game.file !== game.file);
      }
    } else {
      // If the game isn't in the filter (ie first click) we force it in
      this.overrideFilter.push({game, toProcess: true});
    }
    this.cd.detectChanges();
  }

  private async filterFiles(): Promise<void> {
    const filteredGames = [];
    for (let game of this.enrichedGameFiles) {
      let toFilterOut = false;
      if (!toFilterOut && game.playerCharacterPairs.find(pcp => pcp.player === this.filter.slippiId && pcp.character.name === this.filter.character)) {
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
    if (this.notAllGamesFilteredOut) {
      this.elecService.ipcRenderer.on('statsProgressTS', (event, arg) => {
        // Callback pour la gestion de l'avancement du calcul des stats
        console.log('Game List - Received statsProgressTS', arg)
        this.store.set('statsCalculationProgress', arg as StatsCalculationProgress);
      });
      this.elecService.ipcRenderer.on('statsDoneTS', (event, arg) => {
        // Callback pour la fin du calcul des stats
        console.log('Game List - Received statsDoneTS', arg);
        const playerConversions = arg.conversionsOnOpponent as StatsWrapper<Conversion[]>;
        const opponentConversions = arg.conversionsFromOpponent as StatsWrapper<Conversion[]>;
        const playerOveralls = arg.overallOnOpponent as StatsWrapper<Overall>;
        const opponentOveralls = arg.overallFromOpponent as StatsWrapper<Overall>;
        const punishedActionsForPlayer = arg.punishedActionsForPlayer as StatsWrapper<PunishedActions>;
        const punishedActionsForOpponent = arg.punishedActionsForOpponent as StatsWrapper<PunishedActions>;
        const lcancelsForPlayer = arg.lcancelsForPlayer as StatsWrapper<LCancels>;
        const lcancelsForOpponent = arg.lcancelsForOpponent as StatsWrapper<LCancels>;
        const ledgeDashesForPlayer = arg.ledgeDashesForPlayer as StatsWrapper<Ledgedashes>;
        const ledgeDashesForOpponent = arg.ledgeDashesForOpponent as StatsWrapper<Ledgedashes>;
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
          {
            key : 'punishedActionsForPlayer',
            data: punishedActionsForPlayer
          },
          {
            key : 'punishedActionsForOpponent',
            data: punishedActionsForOpponent
          },
          {
            key : 'lcancelsForPlayer',
            data: lcancelsForPlayer
          },
          {
            key : 'lcancelsForOpponent',
            data: lcancelsForOpponent
          },
          {
            key: 'ledgeDashesForPlayer',
            data: ledgeDashesForPlayer
          },
          {
            key: 'ledgeDashesForOpponent',
            data: ledgeDashesForOpponent
          },
          {
            key : 'statsCalculationDone',
            data: true
          },
        ]);
      });
  
      const toSend = this.buildToSend();
  
      console.log('Game List - Starting Stats Calculation process');
      this.store.set('statsCalculationProgress', {current: 0, total: toSend.games.length} as StatsCalculationProgress);
      this.elecService.ipcRenderer.send('calculateStats', toSend);
    } else {
      alert(`Please select at least one game to generate stats on`);
    }    
  }

  private buildToSend(): {games: EnrichedGameFile[], slippiId: string, character: string} {
    let games: EnrichedGameFile[] = [];
    for (let game of this.filteredGameFiles) {
        if (!game.filteredOut) {
          // not filteredOut normally : we check whether it's forced out in the overrirde, then we take it or not
          const fromOverride = this.overrideFilter.find(filter => filter.game.file === game.file);
          if (fromOverride && !fromOverride.toProcess) {
            // We don't take it
          } else {
            // We take it whether it's forced in or not, because it's not filteredOut
            games.push(game);
          }
      }
    }

    for (let filter of this.overrideFilter) {
      if (filter.toProcess) {
        // We check whether we already have it. If not, push.
        const fromOverride = games.find(game => game.file === filter.game.file);
        if (!fromOverride) {
          games.push({...filter.game, filteredOut: false});
        }
      }
    }

    for (let game of games) {
      for (let pcp of game.playerCharacterPairs) {
        if (pcp.player === this.filter.slippiId) {
          pcp.isCurrentPlayer = true;
          pcp.port = this.getPortFromLocalName(pcp.player);
        } else {
          pcp.isCurrentPlayer = false;
          pcp.port = this.getPortFromLocalName(pcp.player);
        }
      }
    }

    return {
      games,
      slippiId: this.filter.slippiId,
      character: this.filter.character
    }
  }

  public isSelected(game: EnrichedGameFile): boolean {
    return !game.filteredOut;
  }

  public isForcedIn(game: EnrichedGameFile): boolean {
    const gameInFilter = this.overrideFilter.find(filter => GameFileUtils.niceName(filter.game.file) === GameFileUtils.niceName(game.file));
    if (gameInFilter?.toProcess) {
      return true;
    } else {
      return false;
    }
  }

  public isForcedOut(game: EnrichedGameFile): boolean {
    const gameIndexInFilter = this.overrideFilter.findIndex(filter => GameFileUtils.niceName(filter.game.file) === GameFileUtils.niceName(game.file));
    if (gameIndexInFilter !== -1) {
      if (this.overrideFilter[gameIndexInFilter].toProcess) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  get notAllGamesFilteredOut(): boolean {
    let value = false;
    if (this.filteredGameFiles?.length > 0) {
      for (let game of this.filteredGameFiles) {
        if (!game.filteredOut) {
          if (!this.overrideFilter.find(filter => filter.game.file === game.file && !filter.toProcess)) {
            value = true;
          }
        }           
      }
    }
    // TODO update with overrideFilter
    return value;
  }

  getPortFromLocalName(localName: string): number {
    return (+localName.slice(-1)) - 1 ;
  }

}
