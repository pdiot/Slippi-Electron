import { Injectable } from '@angular/core'; 
import { shell, ipcRenderer } from 'electron'; 
  
@Injectable({ 
  providedIn: 'root'
}) 
export class ElecService { 
  shell: typeof shell; 
  ipcRenderer: typeof ipcRenderer;

  constructor() {  
    this.shell = (<any>window).require("electron").shell; 
    this.ipcRenderer = (<any>window).require("electron").ipcRenderer;
  } 
} 
