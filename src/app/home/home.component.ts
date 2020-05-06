import { Component, OnInit } from '@angular/core';
/**
 * Component Home Inicio visual de la aplicacion
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {
/**
 * Texto presentacion
 *
 * @memberof HomeComponent
 */
  title = `Welcome to Biblioteca`;
 /**
  * Creates an instance of HomeComponent.
  * @memberof HomeComponent
  */
 constructor() { }

}
