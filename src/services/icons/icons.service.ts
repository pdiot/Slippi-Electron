import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IconsService {

  constructor() {}

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
