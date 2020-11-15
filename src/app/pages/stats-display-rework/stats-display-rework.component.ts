import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import GameFileUtils from 'src/app/components/utils/gameFile.utils';
import GeneralUtils from 'src/app/components/utils/general.utils';
import { ElecService } from 'src/app/elec.service';
import { StatsItem, EnrichedGameFile } from 'src/interfaces/outputs';
import { IntermediaryStatsWrapper, ProcessedOpenings, ProcessedOverallList, ProcessedPunishedOptions, ProcessedLCancels, ProcessedLedgedashes } from 'src/interfaces/types';
import { IconsService } from 'src/services/icons/icons.service';
import { StatsProcessingService } from 'src/services/stats-processing/stats-processing.service';

@Component({
  selector: 'app-stats-display-rework',
  templateUrl: './stats-display-rework.component.html',
  styleUrls: ['./stats-display-rework.component.scss']
})
export class StatsDisplayReworkComponent implements OnInit, OnChanges {
  @Input() stats: StatsItem;
  @Input() selectedGames: EnrichedGameFile[];

  playerConversions: IntermediaryStatsWrapper<ProcessedOpenings>;
  opponentConversions: IntermediaryStatsWrapper<ProcessedOpenings>;
  playerOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  opponentOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  punishedActionsForPlayer: IntermediaryStatsWrapper<ProcessedPunishedOptions>;
  punishedActionsForOpponent: IntermediaryStatsWrapper<ProcessedPunishedOptions>;
  lcancelsForPlayer: IntermediaryStatsWrapper<ProcessedLCancels>;
  lcancelsForOpponent: IntermediaryStatsWrapper<ProcessedLCancels>;
  ledgeDashesForPlayer: IntermediaryStatsWrapper<ProcessedLedgedashes>;
  ledgeDashesForOpponent: IntermediaryStatsWrapper<ProcessedLedgedashes>;
  writeFeedbackMessage: string;

  statsDates: Date[];

  tabs: { label: string, active: boolean, key: string }[] = [{
    label: 'Overall',
    active: false, key: 'overall'
  },
  { label: 'Conversions', active: false, key: 'conversions' },
  { label: 'Punished options', active: false, key: 'punishes' },
  { label: 'L-Cancels', active: false, key: 'lcancels' },
  { label: 'Ledgedashes', active: false, key: 'ledgedashes' }];

  constructor(private cd: ChangeDetectorRef,
    private statsService: StatsProcessingService,
    private iconService: IconsService,
    private electron: ElecService) { }

  currentCharacter;
  currentStage;

  showModale = false;
  characterModale = false;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.stats?.currentValue) {
      this.stats = changes.stats.currentValue as unknown as StatsItem;
      console.log('Stats Display - got Stats : ', this.stats);
    }
    if (changes?.selectedGames?.currentValue) {
      this.selectedGames = changes.selectedGames.currentValue as unknown as EnrichedGameFile[];
    }
    if (this.selectedGames &&
      this.stats?.playerCharName &&
      this.stats?.ledgeDashesForPlayer &&
      this.stats?.ledgeDashesForOpponent &&
      this.stats?.punishedActionsForPlayer &&
      this.stats?.punishedActionsForOpponent &&
      this.stats?.lcancelsForOpponent &&
      this.stats?.lcancelsForPlayer &&
      this.stats?.opponentConversions &&
      this.stats?.playerConversions &&
      this.stats?.playerOveralls &&
      this.stats?.opponentOveralls) {
      this.writeFeedbackMessage = undefined;
      this.getProcessedStats();
    }
    this.cd.detectChanges();
  }

  initCurrentCharAndStage() {
    this.currentCharacter = this.getKeys(this.playerOverall)[0];
    this.currentStage = 'allStages';
    this.setActiveTab('overall');
    this.cd.detectChanges();
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
    if (!this.getKeys(this.playerOverall[character]).includes(this.currentStage)) {
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

  private getStatsDates(): Date[] {
    let dates = [];
    for (let gameTag of Object.keys(this.stats.playerOveralls)) {
      const year = +gameTag.substr(0, 4);
      const month = +gameTag.substr(4, 2);
      const day = +gameTag.substr(6, 2);
      const date = new Date(year, month, day);
      if (!dates.find(dateFromArray => date.getTime() === dateFromArray.getTime())) {
        dates.push(date);
      }
    }
    return dates;
  }

  private getProcessedStats(): void {
    // TODO filter this.stats by selectedGames
    const newStats = this.filterStats();
    this.statsDates = this.getStatsDates();
    console.log('Stats Display - getProcessedStats');
    if (newStats.playerConversions) {
      this.statsService.processConversions(newStats.playerConversions).then(result => {
        console.log('Stats Display - got player conversions back', result);
        this.playerConversions = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.opponentConversions) {
      this.statsService.processConversions(newStats.opponentConversions).then(result => {
        console.log('Stats Display - got opponent conversions back', result);
        this.opponentConversions = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.playerOveralls) {
      this.statsService.processOverallList(newStats.playerOveralls).then(result => {
        console.log('Stats Display - got player overall back', result);
        this.playerOverall = result;
        this.initCurrentCharAndStage();
        this.cd.detectChanges();
      });
    }
    if (newStats.opponentOveralls) {
      this.statsService.processOverallList(newStats.opponentOveralls).then(result => {
        console.log('Stats Display - got opponent overall back', result);
        this.opponentOverall = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.punishedActionsForPlayer) {
      this.statsService.processPunishedActions(newStats.punishedActionsForPlayer).then(result => {
        console.log('Stats Display - got player punishedActions back', result);
        this.punishedActionsForPlayer = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.punishedActionsForOpponent) {
      this.statsService.processPunishedActions(newStats.punishedActionsForOpponent).then(result => {
        console.log('Stats Display - got opponent punishedActions back', result);
        this.punishedActionsForOpponent = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.lcancelsForPlayer) {
      this.statsService.processLCancels(newStats.lcancelsForPlayer).then(result => {
        console.log('Stats Display - got player lcancels back', result);
        this.lcancelsForPlayer = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.lcancelsForOpponent) {
      this.statsService.processLCancels(newStats.lcancelsForOpponent).then(result => {
        console.log('Stats Display - got opponent lcancels back', result);
        this.lcancelsForOpponent = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.ledgeDashesForPlayer) {
      this.statsService.processLedgeDashes(newStats.ledgeDashesForPlayer).then(result => {
        console.log('Stats Display - got player ledgeDashes back', result);
        this.ledgeDashesForPlayer = result;
        this.cd.detectChanges();
      });
    }
    if (newStats.ledgeDashesForOpponent) {
      this.statsService.processLedgeDashes(newStats.ledgeDashesForOpponent).then(result => {
        console.log('Stats Display - got opponent ledgeDashes back', result);
        this.ledgeDashesForOpponent = result;
        this.cd.detectChanges();
      });
    }
  }

  private filterStats(): StatsItem {
    console.log('Stats Display - Filter Stats');
    const niceNamesToKeep: string[] = [];
    for (let game of this.selectedGames) {
      niceNamesToKeep.push(GameFileUtils.niceName(game.file));
    }
    const newStats: StatsItem = {
      playerCharName: this.stats.playerCharName,
      playerConversions: undefined,
      opponentConversions: undefined,
      playerOveralls: undefined,
      opponentOveralls: undefined,
      punishedActionsForOpponent: undefined,
      punishedActionsForPlayer: undefined,
      lcancelsForPlayer: undefined,
      lcancelsForOpponent: undefined,
      ledgeDashesForPlayer: undefined,
      ledgeDashesForOpponent: undefined
    };
    for (let game of Object.keys(this.stats.playerConversions)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.playerConversions) {
          newStats.playerConversions = {};
        }
        newStats.playerConversions[game] = this.stats.playerConversions[game];
      }
    }
    for (let game of Object.keys(this.stats.opponentConversions)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.opponentConversions) {
          newStats.opponentConversions = {};
        }
        newStats.opponentConversions[game] = this.stats.opponentConversions[game];
      }
    }
    for (let game of Object.keys(this.stats.playerOveralls)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.playerOveralls) {
          newStats.playerOveralls = {};
        }
        newStats.playerOveralls[game] = this.stats.playerOveralls[game];
      }
    }
    for (let game of Object.keys(this.stats.opponentOveralls)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.opponentOveralls) {
          newStats.opponentOveralls = {};
        }
        newStats.opponentOveralls[game] = this.stats.opponentOveralls[game];
      }
    }
    for (let game of Object.keys(this.stats.lcancelsForOpponent)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.lcancelsForOpponent) {
          newStats.lcancelsForOpponent = {};
        }
        newStats.lcancelsForOpponent[game] = this.stats.lcancelsForOpponent[game];
      }
    }
    for (let game of Object.keys(this.stats.lcancelsForPlayer)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.lcancelsForPlayer) {
          newStats.lcancelsForPlayer = {};
        }
        newStats.lcancelsForPlayer[game] = this.stats.lcancelsForPlayer[game];
      }
    }
    for (let game of Object.keys(this.stats.punishedActionsForOpponent)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.punishedActionsForOpponent) {
          newStats.punishedActionsForOpponent = {};
        }
        newStats.punishedActionsForOpponent[game] = this.stats.punishedActionsForOpponent[game];
      }
    }
    for (let game of Object.keys(this.stats.punishedActionsForPlayer)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.punishedActionsForPlayer) {
          newStats.punishedActionsForPlayer = {};
        }
        newStats.punishedActionsForPlayer[game] = this.stats.punishedActionsForPlayer[game];
      }
    }
    for (let game of Object.keys(this.stats.ledgeDashesForPlayer)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.ledgeDashesForPlayer) {
          newStats.ledgeDashesForPlayer = {};
        }
        newStats.ledgeDashesForPlayer[game] = this.stats.ledgeDashesForPlayer[game];
      }
    }
    for (let game of Object.keys(this.stats.ledgeDashesForOpponent)) {
      if (niceNamesToKeep.includes(game)) {
        if (!newStats.ledgeDashesForOpponent) {
          newStats.ledgeDashesForOpponent = {};
        }
        newStats.ledgeDashesForOpponent[game] = this.stats.ledgeDashesForOpponent[game];
      }
    }

    return newStats;
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

  writeStats() {
    const stats = {
      playerCharName: this.stats.playerCharName,
      playerConversions: this.playerConversions,
      opponentConversions: this.opponentConversions,
      playerOverall: this.playerOverall,
      opponentOverall: this.opponentOverall,
      punishedActionsForPlayer: this.punishedActionsForPlayer,
      punishedActionsForOpponent: this.punishedActionsForOpponent,
      lcancelsForPlayer: this.lcancelsForPlayer,
      lcancelsForOpponent: this.lcancelsForOpponent,
      ledgeDashesForPlayer: this.ledgeDashesForPlayer,
      ledgeDashesForOpponent: this.ledgeDashesForPlayer,
      dates: this.statsDates,
    }
    this.electron.ipcRenderer.on('fileWrittenOK', (event, arg) => {
      this.writeFeedbackMessage = `Stats written to ${arg}`
      this.cd.detectChanges();
    });
    this.electron.ipcRenderer.on('fileWrittenKO', (event, arg) => {
      this.writeFeedbackMessage = `Error when trying to write stats to ${arg}`
      this.cd.detectChanges();
    });
    this.electron.ipcRenderer.send('writeStats', stats);
  }


}
