import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { EnrichedGameFile } from 'src/interfaces/outputs';

@Component({
  selector: 'app-game-line',
  templateUrl: './game-line.component.html',
  styleUrls: ['./game-line.component.scss']
})
export class GameLineComponent implements OnInit, OnChanges {

  @Input() game: EnrichedGameFile;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.game?.currentValue) {
      this.game = changes.game.currentValue;
      this.cd.detectChanges();
    }
  }

}
