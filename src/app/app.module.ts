import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { HeaderInterceptor } from './header.interceptor';
// import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, NgControl, NgForm, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

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
import { HeaderInterceptor } from './header.interceptor';
import { CookieService } from 'ngx-cookie-service';
import { UploadService } from './services/upload.service';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule} from 'ngx-bootstrap/dropdown';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SortPipe } from './pipes/sort.pipe';
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
    SortPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    BrowserAnimationsModule,
  ],
  providers: [
    BookService,
    AuthorService,
    UserService,
    CookieService,
    NgbActiveModal,
    NgForm,
    AuthInterceptorService,
    AuthenticationService,
    UploadService,
    {
    provide: HTTP_INTERCEPTORS,
    useClass: HeaderInterceptor,
    multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
