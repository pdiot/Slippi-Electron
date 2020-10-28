export default class GameFileUtils {
  
  static niceName(gameFile: string): string {
    return gameFile.substring(gameFile.length - 19, gameFile.length - 4);
  }
}