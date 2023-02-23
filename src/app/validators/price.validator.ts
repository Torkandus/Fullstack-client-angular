import { AbstractControl } from '@angular/forms';
export function ValidatePrice(
  control: AbstractControl
): { invalidPrice: boolean } | null {
  const PRICE_REGEXP = /^\d+(\.\d{1,2})?$/i;
  return !PRICE_REGEXP.test(control.value) ? { invalidPrice: true } : null;
} // ValidatePrice
