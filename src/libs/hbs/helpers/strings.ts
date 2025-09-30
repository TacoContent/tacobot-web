import moment, { unix } from 'moment-timezone';
import Reflection from '../../Reflection';

export default {
  json: function (this: any, ...args: any[]): string {
    const [object] = Reflection.getArguments(args, ['object']);
    return JSON.stringify(object, null, 2).trim();
  },
  concat: function (this: any, ...args: any[]): string {
    //const [strings] = Reflection.getArguments(args, ['strings'], [[]]);
    if (!Array.isArray(args)) return 'ERROR - concat expects an array of strings';
    // slice off any trailing object with a hash property
    let filteredArgs = args.filter(arg => !(arg && typeof arg === 'object' && arg.hasOwnProperty('hash')));
    return (filteredArgs as string[]).join('');
  }
}