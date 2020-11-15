import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Conversion, LCancels, Ledgedashes, Overall, PunishedActions, StatsItem } from 'src/interfaces/outputs';
import { IntermediaryStatsWrapper } from 'src/interfaces/types';
import { IconsService } from 'src/services/icons/icons.service';
import GeneralUtils from '../utils/general.utils';

@Component({
  selector: 'app-stats-compare-display',
  templateUrl: './stats-compare-display.component.html',
  styleUrls: ['./stats-compare-display.component.scss']
})
export class StatsCompareDisplayComponent implements OnInit, OnChanges {

  @Input() stats;

  tabs: { label: string, active: boolean, key: string }[] = [{
    label: 'Overall',
    active: false, key: 'overall'
  },
  { label: 'Conversions', active: false, key: 'conversions' },
  { label: 'Punished options', active: false, key: 'punishes' },
  { label: 'L-Cancels', active: false, key: 'lcancels' },
  { label: 'Ledgedashes', active: false, key: 'ledgedashes' }];
  
  playerConversions: IntermediaryStatsWrapper<Conversion[]>;
  opponentConversions: IntermediaryStatsWrapper<Conversion[]>;
  playerOverall: IntermediaryStatsWrapper<Overall>;
  opponentOverall: IntermediaryStatsWrapper<Overall>;
  punishedActionsForPlayer: IntermediaryStatsWrapper<PunishedActions>;
  punishedActionsForOpponent: IntermediaryStatsWrapper<PunishedActions>;
  lcancelsForPlayer: IntermediaryStatsWrapper<LCancels>;
  lcancelsForOpponent: IntermediaryStatsWrapper<LCancels>;
  ledgeDashesForPlayer: IntermediaryStatsWrapper<Ledgedashes>;
  ledgeDashesForOpponent: IntermediaryStatsWrapper<Ledgedashes>;
  writeFeedbackMessage: string;

  currentCharacter;
  currentStage;
  commonChars;
  commonStagesForCurrentChar;

  showModale = false;
  characterModale = false;

  constructor(private cd: ChangeDetectorRef, private iconService: IconsService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.stats?.currentValue) {
      this.stats = changes.stats.currentValue;
      this.playerConversions = this.stats.playerConversions;
      this.opponentConversions = this.stats.opponentConversions;
      this.playerOverall = this.stats.playerOverall;
      this.opponentOverall = this.stats.opponentOverall;
      this.punishedActionsForPlayer = this.stats.punishedActionsForPlayer;
      this.punishedActionsForOpponent = this.stats.punishedActionsForOpponent;
      this.lcancelsForPlayer = this.stats.lcancelsForPlayer;
      this.lcancelsForOpponent = this.stats.lcancelsForOpponent;
      this.ledgeDashesForPlayer = this.stats.ledgeDashesForPlayer;
      this.ledgeDashesForOpponent = this.stats.ledgeDashesForOpponent;
      if (this.ledgeDashesForPlayer &&
        this.ledgeDashesForOpponent &&
        this.punishedActionsForPlayer &&
        this.punishedActionsForOpponent &&
        this.lcancelsForOpponent &&
        this.lcancelsForPlayer &&
        this.opponentConversions &&
        this.playerConversions &&
        this.playerOverall &&
        this.opponentOverall) {
          this.initCurrentCharAndStage();
        }
    }
    this.cd.detectChanges();
  }
  
  initCurrentCharAndStage() {
    this.findCommonChars();
    this.currentCharacter = this.commonChars[0];
    this.findCommonStagesForCurrentChar();
    this.currentStage = 'allStages';
    this.setActiveTab('overall');
    this.cd.detectChanges();
  }

  findCommonChars() {
    let file1Chars = this.getKeys(this.playerOverall);
    let file2Chars = this.getKeys(this.opponentOverall);
    this.commonChars = file1Chars.filter(file1Char => file2Chars.includes(file1Char));
    this.cd.detectChanges();
  }

  findCommonStagesForCurrentChar() {
    let stages1 = this.getKeys(this.playerOverall[this.currentCharacter]);
    let stages2 = this.getKeys(this.opponentOverall[this.currentCharacter]);
    this.commonStagesForCurrentChar = stages1.filter(stage1 => stages2.includes(stage1));
  }

  setActiveTab(key: string) {
    if (this.tabs.find(tab => tab.active === true)) {
      this.tabs.find(tab => tab.active === true).active = false;
    }
    this.tabs.find(tab => tab.key === key).active = true;
    this.cd.detectChanges();
  }

  isActiveTab(key: string) {
    return this.tabs?.length > 0 && this.tabs.find(tab => tab.key === key)?.active;
  }

  setActiveStage(stage: string) {
    this.currentStage = stage;
    this.cd.detectChanges();
  }

  isActiveStage(stage: string) {
    return this.currentStage === stage;
  }

  openCharacterSelect() {
    if (this.showModale) {
      this.showModale = false;
      this.characterModale = false;
    } else {
      this.showModale = true;
      this.characterModale = true;
    }
    this.cd.detectChanges();
  }

  saveCharacter(character: string) {
    this.currentCharacter = character;
    this.findCommonStagesForCurrentChar();
    if (!this.commonStagesForCurrentChar.includes(this.currentStage)) {
      this.currentStage = 'allStages';
    }
    this.showModale = false;
    this.characterModale = false;
    this.cd.detectChanges();
  }

  getData(key: string, dataSet: IntermediaryStatsWrapper<any>, character: string, stage: string): string {
    if (dataSet && dataSet[character] && dataSet[character][stage] && dataSet[character][stage][key]) {
      return dataSet[character][stage][key];
    } else {
      return undefined;
    }
  }
  
  getKeys(object): string[] {
    return GeneralUtils.getKeys(object);
  }

  getMoveName(moveId: number) {
    return GeneralUtils.getMoveName(moveId);
  }

  getStageName(stage: string) {
    return GeneralUtils.getStageName(stage);
  }

  getStagePicture(stage: string): string {
    return this.iconService.getStageMiniatureName(stage).miniature;
  }

  getPlayerImageUrl() {
    return this.iconService.getCharacterVersus(this.stats?.playerCharName ? this.stats.playerCharName : 'Marth', 'left');
  }

  getOpponentImageUrl() {
    return this.getOpponentCharacterImageUrl(this.currentCharacter);
  }

  getOpponentCharacterImageUrl(character: string) {
    return this.iconService.getCharacterVersus(character, 'right');
  }

  getTop3OfPunishedOptions(array: any[]) {
    if (array?.length > 0) {
      return array.sort((b, a) => a.count - b.count).filter((item, index) => index < 3);
    } else {
      return undefined;
    }
  }

  getRatio(data: { failed: number, successful: number }): number {
    if (data.failed === 0) {
      return 100;
    }
    if (data.successful === 0) {
      return 0;
    }
    return data.successful * 100 / (data.failed + data.successful);
  }

  removeLanding(landing: string): string {
    return GeneralUtils.removeLanding(landing);
  }
}
