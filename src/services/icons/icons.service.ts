import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IconsService {

  constructor() {}

  public getCharacterVersus(character: string | number, side: 'left' | 'right'): string {
    let path = 'assets/versuschars/';
    const imgName = `vs-${side}.png`;
    switch (character) {
      case 'Falcon' || 2:
        path = `${path}/captain-falcon/default/${imgName}`;
        break;
      case 'DK' || 3:
        path = `${path}/donkey-kong/default/${imgName}`;
        break;
      case 'Fox' || 1:
        path = `${path}/fox/default/${imgName}`;
        break;
      case 'G&W' || 24:
        path = `${path}/mr-game-watch/default/${imgName}`;
        break;
      case 'Kirby' || 4:
        path = `${path}/kirby/default/${imgName}`;
        break;
      case 'Bowser' || 5:
        path = `${path}/bowser/default/${imgName}`;
        break;
      case 'Link' || 6:
        path = `${path}/link/default/${imgName}`;
        break;
      case 'Luigi' || 17:
        path = `${path}/luigi/default/${imgName}`;
        break;
      case 'Mario' || 0:
        path = `${path}/mario/default/${imgName}`;
        break;
      case 'Marth' || 18:
        path = `${path}/marth/default/${imgName}`;
        break;
      case 'Mewtwo' || 16:
        path = `${path}/mewtwo/default/${imgName}`;
        break;
      case 'Ness' || 8:
        path = `${path}/ness/default/${imgName}`;
        break;
      case 'Peach' || 9:
        path = `${path}/peach/default/${imgName}`;
        break;
      case 'Pikachu' || 12:
        path = `${path}/pikachu/default/${imgName}`;
        break;
      case 'ICs' || 10:
        path = `${path}/ice-climbers/default/${imgName}`;
        break;
      case 'Puff' || 15:
        path = `${path}/jigglypuff/default/${imgName}`;
        break;
      case 'Samus' || 13:
        path = `${path}/samus/default/${imgName}`;
        break;
      case 'Yoshi' || 14:
        path = `${path}/yoshi/default/${imgName}`;
        break;
      case 'Zelda' || 19:
        path = `${path}/zelda/default/${imgName}`;
        break;
      case 'Sheik' || 7:
        path = `${path}/sheik/default/${imgName}`;
        break;
      case 'Falco' || 22:
        path = `${path}/falco/default/${imgName}`;
        break;
      case 'Doc' || 21:
        path = `${path}/dr-mario/default/${imgName}`;
        break;
      case 'Roy' || 26:
        path = `${path}/roy/default/${imgName}`;
        break;
      case 'YLink' || 20:
        path = `${path}/young-link/default/${imgName}`;
        break;
      case 'Pichu' || 23:
        path = `${path}/pichu/default/${imgName}`;
        break;
      case 'Ganon' || 25:
        path = `${path}/ganondorf/default/${imgName}`;
        break;
      default:
        path = `${path}/fox/default/${imgName}`;
        break;
    }
    return path;
  }

  public getCharacterIcon(character: string | number): string {
    const path = 'assets/chars/';
    switch (character) {
      case 'Falcon' || 2:
        return `${path}Falcon.png`;
      case 'DK' || 3:
        return `${path}DK.png`;
      case 'Fox' || 1:
        return `${path}Fox.png`;
      case 'G&W' || 24:
        return `${path}G&W.png`;
      case 'Kirby' || 4:
        return `${path}Kirby.png`;
      case 'Bowser' || 5:
        return `${path}Bowser.png`;
      case 'Link' || 6:
        return `${path}Link.png`;
      case 'Luigi' || 17:
        return `${path}Luigi.png`;
      case 'Mario' || 0:
        return `${path}Mario.png`;
      case 'Marth' || 18:
        return `${path}Marth.png`;
      case 'Mewtwo' || 16:
        return `${path}Mewtwo.png`;
      case 'Ness' || 8:
        return `${path}Ness.png`;
      case 'Peach' || 9:
        return `${path}Peach.png`;
      case 'Pikachu' || 12:
        return `${path}Pikachu.png`;
      case 'ICs' || 10:
        return `${path}ICs.png`;
      case 'Puff' || 15:
        return `${path}Jigglypuff.png`;
      case 'Samus' || 13:
        return `${path}Samus.png`;
      case 'Yoshi' || 14:
        return `${path}Yoshi.png`;
      case 'Zelda' || 19:
        return `${path}Zelda.png`;
      case 'Sheik' || 7:
        return `${path}Sheik.png`;
      case 'Falco' || 22:
        return `${path}Falco.png`;
      case 'Doc' || 21:
        return `${path}DRMario.png`;
      case 'Roy' || 26:
        return `${path}Roy.png`;
      case 'YLink' || 20:
        return `${path}YL.png`;
      case 'Pichu' || 23:
        return `${path}Pichu.png`;
      case 'Ganon' || 25:
        return `${path}Ganon.png`;
      default:
        return `${path}default.png`;
    }
  }

  public getStageMiniatureName(stage: number | string): {miniature: string, name: string} {
    const path = 'assets/stages/';
    switch (stage) {
      case 'Final Destination' || 32:
        return {miniature : `${path}FD-pic.png`, name: `${path}FD-name.png` };
      case 'Fountain of Dreams' || 2:
        return {miniature : `${path}FoD-pic.png`, name: `${path}FoD-name.png` };
      case 'Dream Land' || 28:
        return {miniature : `${path}DL-pic.png`, name: `${path}DL-name.png` };
      case 'Battlefield' || 31:
        return {miniature : `${path}BF-pic.png`, name: `${path}BF-name.png` };
      case 'Yoshi\'s story' || 8:
        return {miniature : `${path}YS-pic.png`, name: `${path}YS-name.png` };
      case 'Pokemon Stadium' || 3:
        return {miniature : `${path}PS-pic.png`, name: `${path}PS-name.png` };
      default:
        return {miniature : `${path}default-pic.png`, name: `${path}default-name.png` };
    }
  }
}
