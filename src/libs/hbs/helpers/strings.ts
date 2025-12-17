import moment, { unix } from 'moment-timezone';
import Reflection from '../../Reflection';

export default {
  substr: function (this: any, ...args: any[]): string {
    const [value, start, length] = Reflection.getArguments(args, ['value', 'start', 'length'], ['', 0, undefined]);
    // support negative start like: substr(value, -5)
    // and negative length like: substr(value, 0, -3)
    // example: substr("Hello, world!", -6, 5) => "world"

    if (typeof value !== 'string') return '';
    let actualStart = start;
    if (start < 0) {
      actualStart = value.length + start;
      if (actualStart < 0) actualStart = 0;
    }
    if (length === undefined) {
      return value.substring(actualStart);
    } else {
      let actualLength = length;
      if (length < 0) {
        actualLength = value.length - actualStart + length;
        if (actualLength < 0) actualLength = 0;
      }
      return value.substring(actualStart, actualStart + actualLength);
    }
  },
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
  stripIndent: function (this: any, ...args: any[]): string {
    const [value] = Reflection.getArguments(args, ['value']);
    if (value === undefined) return '';
    // ensure we have a string
    let text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    // split into lines
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    // remove leading/trailing blank lines
    while (lines.length && lines[0].trim() === '') lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    // find minimum indentation (spaces or tabs) among non-empty lines
    let minIndent: number | null = null;
    for (const line of lines) {
      if (line.trim() === '') continue;
      const match = line.match(/^[ \t]*/);
      const indentLen = match ? match[0].length : 0;
      if (minIndent === null || indentLen < minIndent) minIndent = indentLen;
    }

    if (minIndent && minIndent > 0) {
      for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].slice(minIndent);
      }
    }
    return lines.join('\n');
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
  },
  plural: function (this: any, ...args: any[]): string {
    const [count, singular, plural] = Reflection.getArguments(args, ['count', 'singular', 'plural'], [0, '', '']);
    if (typeof count !== 'number') return '';
    if (typeof singular !== 'string' || typeof plural !== 'string') return '';
    return count === 1 ? singular : plural;
  },
  split: function (this: any, ...args: any[]): string[] {
    const [value, separator] = Reflection.getArguments(args, ['value', 'separator'], ['', ',']);
    if (typeof value !== 'string') return [];
    if (typeof separator !== 'string') return [value];
    return value.split(separator);
  },

}