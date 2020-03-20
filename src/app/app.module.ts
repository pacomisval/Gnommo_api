import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// import { NgbdModalComponent, NgbdModalContent } from "./modal-component";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, NgControl, NgForm, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AddlibroComponent } from './libro/addlibro/addlibro.component';
import { EditarlibroComponent } from './libro/editarlibro/editarlibro.component';
import { ListarComponent } from './libro/listar/listar.component';
import { AddautorComponent } from './autor/addautor/addautor.component';
import { ListarautoresComponent } from './autor/listarautores/listarautores.component';

import { BookService } from './services/book.service';
import { AuthorService } from './services/author.service';

@NgModule({
  declarations: [
    AppComponent,
    AddlibroComponent,
    EditarlibroComponent,
    ListarComponent,
    AddautorComponent,
    ListarautoresComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
  ],
  providers: [BookService, AuthorService, NgbActiveModal, NgForm, ],
  bootstrap: [AppComponent]
})
export class AppModule {}
