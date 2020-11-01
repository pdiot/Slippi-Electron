import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IntermediaryStatsWrapper, ProcessedLCancels, ProcessedOpenings, ProcessedOverallList, ProcessedPunishedOptions } from 'src/interfaces/types';

@Component({
  selector: 'app-stats-compare-display',
  templateUrl: './stats-compare-display.component.html',
  styleUrls: ['./stats-compare-display.component.scss']
})
export class StatsCompareDisplayComponent implements OnInit, OnChanges {

  @Input() statsFromJSON;
  @Input() collapseId: string;
  
  playerConversions : IntermediaryStatsWrapper<ProcessedOpenings>;
  opponentConversions: IntermediaryStatsWrapper<ProcessedOpenings>;
  playerOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  opponentOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  punishedActionsForPlayer: IntermediaryStatsWrapper<ProcessedPunishedOptions>;
  punishedActionsForOpponent: IntermediaryStatsWrapper<ProcessedPunishedOptions>;
  lcancelsForPlayer: IntermediaryStatsWrapper<ProcessedLCancels>;
  lcancelsForOpponent: IntermediaryStatsWrapper<ProcessedLCancels>;
  
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.statsFromJSON?.currentValue) {
      this.playerConversions = changes.statsFromJSON.currentValue.playerConversions;
      this.opponentConversions = changes.statsFromJSON.currentValue.opponentConversions;
      this.playerOverall = changes.statsFromJSON.currentValue.playerOverall;
      this.opponentOverall = changes.statsFromJSON.currentValue.opponentOverall;
      this.punishedActionsForPlayer = changes.statsFromJSON.currentValue.punishedActionsForPlayer;
      this.punishedActionsForOpponent = changes.statsFromJSON.currentValue.punishedActionsForOpponent;
      this.lcancelsForPlayer = changes.statsFromJSON.currentValue.lcancelsForPlayer;
      this.lcancelsForOpponent = changes.statsFromJSON.currentValue.lcancelsForOpponent;
    }
    if (changes.collapseId?.currentValue) {
      this.collapseId = changes.collapseId.currentValue;
    }
    this.cd.detectChanges();
  }
}
