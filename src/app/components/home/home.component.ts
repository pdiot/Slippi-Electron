import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EnrichedGameFile } from 'src/interfaces/outputs';
import { GameFileFilter } from 'src/interfaces/types';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  enrichedGameFiles: EnrichedGameFile[];
  filter: GameFileFilter;

  constructor(private storeService: StoreService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.storeService.getStore().subscribe(value => {
      if (value) {
        if (value.enrichedGameFiles) {
          console.log('Home - Received enrichedGameFiles from store : ', value.enrichedGameFiles);
          this.enrichedGameFiles = value.enrichedGameFiles;
          this.cd.detectChanges();
        }
        if (value.gameFilter) {
          console.log('Home - Received gameFilter from store : ', value.gameFilter);
          this.filter = value.gameFilter;
          this.cd.detectChanges();
        }
        if (value.playerConversions) {
          console.log('Home - Received playerConversions from store : ', value.playerConversions);
        }
        if (value.opponentConversions) {
          console.log('Home - Received opponentConversions from store : ', value.opponentConversions);
        }
        if (value.playerOveralls) {
          console.log('Home - Received playerOveralls from store : ', value.playerOveralls);
        }
        if (value.opponentOveralls) {
          console.log('Home - Received opponentOveralls from store : ', value.opponentOveralls);
        }
      }
    })
  }

  get hasList(): boolean {
    return this.enrichedGameFiles && this.enrichedGameFiles.length > 0;
  }
}
