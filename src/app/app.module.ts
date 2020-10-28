import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadComponent } from './components/upload/upload.component';
import { HomeComponent } from './components/home/home.component';
import { GameListComponent } from './components/game-list/game-list.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterFormComponent } from './components/filter-form/filter-form.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { StatsGameSelectComponent } from './components/stats-game-select/stats-game-select.component';
import { StatsDisplayComponent } from './components/stats-display/stats-display.component';
import { StatsLineComponent } from './components/stats-line/stats-line.component';
import { FoldableBlockComponent } from './components/foldable-block/foldable-block.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    HomeComponent,
    GameListComponent,
    SidePanelComponent,
    FilterFormComponent,
    MainPanelComponent,
    StatsGameSelectComponent,
    StatsDisplayComponent,
    StatsLineComponent,
    FoldableBlockComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
