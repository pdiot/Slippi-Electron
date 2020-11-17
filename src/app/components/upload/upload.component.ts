import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ElecService } from 'src/app/elec.service';
import { EnrichedGameFile } from 'src/interfaces/outputs';
import { TourButton } from 'src/interfaces/tour';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, AfterViewInit {

  constructor(private elecService: ElecService, private storeService: StoreService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!(localStorage.getItem('upload-tour') === 'complete')) {
      const buttons: TourButton[] = [
        {
          label: 'OK',
          click: () => {
            localStorage.setItem('upload-tour', 'complete');
            this.storeService.resetTour();
          }
        }
      ];
      this.storeService.setMultipleTour([
        {
          key: 'title',
          data: 'Welcome to Statislipp !'
        },
        {
          key: 'text',
          data: 'First, choose some .slp files to upload'
        },
        {
          key: 'buttons',
          data: buttons
        },
        {
          key: 'show',
          data: true
        }
      ]);
    }
  }

  callFileLoader() {
    this.elecService.ipcRenderer.on('fileOpenedOK', (event, arg) => {
      // Callback de main.js => openFile
      const enrichedGameFiles = arg as EnrichedGameFile[];
      this.storeService.reset();
      this.storeService.set('enrichedGameFiles', enrichedGameFiles);
    });
    this.elecService.ipcRenderer.send('openFile');
  }

}
