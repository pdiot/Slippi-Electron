import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Metadata, EnrichedGameFile } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  metadata: Metadata;
  enrichedGameFiles: EnrichedGameFile[];
  filter: GameFileFilter;

  constructor(private storeService: StoreService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.storeService.getStore().subscribe(value => {
      if (value) {
        if (value.metadata) {
          this.metadata = value.metadata;
          this.cd.detectChanges();
        }
        if (value.enrichedGameFiles) {
          this.enrichedGameFiles = value.enrichedGameFiles;
          this.cd.detectChanges();
        }
        if (value.gameFilter) {
          this.filter = value.gameFilter;
          this.cd.detectChanges();
        }
      }
    })
  }

  get hasList(): boolean {
    return this.enrichedGameFiles && this.enrichedGameFiles.length > 0;
  }
}
