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

  static getTop3MostCommonMoves(moves: {move: string, count: number}[]): {move: string, count: number}[] {
    let returnValue = [];
    let sortedMoves = moves.sort((moveA, moveB) => moveB.count - moveA.count);
    for (let i = 0; i < moves.length && i < 3; i ++) {
      returnValue.push(sortedMoves[i]);
    }
    return returnValue;
  }
}
  