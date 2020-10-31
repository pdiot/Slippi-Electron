import { BETTERMOVES } from 'src/interfaces/const';

export default class GeneralUtils {


  static getKeys(object): string[] {
    return Object.keys(object);
  }

  static getMoveName(moveId: number) {
    const move = BETTERMOVES.find(bm => bm.id === moveId);
    return move ? move.name : 'Weird move';
  }

  static getStageName(stage: string) {
    console.log('getStageName :', stage);
    if (stage === 'allStages') {
      console.log('return all stages');
      return 'all stages';
    } else {
      console.log('return ', stage);
      return stage;
    }
  }
}
  