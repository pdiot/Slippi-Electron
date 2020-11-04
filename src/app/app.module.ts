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
import { CompareComponent } from './components/compare/compare.component';
import { StatsCompareDisplayComponent } from './components/stats-compare-display/stats-compare-display.component';
import { StatsDisplayBlockComponent } from './components/stats-display-block/stats-display-block.component';
import { MenuComponent } from './components/menu/menu.component';
import { GameLineComponent } from './components/game-line/game-line.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GraphsComponent } from './components/graphs/graphs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    FoldableBlockComponent,
    CompareComponent,
    StatsCompareDisplayComponent,
    StatsDisplayBlockComponent,
    MenuComponent,
    GameLineComponent,
    GraphsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgbModule,
    NgxChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
