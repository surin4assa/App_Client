import { AbstractControl, ValidatorFn } from "@angular/forms";

export class FormValidator {
  constructor(){}

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      const ctrl = control?.parent?.controls as any;
      return ctrl
        ? (control?.value === ctrl[matchTo].value) ? null : { isMatching: true}
        : null;
    }
  }

  isPasswordRepeat(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      const ctrl = control?.parent?.controls as any;
      return ctrl
        ? (control?.value === ctrl[matchTo].value) ? { isPasswordRepeat: true} : null
        : null;
    }
  }
}
