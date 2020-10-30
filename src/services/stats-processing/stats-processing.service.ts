import { Injectable } from '@angular/core';
import { EXTERNALMOVES } from 'src/interfaces/const';
import { Conversion, Move, Overall, StatsWrapper } from 'src/interfaces/outputs';
import { IntermediaryStatsWrapper, MostCommonMove, MoyenneConversion, ProcessedOpenings, ProcessedOverallList, StartersAverageDamage } from 'src/interfaces/types';

@Injectable({
  providedIn: 'root'
})
export class StatsProcessingService {
  constructor() { }

  public async processConversions(data: StatsWrapper<Conversion[]>): Promise<IntermediaryStatsWrapper<ProcessedOpenings>> {
    let conversions = {};
    let processedNeutralWinsConversions = {};
    let processedNeutralWinsFirstHits = {};
    let processedKillNeutralFirstHits = {};
    let processedPunishes = {};
    let processedPunishesFirstHits = {};
    let processedKillPunishFirstHits = {};
  
    
    // Create an intermediary wrapper without the gameData
    let conversionsList: IntermediaryStatsWrapper<Conversion[]> = {};
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
                      totalDamage: conversion.currentPercent - conversion.startPercent,
                      moves: conversion.moves,
                  });
              } else {
                  oneHitOnlyNeutral.push({
                      totalDamage: conversion.currentPercent - conversion.startPercent,
                      moves: conversion.moves,
                  })
              }
              if (conversion.didKill) {
                  neutralKillFirstHits.push({
                      moveId: conversion.moves[0]?.moveId ? conversion.moves[0]?.moveId : undefined
                  });
              }
              neutralFirstHits.push({
                  moveId: conversion.moves[0]?.moveId ? conversion.moves[0]?.moveId : undefined
              });
          } else if (conversion.openingType === 'counter-attack') {
            // Punish
            if (conversion.moves.length > 1) {
                punishes.push({
                    totalDamage: conversion.currentPercent - conversion.startPercent,
                    moves: conversion.moves,
                });
            } else {
                oneHitOnlyPunishes.push({
                    totalDamage: conversion.currentPercent - conversion.startPercent,
                    moves: conversion.moves,
                });
            }
            if (conversion.didKill) {
                punishKillFirstHits.push({
                    moveId: conversion.moves[0]?.moveId ? conversion.moves[0]?.moveId : undefined
                });
            }
            punishFirstHits.push({
                moveId: conversion.moves[0]?.moveId ? conversion.moves[0]?.moveId : undefined
            });
          }
        }

        if (!conversions[opponentChar]) {
          conversions[opponentChar] = {};
        }
        conversions[opponentChar][stage] = {};
        conversions[opponentChar][stage].processedNeutralWinsConversions = {};
        conversions[opponentChar][stage].processedPunishes = {};
        conversions[opponentChar][stage].processedNeutralWinsConversions['multi-hits'] = this.calculMoyenneConversion(neutral);
        conversions[opponentChar][stage].processedNeutralWinsConversions['single-hit'] = this.calculMoyenneConversion(oneHitOnlyNeutral, true);
        conversions[opponentChar][stage].processedPunishes['multi-hits'] = this.calculMoyenneConversion(punishes);
        conversions[opponentChar][stage].processedPunishes['single-hit'] = this.calculMoyenneConversion(oneHitOnlyPunishes, true);
        conversions[opponentChar][stage].processedNeutralWinsFirstHits = this.calculMostCommonMove(neutralFirstHits);
        conversions[opponentChar][stage].processedKillNeutralFirstHits = this.calculMostCommonMove(neutralKillFirstHits);
        conversions[opponentChar][stage].processedPunishesFirstHits = this.calculMostCommonMove(punishFirstHits);
        conversions[opponentChar][stage].processedKillPunishFirstHits = this.calculMostCommonMove(punishKillFirstHits);
        conversions[opponentChar][stage].processedDamageForMostCommonNeutralOpeners = this.averageDamageForMostCommonStarters(3, [...neutral, ...oneHitOnlyNeutral], neutralFirstHits.map(move => move.moveId));
        conversions[opponentChar][stage].processedDamageForMostCommonPunishStarts = this.averageDamageForMostCommonStarters(3, [...punishes, ...oneHitOnlyPunishes], punishFirstHits.map(move => move.moveId));
      }
    }
    
    return conversions;  
  }
  
  public async processOverallList(data: StatsWrapper<Overall>): Promise<IntermediaryStatsWrapper<ProcessedOverallList>> {
    let processedOverallList = {};
    // Create an intermediary wrapper without the gameData
    let overallList: IntermediaryStatsWrapper<Overall[]> = {};
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

  private averageDamageForMostCommonStarters(nbMoves: number, conversions: {totalDamage: number, moves: Move[]}[], moveIds: number[]): StartersAverageDamage[] {
    console.log('averageDamageForMostCommonStarters, conversions : ', conversions);
    console.log('averageDamageForMostCommonStarters, moveIds : ', moveIds);
    let most = [];
    for (let moveId of moveIds) {
      const index = most.findIndex(m => m.moveId === moveId);
      if (index !== -1) {
        most[index].count += 1;
      } else {
        most.push({moveId, count : 1});
      }
    }
    const mostUsedMoves = most.sort((m1, m2) => m2.count - m1.count);
    console.log('moseUsedMoves : ', mostUsedMoves);
    const result = [];
    for (let i = 0; i < mostUsedMoves.length && i < nbMoves; i ++) {
      if (mostUsedMoves[i]) {
        let damage = 0;
        for (let conversion of conversions) {
          console.log('conversion', conversion);
          if (conversion.moves[0].moveId === mostUsedMoves[i].moveId) {
            damage += conversion.totalDamage;
          }
        }
        result.push({
          moveId : mostUsedMoves[i].moveId,
          averageDamage: damage / mostUsedMoves[i].count
        });
      }
    }
    return result;    
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
