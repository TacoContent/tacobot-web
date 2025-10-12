import Reflection from "../../Reflection";

export default {
  asArray: function (this: any, ...args: any[]): any[] {
    const [value] = Reflection.getArguments(args, ['value']);
    
    return Array.isArray(value) ? value : [value];
  }
}