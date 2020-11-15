import { BETTERMOVES } from 'src/interfaces/const';
import { ProcessedAttack } from 'src/interfaces/types';

export default class GeneralUtils {


  static getKeys(object): string[] {
    return Object.keys(object);
  }

  static getMoveName(moveId: number) {
    const move = BETTERMOVES.find(bm => bm.id === moveId);
    return move ? move.name : 'Weird move';
  }

  static getStageName(stage: string) {
    if (stage === 'allStages') {
      return 'all stages';
    } else {
      return stage;
    }
  }

  static removeLanding(landing: string): string {
    return landing.split(' ')[0];
  }

  static getTop3MostCommonMoves(moves: { move: string, count: number }[]): { move: string, count: number }[] {
    let returnValue = [];
    let sortedMoves = moves.sort((moveA, moveB) => moveB.count - moveA.count);
    for (let i = 0; i < moves.length && i < 3; i++) {
      returnValue.push(sortedMoves[i]);
    }
    return returnValue;
  }

  static minValueFromNumberArray(numbers: number[]): number {
    let min;
    for (let num of numbers) {
      if (!min) {
        min = num;
      } else if (num < min) {
        min = num;
      }
    }
    return min;
  }

  static maxValueFromNumberArray(numbers: number[]): number {
    let max;
    for (let num of numbers) {
      if (!max) {
        max = num;
      } else if (num > max) {
        max = num;
      }
    }
    return max;
  }

  static moyenneFromNumberArray(numbers: number[]): number {
    let total = 0, count = 0;
    for (let num of numbers) {
      if (num) {
        total += num;
        count ++;
      }
    }
    if (count !== 0) {
      return total / count;
    } else {
      return undefined;
    }
  }
}

