import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImageStatusComponent } from './component/image-status/image-status.component';
import { BuildCustomImageComponent } from './component/build-custom-image/build-custom-image.component';


const routes: Routes = [
  {
    path: '',
    component: ImageStatusComponent,
    data: { title: 'AWB-HPE' } 
  }, {
    path: 'custom',
    component: BuildCustomImageComponent
  },{
    path: 'index', redirectTo: '', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
