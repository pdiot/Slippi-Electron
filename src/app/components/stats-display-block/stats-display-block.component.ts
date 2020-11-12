import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { count } from 'console';
import { IntermediaryStatsWrapper, ProcessedAttack, ProcessedDefensiveOption, ProcessedLCancels, ProcessedLedgedashes, ProcessedMovementOption, ProcessedOpenings, ProcessedOverallList, ProcessedPunishedOptions } from 'src/interfaces/types';
import GeneralUtils from '../utils/general.utils';

@Component({
  selector: 'app-stats-display-block',
  templateUrl: './stats-display-block.component.html',
  styleUrls: ['./stats-display-block.component.scss']
})
export class StatsDisplayBlockComponent implements OnInit, OnChanges {

  @Input() playerConversions : IntermediaryStatsWrapper<ProcessedOpenings>;
  @Input() opponentConversions: IntermediaryStatsWrapper<ProcessedOpenings>;
  @Input() playerOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  @Input() opponentOverall: IntermediaryStatsWrapper<ProcessedOverallList>;
  @Input() punishedActionsForPlayer: IntermediaryStatsWrapper<ProcessedPunishedOptions>;
  @Input() punishedActionsForOpponent: IntermediaryStatsWrapper<ProcessedPunishedOptions>;
  @Input() lcancelsForPlayer: IntermediaryStatsWrapper<ProcessedLCancels>;
  @Input() lcancelsForOpponent: IntermediaryStatsWrapper<ProcessedLCancels>;
  @Input() ledgeDashesForPlayer: IntermediaryStatsWrapper<ProcessedLedgedashes>;
  @Input() ledgeDashesForOpponent: IntermediaryStatsWrapper<ProcessedLedgedashes>;
  @Input() collapseId: string;
  
  toggled : any = {};
  
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.playerConversions?.currentValue) {
      this.playerConversions = changes.playerConversions.currentValue;
    }
    if (changes.opponentConversions?.currentValue) {
      this.opponentConversions = changes.opponentConversions.currentValue;
    }
    if (changes.playerOverall?.currentValue) {
      this.playerOverall = changes.playerOverall.currentValue;
    }
    if (changes.opponentOverall?.currentValue) {
      this.opponentOverall = changes.opponentOverall.currentValue;
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

  getTop3MostCommonAttacks(attacks: ProcessedAttack[]): {move: string, count: number}[] {
    if (attacks?.length > 0) {
      return GeneralUtils.getTop3MostCommonMoves(attacks.map(move => {
        return {
          move: move.attack,
          count: move.count
        }
      }));
    }
    return [];
  }
  getTop3MostCommonDefensiveOptions(defenses: ProcessedDefensiveOption[]): {move: string, count: number}[] {
    if (defenses?.length > 0) {
      return GeneralUtils.getTop3MostCommonMoves(defenses.map(move => {
        return {
          move: move.defensiveOption,
          count: move.count
        }
      }));
    }
    return [];
  }
  getTop3MostCommonMovementOptions(movements: ProcessedMovementOption[]): {move: string, count: number}[] {
    if (movements?.length > 0) {
      return GeneralUtils.getTop3MostCommonMoves(movements.map(move => {
        return {
          move: move.movementOption,
          count: move.count
        }
      }));
    }
    return [];
  }
  getTop3MostCommonLCancel(moves: {move: string, count: number}[]): {move: string, count: number}[] {
    return GeneralUtils.getTop3MostCommonMoves(moves);
  }
  getLCancelRatio(lcancels: {successful: number, failed: number}): {successful: number, failed: number, ratio: number} {
    return {
      successful: lcancels.successful,
      failed: lcancels.failed,
      ratio: lcancels.successful / (lcancels.successful + lcancels.failed)
    };
  }
  removeLanding(landing: string): string {
    return landing.split(' ')[0];
  }
  public handleToggleEmit(character, stage, block, value) {
    if (!this.toggled[character]) {
      this.toggled[character] = {};
    }
    if (!this.toggled[character][stage]) {
      this.toggled[character][stage] = {};
    }
    this.toggled[character][stage][block] = value;
    this.cd.detectChanges();
  }

  public buildDOM(character, stage, block) {
    return this.toggled && this.toggled[character] && this.toggled[character][stage] && this.toggled[character][stage][block];
  }

}
