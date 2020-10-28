import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EnrichedGameFile } from 'src/interfaces/outputs';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})
export class SidePanelComponent implements OnInit, OnChanges {

  @Input()
  enrichedGameFiles: EnrichedGameFile[];

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('side panel - ngOnChanges, changes : ', changes);
    if (changes?.enrichedGameFiles?.currentValue) {
      this.enrichedGameFiles = changes.enrichedGameFiles.currentValue;
      this.cd.detectChanges();
    }
  }
}
