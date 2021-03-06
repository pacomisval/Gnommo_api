import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
 import { ListarComponent } from './libro/listar/listar.component';
import { ListarautoresComponent } from './autor/listarautores/listarautores.component';
import { AddautorComponent} from './autor/addautor/addautor.component';
import { AddlibroComponent } from './libro/addlibro/addlibro.component';


const routes: Routes = [
  { path: 'listar', component: ListarComponent },
  { path: '', redirectTo: 'listar', pathMatch: 'full' },
  { path: 'listarAutores', component: ListarautoresComponent },
  { path: 'listarAutores/:id', component: ListarautoresComponent },
  { path: 'agregarAutores', component: AddautorComponent },
  { path: 'agregarLibro', component: AddlibroComponent },
]; 


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
