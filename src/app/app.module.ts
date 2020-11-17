import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadComponent } from './components/upload/upload.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterFormComponent } from './components/filter-form/filter-form.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { StatsGameSelectComponent } from './components/stats-game-select/stats-game-select.component';
import { StatsLineComponent } from './components/stats-line/stats-line.component';
import { FoldableBlockComponent } from './components/foldable-block/foldable-block.component';
import { StatsCompareDisplayComponent } from './components/stats-compare-display/stats-compare-display.component';
import { MenuComponent } from './components/menu/menu.component';
import { GameLineComponent } from './components/game-line/game-line.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatsDisplayReworkComponent } from './pages/stats-display-rework/stats-display-rework.component';
import { CompareComponent } from './pages/compare/compare.component';
import { GameListComponent } from './pages/game-list/game-list.component';
import { HomeComponent } from './pages/home/home.component';
import { GraphsComponent } from './pages/graphs/graphs.component';
import { AppTourComponent } from './components/app-tour/app-tour.component';

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
    StatsLineComponent,
    FoldableBlockComponent,
    CompareComponent,
    StatsCompareDisplayComponent,
    MenuComponent,
    GameLineComponent,
    GraphsComponent,
    StatsDisplayReworkComponent,
    AppTourComponent,
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
