import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import GeneralUtils from 'src/app/components/utils/general.utils';
import { ElecService } from 'src/app/elec.service';
import { StatsGraphService } from 'src/services/stats-graph/stats-graph.service';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit {

  private stats: any[];
  display: boolean;
  showOverlay: boolean = false;

  lCancelDataSet;
  playerOverallDataSet;
  opponentOverallDataSet;
  playerConversionsDataSet;
  opponentConversionsDataSet;
  ledgeDashesDataSet;

  toggled : any = {};

  
  colorScheme = {
    domain: ['#9e3d24', '#E44D25']
  };

  constructor(private cd: ChangeDetectorRef, private store: StoreService, private elec: ElecService, private graphService: StatsGraphService) { }

  ngOnInit(): void {
    this.store.getStore().subscribe(value => {
      if (value?.statsFilesForGraphs) {
        this.stats = value.statsFilesForGraphs;
        this.display = false;
        this.showOverlay = true;
        this.graphService.makeGraphDataSets(this.stats).then((result) => {
          this.lCancelDataSet = result.lCancelDataSet;
          this.playerOverallDataSet = result.playerOverallDataSet;
          this.opponentOverallDataSet = result.opponentOverallDataSet;
          this.playerConversionsDataSet = result.playerConversionsDataSet;
          this.opponentConversionsDataSet = result.opponentConversionsDataSet;
          this.ledgeDashesDataSet = result.playerLedgedashesDataSet;
          this.display = true;
          this.showOverlay = false;
          this.cd.detectChanges();
        });
      } else {
        this.stats = undefined;
      }
      if (value?.reset) {
        this.reset();
      }
      this.cd.detectChanges();
    });
  }

  reset(): void {
    this.stats = undefined;
    this.display = undefined;
    this.showOverlay= false;
    this.toggled = undefined;
    this.lCancelDataSet = undefined;
    this.playerOverallDataSet = undefined;
    this.opponentOverallDataSet = undefined;
    this.playerConversionsDataSet = undefined;
    this.opponentConversionsDataSet = undefined;
  }

  public handleToggleEmit(character, stage, block, value) {
    if (!this.toggled[character]) {
      this.toggled[character] = {};
    }
    if (!this.toggled[character][stage]) {
      this.toggled[character][stage] = {};
    }
    this.toggled[character][stage][block] = value;
    this.cd.detectChanges();
  }

  public buildDOM(character, stage, block) {
    return this.toggled && this.toggled[character] && this.toggled[character][stage] && this.toggled[character][stage][block];
  }

  public loadStatsFiles(): void {
    this.elec.ipcRenderer.on('statsFilesForGraphsOpened', (event, data) => {
      console.log('Graphs - gotFiles', data);
      this.store.set('statsFilesForGraphs', data);
    });
    this.elec.ipcRenderer.send('openStatsFilesForGraphs');
  }


  getKeys(object): string[] {
    return GeneralUtils.getKeys(object);
  }

  getStageName(stage: string) {
    return GeneralUtils.getStageName(stage);
  }
}
