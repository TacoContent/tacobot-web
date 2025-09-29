import moment, { unix } from 'moment-timezone';
import Reflection from '../../Reflection';

export default {
  json: function (this: any, ...args: any[]): string {
    const [object] = Reflection.getArguments(args, ['object']);
    return JSON.stringify(object, null, 2);
  }
}