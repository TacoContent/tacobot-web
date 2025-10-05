import moment, { unix } from 'moment-timezone';
import Reflection from '../../Reflection';

export default {
  json: function (this: any, ...args: any[]): string {
    const [object] = Reflection.getArguments(args, ['object']);
    if (object === undefined) return 'undefined';
    if (object === null) return 'null';
    return JSON.stringify(object, null, 2).trim();
  },
  concat: function (this: any, ...args: any[]): string {
    //const [strings] = Reflection.getArguments(args, ['strings'], [[]]);
    if (!Array.isArray(args)) return 'ERROR - concat expects an array of strings';
    // slice off any trailing object with a hash property
    let filteredArgs = args.filter(arg => !(arg && typeof arg === 'object' && arg.hasOwnProperty('hash')));
    return (filteredArgs as string[]).join('');
  },
  asString: function (this: any, ...args: any[]): string {
    const [value] = Reflection.getArguments(args, ['value']);
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    return String(value);
  },
  truncate: function (this: any, ...args: any[]): string {
    const [value, length] = Reflection.getArguments(args, ['value', 'length'], ['', 100]);
    if (typeof value !== 'string') return '';
    if (value.length <= length) return value;
    return value.substring(0, length) + '...';
  }
}