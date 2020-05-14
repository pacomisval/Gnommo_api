import { FormGroup } from '@angular/forms';

/**
 * Comprobacion longitud de un campo
 *
 * @export
 * @param {string} texto Variable a comprobar
 * @param {number} maximo Longitud maxima
 * @param {string} campo Nombre del campo
 * @returns mensaje afirmativo
 */
export function checkLengthString(texto: string, maximo: number, campo: string) {
  let message = '';
  if (texto.length > maximo) {
    message = 'Has superado el límite de carácteres máximos en el campo: ' + campo;
  }
  return message;
}
/**
 * Comprobar que solo se permiten letras
 *
 * @export
 * @param {*} valor
 * @returns
 */
export function comprobarLetras(valor) {

  const letras: RegExp = /^[A-Za-z]+$/;
  let message = '';

  if (letras.test(valor) == false) {
    message = '-En el campo genero solo se permiten letras';

  }
  return message;
}

export function checkFile(file: File) {
  if (file.type.match(/image\/*/) == null) {
    return true;
  }
}
export function checkIsbnFormat(texto: string) {
  let message = '';
  const reg: RegExp = /^[0-9-]+$/;
  if (reg.test(texto) == false) {
    message = 'Asegurese de estar introduciendo un formato correcto en el ISBN ';
  }
  return message;
}
// export function comprobacionFinal(resultados) {
//   let mtitulo = true;
//   let misbn = true;
//   let reg: RegExp = /^[0-9-a-zA-Z]+$/;

//   if (this.book.title.length > 50) {
//     this.message = 'Has superado el límite de carácteres máximos en el campo titulo \n';
//     mtitulo = false;
//   }

//   if (this.book.isbn.length > 15) {
//     this.message = 'Has superado el límite de carácteres máximos en el campo isbn \n';
//     misbn = false;
//   } else if (reg.test(this.book.isbn) == false) {
//     this.message = 'Asegurese de estar introduciendo un ISBN correcto \n';
//     misbn = false;
//   }

//   if (res && misbn && mtitulo) {
//     localStorage.setItem('comprobar', 'bien');
//   } else {
//     this.openInformationWindows();
//     localStorage.setItem('comprobar', 'mal');
//   }

//  }
