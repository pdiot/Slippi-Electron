import { ChangeDetectorRef, Component } from '@angular/core';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Statislipp';

  isMenuVisible: boolean = false;

  constructor(private cd: ChangeDetectorRef, private store: StoreService) {
    this.store.getStore().subscribe(value => {
      if (value?.visibleMenu === false) {
        this.toggleMenu(false);
      }
    });
  } 

  toggleMenu(value = !this.isMenuVisible) {
    this.isMenuVisible = value;
    this.cd.detectChanges();
  }

}
