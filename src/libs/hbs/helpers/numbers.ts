import moment, { unix } from 'moment-timezone';

export default {
  formatNumber: function (
    this: any, 
    number: number, 
    locals: string | string[] | undefined = 'en-US', 
    options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      style: 'decimal',
    }
  ): string {
    return new Intl.NumberFormat(locals, options).format(number);
  }
}