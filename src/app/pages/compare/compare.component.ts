import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ElecService } from 'src/app/elec.service';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {

  firstFile;
  firstFilePath;
  secondFile;
  secondFilePath;
  showOverlay = false;

  stats;

  constructor(private electron: ElecService, private cd : ChangeDetectorRef, private store: StoreService) { }

  ngOnInit(): void {
    this.store.getStore().subscribe(value => {
      if (value?.firstFile) {
        this.firstFile = value.firstFile.statsFromJSON;
        this.firstFilePath = value.firstFile.path;
        this.makeStats();
      } else {
        this.firstFile = undefined;
        this.firstFilePath = undefined;
      }
      if (value?.secondFile) {
        this.secondFile = value.secondFile.statsFromJSON;
        this.secondFilePath = value.secondFile.path;
        this.makeStats();
      } else {
        this.secondFile = undefined;
        this.secondFilePath = undefined;
      }
      this.cd.detectChanges();
    })
  }

  makeStats() {
    if (this.secondFile && this.firstFile) {
      this.stats = {
        playerCharName: this.firstFile.playerCharName,
        playerOverall: this.firstFile.playerOverall,
        opponentOverall: this.secondFile.playerOverall,
        playerConversions: this.firstFile.playerConversions,
        opponentConversions: this.secondFile.playerConversions,
        punishedActionsForPlayer: this.firstFile.punishedActionsForPlayer,
        punishedActionsForOpponent: this.secondFile.punishedActionsForPlayer,
        lcancelsForPlayer: this.firstFile.lcancelsForPlayer,
        lcancelsForOpponent: this.secondFile.lcancelsForPlayer,
        ledgeDashesForPlayer: this.firstFile.ledgeDashesForPlayer,
        ledgeDashesForOpponent: this.firstFile.ledgeDashesForPlayer,
        playerWavedashes: this.firstFile.playerWavedashes,
        opponentWavedashes: this.secondFile.opponentWavedashes,
        playerJCGrabs: this.firstFile.playerJCGrabs,
        opponentJCGrabs: this.secondFile.opponentJCGrabs,
      }
    }
  }

  loadFile(select: number) {
    this.electron.ipcRenderer.on('firstStatsFileOpenedOK', (event, data) => {
      console.log('Compare - gotFirstFile');
      this.store.set('firstFile', data);
    });
    this.electron.ipcRenderer.on('secondStatsFileOpenedOK', (event, data) => {
      console.log('Compare - gotSecondFile');
      this.store.set('secondFile', data);
    });
    switch (select) {
      case 1:
        this.electron.ipcRenderer.send('openStatsFile', 'first');
        break;
      case 2:
        this.electron.ipcRenderer.send('openStatsFile', 'second');
        break;
      default:
        console.log('Compare - Wrong loadFile call');
        break;
    }
  }
}
