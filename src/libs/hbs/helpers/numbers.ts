import moment, { unix } from 'moment-timezone';
import Reflection from '../../Reflection';

export default {
  formatNumber: function (
    this: any, 
    ... args: any[]
    // number: number, 
    // locals: string | string[] | undefined = 'en-US', 
    // options: Intl.NumberFormatOptions = {
    //   minimumFractionDigits: 0,
    //   maximumFractionDigits: 0,
    //   style: 'decimal',
    // }
  ): string {
    const [number, locals, options] = Reflection.getArguments(args, ['number', 'locals', 'options'], [0, 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      style: 'decimal',
    }]);
    return new Intl.NumberFormat(locals, options).format(number);
  },
  padNumber: function (this: any, ...args: any[]): string {
    const [number, length] = Reflection.getArguments(args, ['number', 'length'], [0, 2]);
    return new Intl.NumberFormat('en-US', {
      minimumIntegerDigits: length,
      useGrouping: false,
    }).format(number);
  },
  length: function (this: any, ...args: any[]): number {
    const [list] = Reflection.getArguments(args, ['list']);
    return list ? list.length : 0;
  }
}