import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EnrichedGameFile } from 'src/interfaces/outputs';
import { ExternalCharacter, GameFileFilter, WhiteBlackList } from 'src/interfaces/types';
import { IconsService } from 'src/services/icons/icons.service';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.scss']
})
export class FilterFormComponent implements OnInit, OnChanges {

  @Input()
  enrichedGameFiles: EnrichedGameFile[];
  
  filterForm: FormGroup;

  constructor(private fb: FormBuilder, 
              private store: StoreService,
              private cd: ChangeDetectorRef,
              private icons: IconsService) { }

  playerIdsData: string[];
  charactersData: string[];
  stagesData: string[];

  playerCharacters: string[];
  opponentIds: string[];
  opponentCharacters: string[];
  filteredStages: string[];


  ngOnInit(): void {
    this.filterForm = this.fb.group({
      playerId: null,
      playerCharacter: null,
      opponentIds: {blacklisted:[], whitelisted:[]},
      opponentCharacters: {blacklisted:[], whitelisted:[]},
      filteredStages: {blacklisted:[], whitelisted:[]},
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('filter form - ngOnChanges, changes : ', changes);
    if (changes?.enrichedGameFiles?.currentValue) {
      this.enrichedGameFiles = changes.enrichedGameFiles.currentValue as unknown as EnrichedGameFile[];
      this.processPlayers();
    }
  }

  private sendFilter(): void {
    const playerId: string = this.filterForm.controls['playerId'].value;
    const playerCharacter: string = this.filterForm.controls['playerCharacter'].value;
    const opponentIds: WhiteBlackList = this.filterForm.controls['opponentIds'].value;
    const opponentCharacters: WhiteBlackList = this.filterForm.controls['opponentCharacters'].value;
    const filteredStages: WhiteBlackList = this.filterForm.controls['filteredStages'].value;

    const filter: GameFileFilter = {
      slippiId: playerId,
      character: playerCharacter,
      oppSlippiIds : opponentIds,
      oppCharacters : opponentCharacters,
      stages: filteredStages
    }
    console.log('Filter Form - Saving filter');
    this.store.set('gameFilter', filter);
  }

  // TEMPLATE INTERACTION

  public selectPlayer(value:string): void {
    this.resetAll();
    this.filterForm.controls['playerId'].setValue(value);
    this.processPlayerCharacters();
    this.cd.detectChanges();
  }

  public selectPlayerCharacter(value:string): void {
    this.filterForm.controls['playerCharacter'].setValue(value);
    this.processOpponents();
    this.processOpponentCharacters();
    this.processStages();
    this.sendFilter();
    this.cd.detectChanges();
  }

  public toggleOpponent(value:string): void {
    const currentWhitelist = this.filterForm.controls['opponentIds'].value.whitelisted;
    const currentBlacklist = this.filterForm.controls['opponentIds'].value.blacklisted;

    if ((currentWhitelist as string[]).includes(value)){
      this.filterForm.controls['opponentIds'].setValue(
        {
          whitelisted: (currentWhitelist as string[]).filter(id => id !== value),
          blacklisted: [...currentBlacklist, value],
        }        
      );
    } else if ((currentBlacklist as string[]).includes(value)){
      this.filterForm.controls['opponentIds'].setValue(
        {
          whitelisted: currentWhitelist,
          blacklisted: (currentBlacklist as string[]).filter(id => id !== value),
        }     
      );
    } else {
      this.filterForm.controls['opponentIds'].setValue(
        {
          whitelisted: [...currentWhitelist, value],
          blacklisted: currentBlacklist
        }
      );
    }
    this.cd.detectChanges();
    this.sendFilter();
  }

  public toggleOpponentCharacter(value: string): void {
    const currentWhitelist = this.filterForm.controls['opponentCharacters'].value.whitelisted;
    const currentBlacklist = this.filterForm.controls['opponentCharacters'].value.blacklisted;

    if ((currentWhitelist as string[]).includes(value)){
      this.filterForm.controls['opponentCharacters'].setValue(
        {
          whitelisted: (currentWhitelist as string[]).filter(id => id !== value),
          blacklisted: [...currentBlacklist, value],
        }        
      );
    } else if ((currentBlacklist as string[]).includes(value)){
      this.filterForm.controls['opponentCharacters'].setValue(
        {
          whitelisted: currentWhitelist,
          blacklisted: (currentBlacklist as string[]).filter(id => id !== value),
        }     
      );
    } else {
      this.filterForm.controls['opponentCharacters'].setValue(
        {
          whitelisted: [...currentWhitelist, value],
          blacklisted: currentBlacklist
        }
      );
    }
    this.cd.detectChanges();
    this.sendFilter();
  }
  
  public toggleStage(value: string): void {
    const currentWhitelist = this.filterForm.controls['filteredStages'].value.whitelisted;
    const currentBlacklist = this.filterForm.controls['filteredStages'].value.blacklisted;

    if ((currentWhitelist as string[]).includes(value)){
      this.filterForm.controls['filteredStages'].setValue(
        {
          whitelisted: (currentWhitelist as string[]).filter(id => id !== value),
          blacklisted: [...currentBlacklist, value],
        }        
      );
    } else if ((currentBlacklist as string[]).includes(value)){
      this.filterForm.controls['filteredStages'].setValue(
        {
          whitelisted: currentWhitelist,
          blacklisted: (currentBlacklist as string[]).filter(id => id !== value),
        }     
      );
    } else {
      this.filterForm.controls['filteredStages'].setValue(
        {
          whitelisted: [...currentWhitelist, value],
          blacklisted: currentBlacklist
        }
      );
    }
    this.cd.detectChanges();
    this.sendFilter();
  }

  // INTERNAL TAMBOUILLE
  
  private processPlayers(): void {
    this.playerIdsData = [];
    for (let gameFile of this.enrichedGameFiles) {
      if (!this.playerIdsData.includes(gameFile.playerCharacterPairs[0].player)) {
        this.playerIdsData.push(gameFile.playerCharacterPairs[0].player);
      }
      if (!this.playerIdsData.includes(gameFile.playerCharacterPairs[1].player)) {
        this.playerIdsData.push(gameFile.playerCharacterPairs[1].player);
      }
    }
  }

  private processPlayerCharacters(): void {
    this.resetPlayerCharacter();
    const playerId = this.filterForm.controls['playerId'].value;
    for (let gameFile of this.enrichedGameFiles) {
      const pc = gameFile.playerCharacterPairs.find(pcp => pcp.player === playerId);
      if (pc && !this.playerCharacters.includes(pc.character.shortName)) {
        this.playerCharacters.push(pc.character.shortName);
      }
    }
  }
  
  private processOpponents(): void {
    this.resetOpponentIds();
    const playerId = this.filterForm.controls['playerId'].value;
    const playerCharacter = this.filterForm.controls['playerCharacter'].value;
    for (let gameFile of this.enrichedGameFiles) {
      let opponentId;
      if (gameFile.playerCharacterPairs.find(pcp => pcp.player === playerId && pcp.character.shortName === playerCharacter) ) {
        // We're processing a match with both our player and character
        opponentId = gameFile.playerCharacterPairs.find(pcp => pcp.player !== playerId).player;
        if (opponentId) {
          if (!this.opponentIds.includes(opponentId)) {
            this.opponentIds.push(opponentId);
          }
        }
      }
    }
  }

  private processOpponentCharacters(): void {
    this.resetOpponentCharacters();
    const playerId = this.filterForm.controls['playerId'].value;
    const playerCharacter = this.filterForm.controls['playerCharacter'].value;
    for (let gameFile of this.enrichedGameFiles) {
      let opponentChar : ExternalCharacter;
      if (gameFile.playerCharacterPairs.find(pcp => pcp.player === playerId && pcp.character.shortName === playerCharacter) ) {
        // We're processing a match with both our player and character
        opponentChar = gameFile.playerCharacterPairs.find(pcp => pcp.player !== playerId).character;
        if (opponentChar) {
          if (!this.opponentCharacters.includes(opponentChar.shortName)) {
            this.opponentCharacters.push(opponentChar.shortName);
          }
        }
      }
    }
  }

  private processStages() : void {
    this.resetStages();
    const playerId = this.filterForm.controls['playerId'].value;
    const playerCharacter = this.filterForm.controls['playerCharacter'].value;
    for (let gameFile of this.enrichedGameFiles) {
      if (gameFile.playerCharacterPairs.find(pcp => pcp.player === playerId && pcp.character.shortName === playerCharacter) ) {
        // We're processing a match with both our player and character
        if (!this.filteredStages.includes(gameFile.stage)) {
          this.filteredStages.push(gameFile.stage);
        }
      }
    }
  }

  private resetAll(): void {
    this.resetPlayerCharacter();
    this.resetOpponentIds();
    this.resetOpponentCharacters();
    this.resetStages();
  }

  private resetPlayerCharacter(): void {
    this.playerCharacters = [];
    this.filterForm.controls['playerCharacter'].setValue(null);
  }

  private resetOpponentIds(): void {
    this.opponentIds = [];
    this.filterForm.controls['opponentIds'].setValue({blacklisted:[], whitelisted:[]});
  }

  private resetOpponentCharacters(): void {
    this.opponentCharacters = [];
    this.filterForm.controls['opponentCharacters'].setValue({blacklisted:[], whitelisted:[]});
  }

  private resetStages(): void {
    this.filteredStages = [];
    this.filterForm.controls['filteredStages'].setValue({blacklisted:[], whitelisted:[]});
  }
  
  // TEMPLATE FUNCTIONS

  public getCharacterPicture(characterShortName: string): string {
    return this.icons.getCharacterIcon(characterShortName);
  }
  public getStagePicture(stage: string): string {
    return this.icons.getStageMiniatureName(stage).miniature;
  }

  public isActiveOpponent(value: string): boolean {
    return (this.filterForm.controls['opponentIds'].value.whitelisted as string[]).includes(value);
  }

  public isActiveOpponentCharacter(value: string): boolean {
    return (this.filterForm.controls['opponentCharacters'].value.whitelisted as string[]).includes(value);
  }

  public isActiveStage(value: string): boolean {
    return (this.filterForm.controls['filteredStages'].value.whitelisted as string[]).includes(value);
  }  

  public isIgnoredOpponent(value: string): boolean {
    return (this.filterForm.controls['opponentIds'].value.blacklisted as string[]).includes(value);
  }

  public isIgnoredOpponentCharacter(value: string): boolean {
    return (this.filterForm.controls['opponentCharacters'].value.blacklisted as string[]).includes(value);
  }

  public isIgnoredStage(value: string): boolean {
    return (this.filterForm.controls['filteredStages'].value.blacklisted as string[]).includes(value);
  }

  get playerIdColSize(): string {
    switch (this.playerIdsData.length) {
      case 1:
        return 'col';
      case 2:
        return 'col-6';
      case 3:
        return 'col-4';
      case 4:
        return 'col-3';
      default:
        return 'col-3';
    }
  }
  get playerCharacterColSize(): string {
    switch (this.playerCharacters.length) {
      case 1:
        return 'col';
      case 2:
        return 'col-6';
      case 3:
        return 'col-4';
      case 4:
        return 'col-3';
      default:
        return 'col-3';
    }
  }
  get oppIdColSize(): string {
    switch (this.opponentIds.length) {
      case 1:
        return 'col';
      case 2:
        return 'col-6';
      case 3:
        return 'col-4';
      case 4:
        return 'col-3';
      default:
        return 'col-3';
    }
  }
  get oppCharacterColSize(): string {
    switch (this.opponentCharacters.length) {
      case 1:
        return 'col';
      case 2:
        return 'col-6';
      case 3:
        return 'col-4';
      case 4:
        return 'col-3';
      default:
        return 'col-3';
    }
  }
  get stageColSize(): string {
    switch (this.filteredStages.length) {
      case 1:
        return 'col';
      case 2:
        return 'col-6';
      case 3:
        return 'col-4';
      case 4:
        return 'col-3';
      default:
        return 'col-3';
    }
  }


}

