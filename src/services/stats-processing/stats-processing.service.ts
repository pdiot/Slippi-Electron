import { Injectable } from '@angular/core';
import GeneralUtils from 'src/app/components/utils/general.utils';
import { EXTERNALMOVES } from 'src/interfaces/const';
import { Conversion, LCancels, Ledgedashes, Move, Overall, PunishedActions, StatsWrapper } from 'src/interfaces/outputs';
import { IntermediaryStatsWrapper, MostCommonMove, MoyenneConversion, ProcessedAttack, ProcessedDefensiveOption, ProcessedLCancels, ProcessedLedgedashes, ProcessedMovementOption, ProcessedOpenings, ProcessedOverallList, ProcessedPunishedOptions, StartersAverageDamage } from 'src/interfaces/types';

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
      processedNeutralWinsConversions[opponentChar] = {};
      processedNeutralWinsFirstHits[opponentChar] = {};
      processedKillNeutralFirstHits[opponentChar] = {};
      processedPunishes[opponentChar] = {};
      processedPunishesFirstHits[opponentChar] = {};
      processedKillPunishFirstHits[opponentChar] = {};
      let neutralAllStages = [];
      let punishesAllStages = [];
      let oneHitOnlyNeutralAllStages = [];
      let oneHitOnlyPunishesAllStages = [];
      let neutralFirstHitsAllStages = [];
      let neutralKillFirstHitsAllStages = [];
      let punishFirstHitsAllStages = [];
      let punishKillFirstHitsAllStages = [];

      for (const stage of Object.keys(conversionsList[opponentChar])) {
        processedNeutralWinsConversions[opponentChar][stage] = {};
        processedNeutralWinsFirstHits[opponentChar][stage] = {};
        processedKillNeutralFirstHits[opponentChar][stage] = {};
        processedPunishes[opponentChar][stage] = {};
        processedPunishesFirstHits[opponentChar][stage] = {};
        processedKillPunishFirstHits[opponentChar][stage] = {};
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

        //AllStages
        neutralAllStages.push(...neutral);
        oneHitOnlyNeutralAllStages.push(...oneHitOnlyNeutral);
        neutralKillFirstHitsAllStages.push(...neutralKillFirstHits);
        neutralFirstHitsAllStages.push(...neutralFirstHits);
        punishesAllStages.push(...punishes);
        oneHitOnlyPunishesAllStages.push(...oneHitOnlyPunishes);
        punishKillFirstHitsAllStages.push(...punishKillFirstHits);
        punishFirstHitsAllStages.push(...punishFirstHits);
      }

      if (!conversions[opponentChar]['allStages']) {
        conversions[opponentChar]['allStages'] = {};
      }
      conversions[opponentChar]['allStages'].processedNeutralWinsConversions = {};
      conversions[opponentChar]['allStages'].processedPunishes = {};
      conversions[opponentChar]['allStages'].processedNeutralWinsConversions['multi-hits'] = this.calculMoyenneConversion(neutralAllStages);
      conversions[opponentChar]['allStages'].processedNeutralWinsConversions['single-hit'] = this.calculMoyenneConversion(oneHitOnlyNeutralAllStages, true);
      conversions[opponentChar]['allStages'].processedPunishes['multi-hits'] = this.calculMoyenneConversion(punishesAllStages);
      conversions[opponentChar]['allStages'].processedPunishes['single-hit'] = this.calculMoyenneConversion(oneHitOnlyPunishesAllStages, true);
      conversions[opponentChar]['allStages'].processedNeutralWinsFirstHits = this.calculMostCommonMove(neutralFirstHitsAllStages);
      conversions[opponentChar]['allStages'].processedKillNeutralFirstHits = this.calculMostCommonMove(neutralKillFirstHitsAllStages);
      conversions[opponentChar]['allStages'].processedPunishesFirstHits = this.calculMostCommonMove(punishFirstHitsAllStages);
      conversions[opponentChar]['allStages'].processedKillPunishFirstHits = this.calculMostCommonMove(punishKillFirstHitsAllStages);
      conversions[opponentChar]['allStages'].processedDamageForMostCommonNeutralOpeners = this.averageDamageForMostCommonStarters(3, [...neutralAllStages, ...oneHitOnlyNeutralAllStages], neutralFirstHitsAllStages.map(move => move.moveId));
      conversions[opponentChar]['allStages'].processedDamageForMostCommonPunishStarts = this.averageDamageForMostCommonStarters(3, [...punishesAllStages, ...oneHitOnlyPunishesAllStages], punishFirstHitsAllStages.map(move => move.moveId));
      console.debug('Conversions for ' + opponentChar + ' : ', conversions[opponentChar]);
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
    let overallDatasAllStages;
    for (const opponentChar of Object.keys(overallList)) {
      processedOverallList[opponentChar] = {};
      overallDatasAllStages = {
        totalDamages: [],
        conversionsRatio: [],
        killCounts: [],
        openingsPerKills: [],
      }
      for (const stage of Object.keys(overallList[opponentChar])) {
        overallDatas = {
          totalDamages: [],
          conversionsRatio: [],
          killCounts: [],
          openingsPerKills: [],
        }
        for (const overall of overallList[opponentChar][stage]) {
          overallDatas.totalDamages.push(overall.totalDamage);
          overallDatas.killCounts.push(overall.killCount);
          overallDatas.conversionsRatio.push(overall.conversionsRatio);
          overallDatas.openingsPerKills.push(overall.openingsPerKill?.ratio ? overall.openingsPerKill?.ratio : undefined);

          //All stages
          overallDatasAllStages.totalDamages.push(overall.totalDamage);
          overallDatasAllStages.killCounts.push(overall.killCount);
          overallDatasAllStages.conversionsRatio.push(overall.conversionsRatio);
          overallDatasAllStages.openingsPerKills.push(overall.openingsPerKill?.ratio ? overall.openingsPerKill?.ratio : undefined);
        }

        processedOverallList[opponentChar][stage] = {
          totalDamageMoyenne: this.calculMoyenneOverall(overallDatas.totalDamages),
          killCountMoyenne: this.calculMoyenneOverall(overallDatas.killCounts),
          conversionsRatio: this.calculMoyenneOverall(overallDatas.conversionsRatio),
          openingsPerKillMoyenne: this.calculMoyenneOverall(overallDatas.openingsPerKills),
          killPercentMoyenne: this.calculMoyenneOverall(overallDatas.totalDamages) / this.calculMoyenneOverall(overallDatas.killCounts),
        }
      }
      // All stages
      processedOverallList[opponentChar]['allStages'] = {
        totalDamageMoyenne: this.calculMoyenneOverall(overallDatasAllStages.totalDamages),
        killCountMoyenne: this.calculMoyenneOverall(overallDatasAllStages.killCounts),
        conversionsRatio: this.calculMoyenneOverall(overallDatasAllStages.conversionsRatio),
        openingsPerKillMoyenne: this.calculMoyenneOverall(overallDatasAllStages.openingsPerKills),
        killPercentMoyenne: this.calculMoyenneOverall(overallDatasAllStages.totalDamages) / this.calculMoyenneOverall(overallDatasAllStages.killCounts),
      }
    }
    return processedOverallList;
  }

  public async processPunishedActions(data: StatsWrapper<PunishedActions>): Promise<IntermediaryStatsWrapper<ProcessedPunishedOptions>> {
    let processedPunishedActionsList = {};
    let punishedActions;
    let punishedActionsAllStages;

    // Create an intermediary wrapper without the gameData
    let punishedActionsList: IntermediaryStatsWrapper<PunishedActions> = {};
    for (const game of Object.keys(data)) {
      for (const character of Object.keys(data[game])) {
        // We'll only have one character each time here (opponent's character)
        if (punishedActionsList[character]) {
          for (const stage of Object.keys(data[game][character])) {
            // Same here, we'll only have one stage each time here
            if (punishedActionsList[character][stage]) {
              punishedActionsList[character][stage] = {
                punishedAttacks: [
                  ...punishedActionsList[character][stage].punishedAttacks,
                  ...data[game][character][stage].punishedAttacks
                ],
                punishedDefensiveOptions: [
                  ...punishedActionsList[character][stage].punishedDefensiveOptions,
                  ...data[game][character][stage].punishedDefensiveOptions
                ],
                punishedMovementOptions: [
                  ...punishedActionsList[character][stage].punishedMovementOptions,
                  ...data[game][character][stage].punishedMovementOptions
                ],
              };
            } else {
              punishedActionsList[character][stage] = data[game][character][stage];
            }
          }
        } else {
          // First game with this character
          punishedActionsList[character] = data[game][character];
        }
      }
    }

    for (let character of Object.keys(punishedActionsList)) {
      processedPunishedActionsList[character] = {};
      punishedActionsAllStages = {
        punishedAttacks: [],
        punishedDefensiveOptions: [],
        punishedMovementOptions: []
      }
      for (let stage of Object.keys(punishedActionsList[character])) {
        punishedActions = {
          punishedAttacks: [],
          punishedDefensiveOptions: [],
          punishedMovementOptions: []
        }

        punishedActions.punishedAttacks = punishedActionsList[character][stage].punishedAttacks;
        punishedActions.punishedDefensiveOptions = punishedActionsList[character][stage].punishedDefensiveOptions;
        punishedActions.punishedMovementOptions = punishedActionsList[character][stage].punishedMovementOptions;

        punishedActionsAllStages.punishedAttacks.push(...punishedActionsList[character][stage].punishedAttacks);
        punishedActionsAllStages.punishedDefensiveOptions.push(...punishedActionsList[character][stage].punishedDefensiveOptions);
        punishedActionsAllStages.punishedMovementOptions.push(...punishedActionsList[character][stage].punishedMovementOptions);

        // Process Data for current stage
        processedPunishedActionsList[character][stage] = {
          punishedAttacks: {
            onHit: this.countOptions(
              punishedActions.punishedAttacks
                .filter(punishedAttack => punishedAttack.status === 'Hit')
                .map(punishedAttack => punishedAttack.name)
            ).map(
              (countOption) => {
                return {
                  attack: countOption.option,
                  count: countOption.count
                }
              }
            ),
            onShield: this.countOptions(
              punishedActions.punishedAttacks
                .filter(punishedAttack => punishedAttack.status === 'Shield')
                .map(punishedAttack => punishedAttack.name)
            ).map(
              (countOption) => {
                return {
                  attack: countOption.option,
                  count: countOption.count
                }
              }
            ),
            onWhiff: this.countOptions(
              punishedActions.punishedAttacks
                .filter(punishedAttack => punishedAttack.status === 'Whiff')
                .map(punishedAttack => punishedAttack.name)
            ).map(
              (countOption) => {
                return {
                  attack: countOption.option,
                  count: countOption.count
                }
              }
            ),
          },
          punishedDefensiveOptions: this.countOptions(punishedActions.punishedDefensiveOptions).map(
            (countOption) => {
              return {
                defensiveOption: countOption.option,
                count: countOption.count
              }
            }
          ),
          punishedMovementOptions: this.countOptions(punishedActions.punishedMovementOptions).map(
            (countOption) => {
              return {
                movementOption: countOption.option,
                count: countOption.count
              }
            }
          )
        };
      }
      // Process Data for all stages
      processedPunishedActionsList[character]['allStages'] = {
        punishedAttacks: {
          onHit: this.countOptions(
            punishedActionsAllStages.punishedAttacks
              .filter(punishedAttack => punishedAttack.status === 'Hit')
              .map(punishedAttack => punishedAttack.name)
          ).map(
            (countOption) => {
              return {
                attack: countOption.option,
                count: countOption.count
              }
            }
          ),
          onShield: this.countOptions(
            punishedActionsAllStages.punishedAttacks
              .filter(punishedAttack => punishedAttack.status === 'Shield')
              .map(punishedAttack => punishedAttack.name)
          ).map(
            (countOption) => {
              return {
                attack: countOption.option,
                count: countOption.count
              }
            }
          ),
          onPShield: this.countOptions(
            punishedActionsAllStages.punishedAttacks
              .filter(punishedAttack => punishedAttack.status === 'Powershield')
              .map(punishedAttack => punishedAttack.name)
          ).map(
            (countOption) => {
              return {
                attack: countOption.option,
                count: countOption.count
              }
            }
          ),
          onWhiff: this.countOptions(
            punishedActionsAllStages.punishedAttacks
              .filter(punishedAttack => punishedAttack.status === 'Whiff')
              .map(punishedAttack => punishedAttack.name)
          ).map(
            (countOption) => {
              return {
                attack: countOption.option,
                count: countOption.count
              }
            }
          ),
        },
        punishedDefensiveOptions: this.countOptions(punishedActionsAllStages.punishedDefensiveOptions).map(
          (countOption) => {
            return {
              defensiveOption: countOption.option,
              count: countOption.count
            }
          }
        ),
        punishedMovementOptions: this.countOptions(punishedActionsAllStages.punishedMovementOptions).map(
          (countOption) => {
            return {
              movementOption: countOption.option,
              count: countOption.count
            }
          }
        )

      };
    }
    return processedPunishedActionsList;
  }

  public async processLCancels(data: StatsWrapper<LCancels>): Promise<IntermediaryStatsWrapper<ProcessedLCancels>> {
    let processedLCancels = {};
    let lcancels;
    let lcancelsAllStages;

    // Create an intermediary wrapper without the gameData
    let lcancelsList: IntermediaryStatsWrapper<LCancels> = {};
    for (const game of Object.keys(data)) {
      for (const character of Object.keys(data[game])) {
        // We'll only have one character each time here (opponent's character)
        if (lcancelsList[character]) {
          for (const stage of Object.keys(data[game][character])) {
            // Same here, we'll only have one stage each time here
            if (lcancelsList[character][stage]) {
              lcancelsList[character][stage] = {
                failedMoves: [
                  ...lcancelsList[character][stage].failedMoves,
                  ...data[game][character][stage].failedMoves
                ],
                lcancels: {
                  successful: lcancelsList[character][stage].lcancels.successful + data[game][character][stage].lcancels.successful,
                  failed: lcancelsList[character][stage].lcancels.failed + data[game][character][stage].lcancels.failed,
                }
              };
            } else {
              lcancelsList[character][stage] = data[game][character][stage];
            }
          }
        } else {
          // First game with this character
          lcancelsList[character] = data[game][character];
        }
      }
    }
    for (let character of Object.keys(lcancelsList)) {
      processedLCancels[character] = {};
      lcancelsAllStages = {
        lcancels: [],
        failedMoves: []
      };
      for (let stage of Object.keys(lcancelsList[character])) {
        lcancels = lcancelsList[character][stage];
        lcancelsAllStages.lcancels.push(lcancelsList[character][stage].lcancels)
        lcancelsAllStages.failedMoves.push(...lcancelsList[character][stage].failedMoves)

        // Process data for current stage
        processedLCancels[character][stage] = {
          lcancels: lcancels.lcancels,
          failedMoves: this.countOptions(lcancels.failedMoves).map(
            (countOption) => {
              return {
                move: countOption.option,
                count: countOption.count,
              }
            }
          )
        };
      }
      // Process data for all stages
      processedLCancels[character]['allStages'] = {
        lcancels: this.sumLcancels(lcancelsAllStages.lcancels),
        failedMoves: this.countOptions(lcancelsAllStages.failedMoves).map(
          (countOption) => {
            return {
              move: countOption.option,
              count: countOption.count,
            }
          }
        )
      };
    }
    return processedLCancels;
  }

  public async processLedgeDashes(data: StatsWrapper<Ledgedashes>): Promise<IntermediaryStatsWrapper<ProcessedLedgedashes>> {
    let processedLedgeDashes = {};
    let ledgeDashes: Ledgedashes;
    let ledgeDashesAllStages;

    // Create an intermediary wrapper without the gameData
    let ledgeDashesList: IntermediaryStatsWrapper<Ledgedashes> = {};
    for (const game of Object.keys(data)) {
      for (const character of Object.keys(data[game])) {
        // We'll only have one character each time here (opponent's character)
        if (ledgeDashesList[character]) {
          for (const stage of Object.keys(data[game][character])) {
            // Same here, we'll only have one stage each time here
            if (ledgeDashesList[character][stage]) {
              if (data[game][character][stage]['invincible']) {
                ledgeDashesList[character][stage]['invincible'].push(
                  ...data[game][character][stage]['invincible']
                );
              }
              if (data[game][character][stage]['notInvincible']) {
                ledgeDashesList[character][stage]['notInvincible'].push(
                  ...data[game][character][stage]['notInvincible']
                );
              }
            } else {
              ledgeDashesList[character][stage] = data[game][character][stage];
            }
          }
        } else {
          // First game with this character
          ledgeDashesList[character] = data[game][character];
        }
      }
    }

    for (let character of Object.keys(ledgeDashesList)) {
      processedLedgeDashes[character] = {};
      ledgeDashesAllStages = {
        invincible: [],
        notInvincible: [],
      }
      for (let stage of Object.keys(ledgeDashesList[character])) {
        ledgeDashes = ledgeDashesList[character][stage];
        if (ledgeDashesList[character] && ledgeDashesList[character][stage]) {
          if (ledgeDashesList[character][stage]['invincible']?.length > 0) {
            ledgeDashesAllStages.invincible.push(...ledgeDashesList[character][stage]['invincible']);
          }
          if (ledgeDashesList[character][stage]['notInvincible']?.length > 0) {
            ledgeDashesAllStages.notInvincible.push(...ledgeDashesList[character][stage]['notInvincible']);
          }
        }
        let invincible;
        let notInvincible;
        // Process data for current stage
        if (ledgeDashes && ledgeDashes['invincible']) {
          const averageFramesSinceLedgeDropInvincible = this.calculMoyenneOverall(ledgeDashes['invincible'].map(
            ledgeDash => ledgeDash.framesSinceLedgeDrop
          ));
          const averageExtraInvincibilityFrames = this.calculMoyenneOverall(ledgeDashes['invincible'].map(
            ledgeDash => ledgeDash.extraInvincibilityFrames
          ));
          const minFramesSinceLedgedropInvincible = GeneralUtils.minValueFromNumberArray(ledgeDashes['invincible'].map(
            ledgeDash => ledgeDash.framesSinceLedgeDrop
          ));
          const maxExtraInvincibilityFrames = GeneralUtils.maxValueFromNumberArray(ledgeDashes['invincible'].map(
            ledgeDash => ledgeDash.extraInvincibilityFrames
          ));
          let percentOfTotalLedgedashes;
          if (ledgeDashes['notInvincible']) {
            if (ledgeDashes['invincible']?.length > 0) {
              percentOfTotalLedgedashes = ledgeDashes['invincible'].length * 100 / (ledgeDashes['invincible'].length + ledgeDashes['notInvincible'].length);
            } else {
              percentOfTotalLedgedashes = 0;
            }
          } else {
            percentOfTotalLedgedashes = 100;
          }

          invincible = {
            percentOfTotalLedgedashes,
            averageFramesSinceLedgeDrop: averageFramesSinceLedgeDropInvincible,
            averageExtraInvincibilityFrames,
            minFramesSinceLedgeDrop: minFramesSinceLedgedropInvincible,
            maxExtraInvincibilityFrames
          }

        }
        if (ledgeDashes && ledgeDashes['notInvincible']) {
          const averageFramesSinceLedgeDropNotInvincible = this.calculMoyenneOverall(ledgeDashes['notInvincible'].map(
            ledgeDash => ledgeDash.framesSinceLedgeDrop
          ));
          const minFramesSinceLedgedropNotInvincible = GeneralUtils.minValueFromNumberArray(ledgeDashes['notInvincible'].map(
            ledgeDash => ledgeDash.framesSinceLedgeDrop
          ));
          const maxFramesSinceLedgedropNotInvincible = GeneralUtils.maxValueFromNumberArray(ledgeDashes['notInvincible'].map(
            ledgeDash => ledgeDash.framesSinceLedgeDrop
          ));

          notInvincible = {
            averageFramesSinceLedgeDrop: averageFramesSinceLedgeDropNotInvincible,
            minFramesSinceLedgeDrop: minFramesSinceLedgedropNotInvincible,
            maxFramesSinceLedgeDrop: maxFramesSinceLedgedropNotInvincible
          }

        }

        processedLedgeDashes[character][stage] = {
          invincible,
          notInvincible,
        }
      }
      // Process data for all stages
      let invincible;
      let notInvincible;
      if (ledgeDashesAllStages && ledgeDashesAllStages['invincible']) {
        const averageFramesSinceLedgeDropInvincible = this.calculMoyenneOverall(ledgeDashesAllStages['invincible'].map(
          ledgeDash => ledgeDash.framesSinceLedgeDrop
        ));
        const averageExtraInvincibilityFrames = this.calculMoyenneOverall(ledgeDashesAllStages['invincible'].map(
          ledgeDash => ledgeDash.extraInvincibilityFrames
        ));
        const minFramesSinceLedgedropInvincible = GeneralUtils.minValueFromNumberArray(ledgeDashesAllStages['invincible'].map(
          ledgeDash => ledgeDash.framesSinceLedgeDrop
        ));
        const maxExtraInvincibilityFrames = GeneralUtils.maxValueFromNumberArray(ledgeDashesAllStages['invincible'].map(
          ledgeDash => ledgeDash.extraInvincibilityFrames
        ));

        let percentOfTotalLedgedashes;
        if (ledgeDashesAllStages['notInvincible']) {
          if (ledgeDashesAllStages['invincible']?.length > 0) {
            percentOfTotalLedgedashes = ledgeDashesAllStages['invincible'].length * 100 / (ledgeDashesAllStages['invincible'].length + ledgeDashesAllStages['notInvincible'].length);
          } else {
            percentOfTotalLedgedashes = 0;
          }
        } else {
          percentOfTotalLedgedashes = 100;
        }

        invincible = {
          percentOfTotalLedgedashes,
          averageFramesSinceLedgeDrop: averageFramesSinceLedgeDropInvincible,
          averageExtraInvincibilityFrames,
          minFramesSinceLedgeDrop: minFramesSinceLedgedropInvincible,
          maxExtraInvincibilityFrames
        }
      }

      if (ledgeDashesAllStages && ledgeDashesAllStages['notInvincible']) {
        const averageFramesSinceLedgeDropNotInvincible = this.calculMoyenneOverall(ledgeDashesAllStages['notInvincible'].map(
          ledgeDash => ledgeDash.framesSinceLedgeDrop
        ));
        const minFramesSinceLedgedropNotInvincible = GeneralUtils.minValueFromNumberArray(ledgeDashesAllStages['notInvincible'].map(
          ledgeDash => ledgeDash.framesSinceLedgeDrop
        ));
        const maxFramesSinceLedgedropNotInvincible = GeneralUtils.maxValueFromNumberArray(ledgeDashesAllStages['notInvincible'].map(
          ledgeDash => ledgeDash.framesSinceLedgeDrop
        ));

        notInvincible = {
          averageFramesSinceLedgeDrop: averageFramesSinceLedgeDropNotInvincible,
          minFramesSinceLedgeDrop: minFramesSinceLedgedropNotInvincible,
          maxFramesSinceLedgeDrop: maxFramesSinceLedgedropNotInvincible
        }
      }

      processedLedgeDashes[character]['allStages'] = {
        invincible,
        notInvincible
      }
    }
    return processedLedgeDashes;
  }

  private averageDamageForMostCommonStarters(nbMoves: number, conversions: { totalDamage: number, moves: Move[] }[], moveIds: number[]): StartersAverageDamage[] {
    let most = [];
    for (let moveId of moveIds) {
      const index = most.findIndex(m => m.moveId === moveId);
      if (index !== -1) {
        most[index].count += 1;
      } else {
        most.push({ moveId, count: 1 });
      }
    }
    const mostUsedMoves = most.sort((m1, m2) => m2.count - m1.count);
    const result = [];
    for (let i = 0; i < mostUsedMoves.length && i < nbMoves; i++) {
      if (mostUsedMoves[i]) {
        let damage = 0;
        for (let conversion of conversions) {
          if (conversion.moves?.length > 0) { // Same as for slippi-stats-workerfile, apparently this can happen
            if (conversion.moves[0].moveId === mostUsedMoves[i].moveId) {
              damage += conversion.totalDamage;
            }
          } else {
            console.log('DEBUG : the weird conversion ', conversion);
          }
        }
        result.push({
          moveId: mostUsedMoves[i].moveId,
          averageDamage: damage / mostUsedMoves[i].count
        });
      }
    }
    return result;
  }

  private calculMoyenneOverall(array): number {
    let val = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        val += array[i];
      }
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
      averageDamage: conversions.length !== 0 ? damage / conversions.length : undefined,
      averageLength: oneHitMode ? undefined : conversions.length !== 0 ? moves / conversions.length : undefined
    };
  }

  private calculMostCommonMove(movesArray): MostCommonMove {
    let totalMovesCounted = 0;
    if (movesArray.length > 0) {
      let moves = {};
      for (const move of movesArray) {
        if (moves[move.moveId]) {
          moves[move.moveId] = moves[move.moveId] + 1
        } else {
          moves[move.moveId] = 1;
        }
        totalMovesCounted++;
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
      return { move: move ? move.name : 'Weird move', count: moves[maxMoveId] / totalMovesCounted * 100 };
    }
    return undefined;
  }

  private countOptions(options: string[]): { option: string, count: number }[] {
    let returnValue = [];
    let totalOptionsCounted = 0;
    if (options?.length > 0) {
      for (let option of options) {
        const rvIndex = returnValue.findIndex(rv => rv.option === option);
        if (rvIndex !== -1) {
          returnValue[rvIndex].count++;
        } else {
          returnValue.push({ option: option, count: 1 });
        }
        totalOptionsCounted++;
      }
      for (let value of returnValue) {
        value.count = value.count / totalOptionsCounted * 100;
      }
    }
    return returnValue;
  }

  private sumLcancels(lcancels: { successful: number, failed: number }[]): { successful: number, failed: number } {
    let returnValue = {
      successful: 0,
      failed: 0
    };
    for (let lcancel of lcancels) {
      returnValue.failed += lcancel.failed;
      returnValue.successful += lcancel.successful;
    }
    return returnValue;
  }

}
