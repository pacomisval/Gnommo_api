import { Injectable } from '@angular/core';

/**
 * Guarda variables globales
 *
 * @export
 * @class Globals
 */
@Injectable()

export class Globals {


  /**
   * ruta del servidor
   *
   * @static
   * @memberof Globals
   */
  static apiUrl = `http://localhost:8000/api`;
  /**
   * Ruta imagenes libros
   * modificar para cada ordenador
   */
  static imagenBookURL = '/assets/images/book/';
}
