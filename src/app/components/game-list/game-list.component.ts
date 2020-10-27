import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EnrichedGameFile } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit, OnChanges {

  @Input() enrichedGameFiles: EnrichedGameFile[];
  @Input() filter: GameFileFilter;

  filteredGameFiles: EnrichedGameFile[];

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('onChanges, changes : ', changes);
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
    console.log('Post filter filteredGameFiles : ', this.filteredGameFiles);
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
