import { Component } from '@angular/core';
import { ElecService } from './elec.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ang-electron';
  // Creating Instances through Dependency Injection 
  constructor(private elecService: ElecService) {} 

  openWindow() { 
  // Accessing the Shell API from ElecService 
  this.elecService.shell 
    .openExternal('https://www.geeksforgeeks.org/'); 
  }
}
