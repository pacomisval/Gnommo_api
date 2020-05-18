import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListarComponent } from './libro/listar/listar.component';
import { ListarautoresComponent } from './autor/listarautores/listarautores.component';
import { AddautorComponent } from './autor/addautor/addautor.component';
import { AddlibroComponent } from './libro/addlibro/addlibro.component';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';


const routes: Routes = [ //FIXME ARREGLAR NOMBRE RUTAS
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent},
  { path: 'libros', component: ListarComponent },

  { path: 'agregarAutores', component: AddautorComponent },
  { path: 'autores', component: ListarautoresComponent },
  { path: 'listarAutores/:id', component: ListarautoresComponent },

  { path: 'addAutor', component: AddautorComponent , canActivate: [AuthGuard]},
  { path: 'addLibro', component: AddlibroComponent, canActivate: [AuthGuard] },

  { path: 'login', component: LoginComponent },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],

exports: [RouterModule]
})
export class AppRoutingModule { }
