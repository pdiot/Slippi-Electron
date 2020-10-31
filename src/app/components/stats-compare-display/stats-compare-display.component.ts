import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IntermediaryStatsWrapper, ProcessedOpenings, ProcessedOverallList } from 'src/interfaces/types';
import GeneralUtils from '../utils/general.utils';

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
  
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.statsFromJSON?.currentValue) {
      this.playerConversions = changes.statsFromJSON?.currentValue.playerConversions;
      this.opponentConversions = changes.statsFromJSON?.currentValue.opponentConversions;
      this.playerOverall = changes.statsFromJSON?.currentValue.playerOverall;
      this.opponentOverall = changes.statsFromJSON?.currentValue.opponentOverall;
    }
    if (changes.collapseId?.currentValue) {
      this.collapseId = changes.collapseId.currentValue;
    }
    this.cd.detectChanges();
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


}
