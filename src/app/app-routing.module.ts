import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompareComponent } from './pages/compare/compare.component';
import { GraphsComponent } from './pages/graphs/graphs.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path : '', component: HomeComponent},
  { path : 'compare', component: CompareComponent},
  { path : 'graphs', component: GraphsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
