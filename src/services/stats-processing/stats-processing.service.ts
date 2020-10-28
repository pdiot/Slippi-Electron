import { Injectable } from '@angular/core';
import { EXTERNALMOVES } from 'src/interfaces/const';
import { Conversion, Overall, StatsWrapper } from 'src/interfaces/outputs';
import { IntermediaryStatsWrapper, MostCommonMove, MoyenneConversion, ProcessedOpenings, ProcessedOverallList } from 'src/interfaces/types';

@Injectable({
  providedIn: 'root'
})
export class StatsProcessingService {
  constructor() { }

  public async processConversions(data: StatsWrapper<Conversion[]>): Promise<ProcessedOpenings> {
    let processedNeutralWinsConversions = {};
    let processedNeutralWinsFirstHits = {};
    let processedKillNeutralFirstHits = {};
    let processedPunishes = {};
    let processedPunishesFirstHits = {};
    let processedKillPunishFirstHits = {};
    
    // Create an intermediary wrapper without the gameData
    let conversionsList: IntermediaryStatsWrapper<Conversion> = {};
    for (const game of Object.keys(data)) {
      for (const character of Object.keys(data[game])) {
        // We'll only have one character each time here (opponent's character)
        if (conversionsList[character]) {
          for (const stage of Object.keys(data[game][character])) {
            // Same here, we'll only have one stage each time here
            if (conversionsList[character][stage]) {
              conversionsList[character][stage] = [
                ...conversionsList[character][stage],
                ...data[game][character][stage]
              ];
            } else {
              conversionsList[character][stage] = data[game][character][stage];
            }
          }
        } else {
          conversionsList[character] = data[game][character];
        }
      }
    }

    for (const opponentChar of Object.keys(conversionsList)) {
      processedNeutralWinsConversions[opponentChar]={};
      processedNeutralWinsFirstHits[opponentChar]={};
      processedKillNeutralFirstHits[opponentChar] = {};
      processedPunishes[opponentChar]={};
      processedPunishesFirstHits[opponentChar]={};
      processedKillPunishFirstHits[opponentChar] = {};
      for (const stage of Object.keys(conversionsList[opponentChar])) {
        processedNeutralWinsConversions[opponentChar][stage]={};
        processedNeutralWinsFirstHits[opponentChar][stage]={};
        processedKillNeutralFirstHits[opponentChar][stage]={};
        processedPunishes[opponentChar][stage]={};
        processedPunishesFirstHits[opponentChar][stage]={};
        processedKillPunishFirstHits[opponentChar][stage]={};
        let neutral = [];
        let punishes = [];
        let oneHitOnlyNeutral = [];
        let oneHitOnlyPunishes = [];
        let neutralFirstHits = [];
        let neutralKillFirstHits = [];
        let punishFirstHits = [];
        let punishKillFirstHits = [];
        for (const conversion of conversionsList[opponentChar][stage]) {
          if (conversion.openingType === 'neutral-win') {
              // Neutral Win
              if (conversion.moves.length > 1) {
                  neutral.push({
                      totalDamage: conversion.endPercent - conversion.startPercent,
                      moves: conversion.moves,
                  });
              } else {
                  oneHitOnlyNeutral.push({
                      totalDamage: conversion.endPercent - conversion.startPercent,
                  })
              }
              if (conversion.didKill) {
                  neutralKillFirstHits.push({
                      moveId: conversion.moves[0].moveId
                  });
              }
              neutralFirstHits.push({
                  moveId: conversion.moves[0].moveId
              });
          } else if (conversion.openingType === 'counter-attack') {
            // Punish
            if (conversion.moves.length > 1) {
                punishes.push({
                    totalDamage: conversion.endPercent - conversion.startPercent,
                    moves: conversion.moves,
                });
            } else {
                oneHitOnlyPunishes.push({
                    totalDamage: conversion.endPercent - conversion.startPercent,
                });
            }
            if (conversion.didKill) {
                punishKillFirstHits.push({
                    moveId: conversion.moves[0].moveId
                });
            }
            punishFirstHits.push({
                moveId: conversion.moves[0].moveId
            });
          }
        }
        processedNeutralWinsConversions[opponentChar][stage]['multi-hits'] = this.calculMoyenneConversion(neutral);
        processedNeutralWinsConversions[opponentChar][stage]['single-hit'] = this.calculMoyenneConversion(oneHitOnlyNeutral, true);
        processedPunishes[opponentChar][stage]['multi-hits'] = this.calculMoyenneConversion(punishes);
        processedPunishes[opponentChar][stage]['single-hit'] = this.calculMoyenneConversion(oneHitOnlyPunishes, true);
        processedNeutralWinsFirstHits[opponentChar][stage] = this.calculMostCommonMove(neutralFirstHits);
        processedKillNeutralFirstHits[opponentChar][stage] = this.calculMostCommonMove(neutralKillFirstHits);
        processedPunishesFirstHits[opponentChar][stage] = this.calculMostCommonMove(punishFirstHits);
        processedKillPunishFirstHits[opponentChar][stage] = this.calculMostCommonMove(punishKillFirstHits);
      }
    }
    
    return {
      processedNeutralWinsConversions, 
      processedPunishes, 
      processedNeutralWinsFirstHits, 
      processedKillNeutralFirstHits,
      processedPunishesFirstHits,
      processedKillPunishFirstHits
    };    
  }
  
  public async processOverallList(data: StatsWrapper<Overall>): Promise<IntermediaryStatsWrapper<ProcessedOverallList>> {
    let processedOverallList = {};
    
    // Create an intermediary wrapper without the gameData
    let overallList: IntermediaryStatsWrapper<Overall> = {};
    for (let game of Object.keys(data)) {
      for (let character of Object.keys(data[game])) {
        // We'll only have one character each time here (opponent's character)
        if (overallList[character]) {
          for (let stage of Object.keys(data[game][character])) {
            // Same here, we'll only have one stage each time here
            if (overallList[character][stage]) {
              overallList[character][stage] = [
                ...overallList[character][stage],
                data[game][character][stage]
              ];
            } else {
              overallList[character][stage] = [data[game][character][stage]];
            }
          }
        } else {
          overallList[character] = {};
          for (let stage of Object.keys(data[game][character])) {
            overallList[character][stage] = [data[game][character][stage]];
          }            
        }
      }
    }

    let overallDatas;
    for (const opponentChar of Object.keys(overallList)) {
        processedOverallList[opponentChar] = {};
        for (const stage of Object.keys(overallList[opponentChar])) {
            overallDatas = {
                conversionCounts: [],
                totalDamages: [],
                killCounts: [],
                openingsPerKills: [],
                damagePerOpenings: [],
            }
            for (const overall of overallList[opponentChar][stage]) {
                overallDatas.conversionCounts.push(overall.conversionCount);
                overallDatas.totalDamages.push(overall.totalDamage);
                overallDatas.killCounts.push(overall.killCount);
                overallDatas.openingsPerKills.push(overall.openingsPerKill.ratio);
                overallDatas.damagePerOpenings.push(overall.damagePerOpening.ratio);
            }
            processedOverallList[opponentChar][stage] = {
                conversionCountMoyenne: this.calculMoyenneOverall(overallDatas.conversionCounts),
                totalDamageMoyenne: this.calculMoyenneOverall(overallDatas.totalDamages),
                killCountMoyenne: this.calculMoyenneOverall(overallDatas.killCounts),
                openingsPerKillMoyenne: this.calculMoyenneOverall(overallDatas.openingsPerKills),
                damagePerOpeningMoyenne: this.calculMoyenneOverall(overallDatas.damagePerOpenings),
                killPercentMoyenne: this.calculMoyenneOverall(overallDatas.totalDamages) / this.calculMoyenneOverall(overallDatas.killCounts),
            }
        }       
    }
    return processedOverallList;
  }
  
  private calculMoyenneOverall(array): number {
    let val = 0;
    for (let i = 0; i < array.length; i ++) {
        val += array[i];
    }
    return array.length > 0 ? val / array.length : undefined;
  }

  private calculMoyenneConversion(conversions, oneHitMode = false): MoyenneConversion {
    let damage = 0;
    let moves = 0;
    for (let i = 0; i < conversions.length; i++) {
        damage += conversions[i].totalDamage;
        if (!oneHitMode) {
            moves += conversions[i].moves.length;
        }
    }
    return {
        averageDamage: conversions.length !== 0 ? damage/conversions.length : undefined,
        averageLength: oneHitMode ? undefined : conversions.length !== 0 ? moves/conversions.length : undefined
    };
  }
  
  private calculMostCommonMove(movesArray): MostCommonMove {
    if (movesArray.length > 0) {
        let moves = {};
        for (const move of movesArray) {
            if (moves[move.moveId]) {
                moves[move.moveId] = moves[move.moveId] + 1
            } else {
                moves[move.moveId] = 1;
            }
        }
        let maxMoveId;
        for (const moveId of Object.keys(moves)) {
            if (maxMoveId) {
                if (moves[moveId] > moves[maxMoveId]) {
                    maxMoveId = moveId;
                }
            } else {
                maxMoveId = moveId;
            }
        }
        const move = EXTERNALMOVES[maxMoveId];
        return {move: move ? move.name : 'Weird move', count: moves[maxMoveId]};
    }
    return undefined;    
  }

}
