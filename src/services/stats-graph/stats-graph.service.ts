import { Injectable } from '@angular/core';
import GeneralUtils from 'src/app/components/utils/general.utils';

@Injectable({
  providedIn: 'root'
})
export class StatsGraphService {

  stats: any[];
  meanDatas: any;

  lCancelDataSet;
  playerOverallDataSet;
  opponentOverallDataSet;
  playerConversionsDataSet;
  opponentConversionsDataSet;
  playerLedgedashesDataSet;

  constructor() { }

  public async makeGraphDataSets(stats): Promise<any> {
    this.stats = stats;
    this.meanDatas = {};
    this.makeLcancels();
    this.makeLedgedashes();
    this.makeOverallPlayer();
    this.makeOverallOnPlayer();
    this.makeConversionsOnPlayer();
    this.makeConversionsPlayer();
    console.log('meanDatas : ', this.meanDatas);
    this.generateDataSets();
    return {
      lCancelDataSet: this.lCancelDataSet,
      playerOverallDataSet: this.playerOverallDataSet,
      opponentOverallDataSet: this.opponentOverallDataSet,
      playerConversionsDataSet: this.playerConversionsDataSet,
      opponentConversionsDataSet: this.opponentConversionsDataSet,
      playerLedgedashesDataSet: this.playerLedgedashesDataSet,
    };
  }


  getKeys(object): string[] {
    return GeneralUtils.getKeys(object);
  }

  private generateDataSets(): void {
    this.lCancelDataSet = {};
    this.playerOverallDataSet = {};
    this.opponentOverallDataSet = {};
    this.playerConversionsDataSet = {};
    this.opponentConversionsDataSet = {};
    this.playerLedgedashesDataSet = {};
    if (this.meanDatas['lCancels']) {
      for (let character of this.getKeys(this.meanDatas['lCancels'])) {
        if (!this.lCancelDataSet[character]) {
          this.lCancelDataSet[character] = {};
        }
        if (!this.playerOverallDataSet[character]) {
          this.playerOverallDataSet[character] = {};
        }
        if (!this.opponentOverallDataSet[character]) {
          this.opponentOverallDataSet[character] = {};
        }
        if (!this.playerConversionsDataSet[character]) {
          this.playerConversionsDataSet[character] = {};
        }
        if (!this.opponentConversionsDataSet[character]) {
          this.opponentConversionsDataSet[character] = {};
        }
        if (!this.playerLedgedashesDataSet[character]) {
          this.playerLedgedashesDataSet[character] = {};
        }
        for (let stage of this.getKeys(this.meanDatas['lCancels'][character])) {
          this.lCancelDataSet[character][stage] = this.makeLcancelsForCharStage(character, stage);
          this.playerOverallDataSet[character][stage] = this.makeOverallForCharStage(character, stage, 'overallFromPlayer');
          this.opponentOverallDataSet[character][stage] = this.makeOverallForCharStage(character, stage, 'overallOnPlayer');
          this.playerConversionsDataSet[character][stage] = this.makeConversionsForCharStage(character, stage, 'conversionsFromPlayer');
          this.opponentConversionsDataSet[character][stage] = this.makeConversionsForCharStage(character, stage, 'conversionsOnPlayer');
          this.playerLedgedashesDataSet[character][stage] = this.makeLedgedashesForCharStage(character, stage);
        }
      }
    }
  }

  private compareDateStrings(dateA: string, dateB: string): number {
    // -1 si a < b, 0 si ===, 1 si a > b
    const valuesA = dateA.split('-');
    const valuesB = dateB.split('-');
    const yearA = +valuesA[0];
    const monthA = +valuesA[1];
    const dayA = +valuesA[2].split('T')[0];
    const yearB = +valuesB[0];
    const monthB = +valuesB[1];
    const dayB = +valuesB[2].split('T')[0];
    if (yearA < yearB) {
      return -1;
    } else if (yearA > yearB) {
      return 1;
    } else {
      if (monthA < monthB) {
        return -1;
      } else if (monthA > monthB) {
        return 1;
      } else {
        if (dayA < dayB) {
          return -1;
        } else if (dayA > dayB) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  }

  private makeLcancelsForCharStage(character: string, stage: string) {
    let dataSets = [];
    if (this.meanDatas['lCancels']) {
      let series = [];
      const dates = Object.keys(this.meanDatas['lCancels'][character][stage]).sort((dateA, dateB) => this.compareDateStrings(dateA, dateB));
      for (let date of dates) {
        series.push({
          "name": this.niceDate(date),
          "value": this.meanDatas['lCancels'][character][stage][date].ratio
        });
      }
      dataSets.push({
        name: "Successful L-Cancels ratio (%)",
        series: series
      });
    }
    return dataSets;
  }

  private makeLedgedashesForCharStage(character: string, stage: string) {
    let dataSets = {};
    dataSets['percentOfTotal'] = [];
    dataSets['averageInvincibilityFrames'] = [];

    if (this.meanDatas['ledgeDashes']) {
      let seriesPercent = [];
      let seriesFramecount = [];
      const dates = Object.keys(this.meanDatas['ledgeDashes'][character][stage]).sort((dateA, dateB) => this.compareDateStrings(dateA, dateB));
      for (let date of dates) {
        seriesPercent.push({
          "name": this.niceDate(date),
          "value": this.meanDatas['ledgeDashes'][character][stage][date].percentOfTotal
        });
        seriesFramecount.push({
          "name": this.niceDate(date),
          "value": this.meanDatas['ledgeDashes'][character][stage][date].averageInvincibilityFrames
        });
      }
      dataSets['percentOfTotal'].push({
        name: "Invincible ledgedashes ratio (%)",
        series: seriesPercent
      });
      dataSets['averageInvincibilityFrames'].push({
        name: "Average number of extra invinc. frames",
        series: seriesFramecount
      });
    }
    return dataSets;
  }

  private makeOverallForCharStage(character: string, stage: string, overall: string) {
    let dataSets = {};
    dataSets['killCount'] = [];
    dataSets['killPercent'] = [];
    dataSets['openingsPerKill'] = [];
    dataSets['totalDamage'] = [];
    if (this.meanDatas[overall]) {
      let killCountSeries = [];
      let killPercentSeries = [];
      let openingsPerKillSeries = [];
      let totalDamageSeries = [];
      const dates = Object.keys(this.meanDatas[overall][character][stage]).sort((dateA, dateB) => this.compareDateStrings(dateA, dateB));
      for (let date of dates) {
        killCountSeries.push({
          "name": this.niceDate(date),
          "value": this.meanDatas[overall][character][stage][date].killCountMoyenne.mean
        });
        killPercentSeries.push({
          "name": this.niceDate(date),
          "value": this.meanDatas[overall][character][stage][date].killPercentMoyenne.mean
        });
        openingsPerKillSeries.push({
          "name": this.niceDate(date),
          "value": this.meanDatas[overall][character][stage][date].openingsPerKillMoyenne.mean
        });
        totalDamageSeries.push({
          "name": this.niceDate(date),
          "value": this.meanDatas[overall][character][stage][date].totalDamageMoyenne.mean
        });
      }
      dataSets['killCount'].push({
        name: "Kill Count",
        series: killCountSeries
      });
      dataSets['killPercent'].push({
        name: "Kill Percent (%)",
        series: killPercentSeries
      });
      dataSets['openingsPerKill'].push({
        name: "Openings per kill",
        series: openingsPerKillSeries
      });
      dataSets['totalDamage'].push({
        name: "Total damage (%)",
        series: totalDamageSeries
      });
    }
    return dataSets;
  }

  private makeConversionsForCharStage(character: string, stage: string, conversions: string) {
    let dataSets = {};
    dataSets['neutralWinAverageDamage'] = [];
    dataSets['neutralWinAverageLength'] = [];
    dataSets['punishAverageDamage'] = [];
    dataSets['punishAverageLength'] = [];
    if (this.meanDatas[conversions]) {
      let neutralWinAverageDamageSeries = [];
      let neutralWinAverageLengthSeries = [];
      let punishAverageDamageSeries = [];
      let punishAverageLengthSeries = [];
      const dates = Object.keys(this.meanDatas[conversions][character][stage]).sort((dateA, dateB) => this.compareDateStrings(dateA, dateB));
      for (let date of dates) {
        neutralWinAverageDamageSeries.push({
          "name": this.niceDate(date),
          "value": this.meanDatas[conversions][character][stage][date].neutralWinAverageDamage.mean
        });
        neutralWinAverageLengthSeries.push({
          "name": this.niceDate(date),
          "value": this.meanDatas[conversions][character][stage][date].neutralWinAverageLength.mean
        });
        punishAverageDamageSeries.push({
          "name": this.niceDate(date),
          "value": this.meanDatas[conversions][character][stage][date].punishAverageDamage.mean
        });
        punishAverageLengthSeries.push({
          "name": this.niceDate(date),
          "value": this.meanDatas[conversions][character][stage][date].punishAverageLength.mean
        });
      }
      dataSets['neutralWinAverageDamage'].push({
        name: "Neutral win conversion average damage (%)",
        series: neutralWinAverageDamageSeries
      });
      dataSets['neutralWinAverageLength'].push({
        name: "Neutral win conversion average length",
        series: neutralWinAverageLengthSeries
      });
      dataSets['punishAverageDamage'].push({
        name: "Punish conversion average damage (%)",
        series: punishAverageDamageSeries
      });
      dataSets['punishAverageLength'].push({
        name: "Punish conversion average length",
        series: punishAverageLengthSeries
      });
    }
    return dataSets;
  }

  private makeConversionsOnPlayer(): void {
    let conversions = {};
    for (let stat of this.stats) {
      for (let character of Object.keys(stat.opponentConversions)) {
        if (!conversions[character]) {
          conversions[character] = {};
        }
        for (let stage of Object.keys(stat.opponentConversions[character])) {
          if (!conversions[character][stage]) {
            conversions[character][stage] = {};
          }
          for (let date of stat.dates) {
            if (!conversions[character][stage][date]) {
              conversions[character][stage][date] = {
                neutralWinAverageDamage: { value: stat.opponentConversions[character][stage].processedNeutralWinsConversions['multi-hits'].averageDamage, count: 1 },
                neutralWinAverageLength: { value: stat.opponentConversions[character][stage].processedNeutralWinsConversions['multi-hits'].averageLength, count: 1 },
                punishAverageDamage: { value: stat.opponentConversions[character][stage].processedPunishes['multi-hits'].averageDamage, count: 1 },
                punishAverageLength: { value: stat.opponentConversions[character][stage].processedPunishes['multi-hits'].averageLength, count: 1 },
              }
            } else {
              const value = stat.opponentConversions[character][stage];
              conversions[character][stage][date].neutralWinAverageDamage.value += value.processedNeutralWinsConversions['multi-hits'].averageDamage;
              conversions[character][stage][date].neutralWinAverageDamage.count++;
              conversions[character][stage][date].neutralWinAverageLength.value += value.processedNeutralWinsConversions['multi-hits'].averageLength;
              conversions[character][stage][date].neutralWinAverageLength.count++;
              conversions[character][stage][date].punishAverageDamage.value += value.processedPunishes['multi-hits'].averageDamage;
              conversions[character][stage][date].punishAverageDamage.count++;
              conversions[character][stage][date].punishAverageLength.value += value.processedPunishes['multi-hits'].averageLength;
              conversions[character][stage][date].punishAverageLength.count++;
            }
          }
        }
      }
    }

    for (let character of Object.keys(conversions)) {
      for (let stage of Object.keys(conversions[character])) {
        for (let date of Object.keys(conversions[character][stage])) {
          const value = conversions[character][stage][date];
          conversions[character][stage][date].neutralWinAverageDamage.mean = value.neutralWinAverageDamage.value / value.neutralWinAverageDamage.count;
          conversions[character][stage][date].neutralWinAverageLength.mean = value.neutralWinAverageLength.value / value.neutralWinAverageLength.count;
          conversions[character][stage][date].punishAverageDamage.mean = value.punishAverageDamage.value / value.punishAverageDamage.count;
          conversions[character][stage][date].punishAverageLength.mean = value.punishAverageLength.value / value.punishAverageLength.count;
        }
      }
    }
    this.meanDatas['conversionsOnPlayer'] = conversions;
  }

  private makeConversionsPlayer(): void {
    let conversions = {};
    for (let stat of this.stats) {
      for (let character of Object.keys(stat.playerConversions)) {
        if (!conversions[character]) {
          conversions[character] = {};
        }
        for (let stage of Object.keys(stat.playerConversions[character])) {
          if (!conversions[character][stage]) {
            conversions[character][stage] = {};
          }
          for (let date of stat.dates) {
            if (!conversions[character][stage][date]) {
              conversions[character][stage][date] = {
                neutralWinAverageDamage: { value: stat.playerConversions[character][stage].processedNeutralWinsConversions['multi-hits'].averageDamage, count: 1 },
                neutralWinAverageLength: { value: stat.playerConversions[character][stage].processedNeutralWinsConversions['multi-hits'].averageLength, count: 1 },
                punishAverageDamage: { value: stat.playerConversions[character][stage].processedPunishes['multi-hits'].averageDamage, count: 1 },
                punishAverageLength: { value: stat.playerConversions[character][stage].processedPunishes['multi-hits'].averageLength, count: 1 },
              }
            } else {
              const value = stat.playerConversions[character][stage];
              conversions[character][stage][date].neutralWinAverageDamage.value += value.processedNeutralWinsConversions['multi-hits'].averageDamage;
              conversions[character][stage][date].neutralWinAverageDamage.count++;
              conversions[character][stage][date].neutralWinAverageLength.value += value.processedNeutralWinsConversions['multi-hits'].averageLength;
              conversions[character][stage][date].neutralWinAverageLength.count++;
              conversions[character][stage][date].punishAverageDamage.value += value.processedPunishes['multi-hits'].averageDamage;
              conversions[character][stage][date].punishAverageDamage.count++;
              conversions[character][stage][date].punishAverageLength.value += value.processedPunishes['multi-hits'].averageLength;
              conversions[character][stage][date].punishAverageLength.count++;
            }
          }
        }
      }
    }

    for (let character of Object.keys(conversions)) {
      for (let stage of Object.keys(conversions[character])) {
        for (let date of Object.keys(conversions[character][stage])) {
          const value = conversions[character][stage][date];
          conversions[character][stage][date].neutralWinAverageDamage.mean = value.neutralWinAverageDamage.value / value.neutralWinAverageDamage.count;
          conversions[character][stage][date].neutralWinAverageLength.mean = value.neutralWinAverageLength.value / value.neutralWinAverageLength.count;
          conversions[character][stage][date].punishAverageDamage.mean = value.punishAverageDamage.value / value.punishAverageDamage.count;
          conversions[character][stage][date].punishAverageLength.mean = value.punishAverageLength.value / value.punishAverageLength.count;
        }
      }
    }
    this.meanDatas['conversionsFromPlayer'] = conversions;
  }

  private makeOverallOnPlayer(): void {
    let overall = {};
    for (let stat of this.stats) {
      for (let character of Object.keys(stat.opponentOverall)) {
        if (!overall[character]) {
          overall[character] = {};
        }
        for (let stage of Object.keys(stat.opponentOverall[character])) {
          if (!overall[character][stage]) {
            overall[character][stage] = {};
          }
          for (let date of stat.dates) {
            if (!overall[character][stage][date]) {
              overall[character][stage][date] = {
                killCountMoyenne: { value: stat.opponentOverall[character][stage].killCountMoyenne, count: 1 },
                killPercentMoyenne: { value: stat.opponentOverall[character][stage].killPercentMoyenne, count: 1 },
                openingsPerKillMoyenne: { value: stat.opponentOverall[character][stage].openingsPerKillMoyenne, count: 1 },
                totalDamageMoyenne: { value: stat.opponentOverall[character][stage].totalDamageMoyenne, count: 1 },
              }
            } else {
              const value = stat.opponentOverall[character][stage];
              overall[character][stage][date].killCountMoyenne.value += value.killCountMoyenne;
              overall[character][stage][date].killCountMoyenne.count++;
              overall[character][stage][date].killPercentMoyenne.value += value.killPercentMoyenne;
              overall[character][stage][date].killPercentMoyenne.count++;
              overall[character][stage][date].openingsPerKillMoyenne.value += value.openingsPerKillMoyenne;
              overall[character][stage][date].openingsPerKillMoyenne.count++;
              overall[character][stage][date].totalDamageMoyenne.value += value.totalDamageMoyenne;
              overall[character][stage][date].totalDamageMoyenne.count++;
            }
          }
        }
      }
    }

    for (let character of Object.keys(overall)) {
      for (let stage of Object.keys(overall[character])) {
        for (let date of Object.keys(overall[character][stage])) {
          const value = overall[character][stage][date];
          overall[character][stage][date].killCountMoyenne.mean = value.killCountMoyenne.value / value.killCountMoyenne.count;
          overall[character][stage][date].killPercentMoyenne.mean = value.killPercentMoyenne.value / value.killPercentMoyenne.count;
          overall[character][stage][date].openingsPerKillMoyenne.mean = value.openingsPerKillMoyenne.value / value.openingsPerKillMoyenne.count;
          overall[character][stage][date].totalDamageMoyenne.mean = value.totalDamageMoyenne.value / value.totalDamageMoyenne.count;
        }
      }
    }
    this.meanDatas['overallOnPlayer'] = overall;
  }

  private makeOverallPlayer(): void {
    let overall = {};
    for (let stat of this.stats) {
      for (let character of Object.keys(stat.playerOverall)) {
        if (!overall[character]) {
          overall[character] = {};
        }
        for (let stage of Object.keys(stat.playerOverall[character])) {
          if (!overall[character][stage]) {
            overall[character][stage] = {};
          }
          for (let date of stat.dates) {
            if (!overall[character][stage][date]) {
              overall[character][stage][date] = {
                killCountMoyenne: { value: stat.playerOverall[character][stage].killCountMoyenne, count: 1 },
                killPercentMoyenne: { value: stat.playerOverall[character][stage].killPercentMoyenne, count: 1 },
                openingsPerKillMoyenne: { value: stat.playerOverall[character][stage].openingsPerKillMoyenne, count: 1 },
                totalDamageMoyenne: { value: stat.playerOverall[character][stage].totalDamageMoyenne, count: 1 },
              }
            } else {
              const value = stat.playerOverall[character][stage];
              overall[character][stage][date].killCountMoyenne.value += value.killCountMoyenne;
              overall[character][stage][date].killCountMoyenne.count++;
              overall[character][stage][date].killPercentMoyenne.value += value.killPercentMoyenne;
              overall[character][stage][date].killPercentMoyenne.count++;
              overall[character][stage][date].openingsPerKillMoyenne.value += value.openingsPerKillMoyenne;
              overall[character][stage][date].openingsPerKillMoyenne.count++;
              overall[character][stage][date].totalDamageMoyenne.value += value.totalDamageMoyenne;
              overall[character][stage][date].totalDamageMoyenne.count++;
            }
          }
        }
      }
    }

    for (let character of Object.keys(overall)) {
      for (let stage of Object.keys(overall[character])) {
        for (let date of Object.keys(overall[character][stage])) {
          const value = overall[character][stage][date];
          overall[character][stage][date].killCountMoyenne.mean = value.killCountMoyenne.value / value.killCountMoyenne.count;
          overall[character][stage][date].killPercentMoyenne.mean = value.killPercentMoyenne.value / value.killPercentMoyenne.count;
          overall[character][stage][date].openingsPerKillMoyenne.mean = value.openingsPerKillMoyenne.value / value.openingsPerKillMoyenne.count;
          overall[character][stage][date].totalDamageMoyenne.mean = value.totalDamageMoyenne.value / value.totalDamageMoyenne.count;
        }
      }
    }
    this.meanDatas['overallFromPlayer'] = overall;
  }

  private makeLcancels(): void {
    let lCancels = {};
    for (let stat of this.stats) {
      for (let character of Object.keys(stat.lcancelsForPlayer)) {
        if (!lCancels[character]) {
          lCancels[character] = {};
        }
        for (let stage of Object.keys(stat.lcancelsForPlayer[character])) {
          if (!lCancels[character][stage]) {
            lCancels[character][stage] = {};
          }
          for (let date of stat.dates) {
            if (!lCancels[character][stage][date]) {
              lCancels[character][stage][date] = stat.lcancelsForPlayer[character][stage].lcancels;
            } else {
              lCancels[character][stage][date].successful += stat.lcancelsForPlayer[character][stage].lcancels.successful;
              lCancels[character][stage][date].failed += stat.lcancelsForPlayer[character][stage].lcancels.failed;
            }
          }
        }
      }
    }

    for (let character of Object.keys(lCancels)) {
      for (let stage of Object.keys(lCancels[character])) {
        for (let date of Object.keys(lCancels[character][stage])) {
          const value = lCancels[character][stage][date];
          lCancels[character][stage][date].ratio = 100 * (value.successful / (value.successful + value.failed));
        }
      }
    }
    this.meanDatas['lCancels'] = lCancels;
  }

  private makeLedgedashes(): void {
    let ledgedashes = {};
    for (let stat of this.stats) {
      for (let character of Object.keys(stat.ledgeDashesForPlayer)) {
        if (!ledgedashes[character]) {
          ledgedashes[character] = {};
        }
        for (let stage of Object.keys(stat.ledgeDashesForPlayer[character])) {
          if (!ledgedashes[character][stage]) {
            ledgedashes[character][stage] = {};
          }
          for (let date of stat.dates) {
            if (!ledgedashes[character][stage][date]) {
              ledgedashes[character][stage][date] = {};
              if (stat.ledgeDashesForPlayer[character][stage]['invincible']) {
                ledgedashes[character][stage][date].percentOfTotal = [stat.ledgeDashesForPlayer[character][stage]['invincible'].percentOfTotalLedgedashes];
                ledgedashes[character][stage][date].averageInvincibilityFrames = [stat.ledgeDashesForPlayer[character][stage]['invincible'].averageExtraInvincibilityFrames];
              } else {
                ledgedashes[character][stage][date].percentOfTotal = [0];
                ledgedashes[character][stage][date].averageInvincibilityFrames = [0];
              }
            } else {
              if (stat.ledgeDashesForPlayer[character][stage]['invincible']) {
                ledgedashes[character][stage][date].percentOfTotal.push(stat.ledgeDashesForPlayer[character][stage]['invincible'].percentOfTotalLedgedashes);
                ledgedashes[character][stage][date].averageInvincibilityFrames.push(stat.ledgeDashesForPlayer[character][stage]['invincible'].averageExtraInvincibilityFrames);
              } else {
                ledgedashes[character][stage][date].percentOfTotal.push(0);
                ledgedashes[character][stage][date].averageInvincibilityFrames.push(0);
              }
            }
          }
        }
      }
    }

    for (let character of Object.keys(ledgedashes)) {
      for (let stage of Object.keys(ledgedashes[character])) {
        for (let date of Object.keys(ledgedashes[character][stage])) {
          const value = ledgedashes[character][stage][date];
          ledgedashes[character][stage][date].percentOfTotal = GeneralUtils.moyenneFromNumberArray(value.percentOfTotal);
          ledgedashes[character][stage][date].averageInvincibilityFrames = GeneralUtils.moyenneFromNumberArray(value.averageInvincibilityFrames);
        }
      }
    }
    this.meanDatas['ledgeDashes'] = ledgedashes;
  }

  private niceDate(date: string): string {
    return date.substr(0, 10);
  }
}
