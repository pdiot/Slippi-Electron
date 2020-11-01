import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ElecService } from 'src/app/elec.service';
import GameFileUtils from '../utils/gameFile.utils';

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

  constructor(private electron: ElecService, private cd : ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  loadFile(select: number) {
    this.electron.ipcRenderer.on('firstStatsFileOpenedOK', (event, data) => {
      this.firstFile = data.statsFromJSON;
      this.firstFilePath = data.path;
      console.log('Compare - gotFirstFile');
      this.cd.detectChanges();
    });
    this.electron.ipcRenderer.on('secondStatsFileOpenedOK', (event, data) => {
      this.secondFile = data.statsFromJSON;
      this.secondFilePath = data.path;
      console.log('Compare - gotSecondFile');
      this.cd.detectChanges();
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
