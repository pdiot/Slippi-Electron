import { Component, OnInit } from '@angular/core';
import { cpuUsage } from 'process';
import { ElecService } from 'src/app/elec.service';
import { EnrichedGameFile, Metadata } from 'src/interfaces/outputs';
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
      console.log('event : ', event);
      const metadata = arg.metadata as Metadata;
      const enrichedGameFiles = arg.enrichedGameFiles as EnrichedGameFile[];
      console.log('metadata : ', metadata);
      console.log('enrichedGameFiles : ', enrichedGameFiles);
      this.storeService.set('metadata', metadata);
      this.storeService.set('enrichedGameFiles', enrichedGameFiles);
    });
    this.elecService.ipcRenderer.send('openFile');
  }

}
