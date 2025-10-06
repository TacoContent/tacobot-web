import { flatten } from "mathjs";

export default {
  flattenObject: function (this: any, ...args: any[]): any[] {
    const [obj] = args;
    return flatten(obj);
  }
}