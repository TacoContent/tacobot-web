import { join } from "path";
import Reflection from "../../Reflection";

export default {
  asArray: function (this: any, ...args: any[]): any[] {
    const [value] = Reflection.getArguments(args, ['value']);
    
    return Array.isArray(value) ? value : [value];
  },

  join: function (this: any, ...args: any[]): string {
    const [arr, separator = ','] = Reflection.getArguments(args, ['arr', 'separator']);
    
    if (!Array.isArray(arr)) {
      return '';
    }
    return arr.join(separator);
  },
  getAt: function (this: any, ...args: any[]): any {
    const [arr, index] = Reflection.getArguments(args, ['arr', 'index']);
    
    if (!Array.isArray(arr)) {
      return undefined;
    }
    return arr[index];
  }

  
}