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
// import { EditarlibroComponent } from './libro/editarlibro/editarlibro.component';
import { ListarComponent } from './libro/listar/listar.component';
import { AddautorComponent } from './autor/addautor/addautor.component';
import { ListarautoresComponent } from './autor/listarautores/listarautores.component';

import { BookService } from './services/book.service';
import { AuthorService } from './services/author.service';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { AuthenticationService } from './services/authentication.service';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UserService } from './services/user.service';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [
    AppComponent,
    AddlibroComponent,
 //   EditarlibroComponent,
    ListarComponent,
    AddautorComponent,
    ListarautoresComponent,
    LoginComponent,
    HomeComponent,
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
  providers: [BookService, AuthorService, UserService, CookieService, NgbActiveModal, NgForm, AuthInterceptorService, AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule {}
