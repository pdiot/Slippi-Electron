import { Component, OnInit } from '@angular/core';
import { ElecService } from 'src/app/elec.service';
import { EnrichedGameFile } from 'src/interfaces/outputs';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  constructor(private elecService: ElecService, private storeService: StoreService) { }

  ngOnInit(): void {
  }

  callFileLoader() {
    this.elecService.ipcRenderer.on('fileOpenedOK', (event, arg) => {
      // Callback de main.js => openFile
      const enrichedGameFiles = arg as EnrichedGameFile[];
      this.storeService.set('enrichedGameFiles', enrichedGameFiles);
    });
    this.elecService.ipcRenderer.send('openFile');
  }

}
