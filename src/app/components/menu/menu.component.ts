import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from 'src/services/store/store.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {


  constructor(private store: StoreService,
    private router: Router) {}

  ngOnInit(): void {
  }

  hideMenu() {
    this.store.set('visibleMenu', false);
  }
  
  public resetApp(): void {
    this.store.reset();
  }

  public navigate(route): void {
    this.store.set('visibleMenu', false);
    this.router.navigate([route]);
  }

}
