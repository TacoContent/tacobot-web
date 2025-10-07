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
  },
  lowercase: function (this: any, ...args: any[]): string {
    const [value] = Reflection.getArguments(args, ['value'], ['']);
    if (typeof value !== 'string') return '';
    return value.toLowerCase();
  },
  uppercase: function (this: any, ...args: any[]): string {
    const [value] = Reflection.getArguments(args, ['value'], ['']);
    if (typeof value !== 'string') return '';
    return value.toUpperCase();
  },
  jsonPretty: function (this: any, ...args: any[]): string {
    const [value] = Reflection.getArguments(args, ['value']);
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    console.log("jsonPretty value:", value);
    return JSON.stringify(value, null, 2).trim();
  },
  pythonObject: function (this: any, ...args: any[]): any {
    const [value] = Reflection.getArguments(args, ['value'], ['']);
    if (typeof value !== 'string') return JSON.stringify(value, null, 2).trim();
    const fixed = value.replace(/'/g, '"').replace(/(None)([,\s])/g, 'null$2').replace(/(True)([,\s])/g, 'true$2').replace(/(False)([,\s])/g, 'false$2');
    try {
      const r = JSON.parse(fixed);
      console.log("pythonObject parsed value:", r);
      return JSON.stringify(r, null, 2).trim();
    } catch (e) {
      console.error("pythonObject parse error:", e);
      console.log("pythonObject returning original value:", fixed);
      return value;
    }
  }
}