import { FormGroup, Validator, FormControl } from '@angular/forms';

/**
 * Verificar que dos campos coincidan
 *
 * @export
 * @param {string} controlName Campo principal
 * @param {string} matchingControlName Campo a comparar
 * @returns
 */
export function MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }
        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
}

export class FileValidator implements Validator {
  static validate(c: FormControl): {[key: string]: any} {
      return c.value == null || c.value.length == 0 ? { "required" : true} : null;
  }

  validate(c: FormControl): {[key: string]: any} {
      return FileValidator.validate(c);
  }
}
