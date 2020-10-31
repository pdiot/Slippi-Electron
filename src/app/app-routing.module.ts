import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompareComponent } from './components/compare/compare.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path : '', component: HomeComponent},
  { path : 'compare', component: CompareComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
