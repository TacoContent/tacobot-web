import Reflection from "../../Reflection";

export default {
  neq: function (this: any, a: any, b: any): boolean {
    // const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a !== b;
  },
  eq: function (this: any, a: any, b: any): boolean {
    // const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a === b;
  },
  lt: function (this: any, a: any, b: any): boolean {
    // const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a < b;
  },
  lte: function (this: any, a: any, b: any): boolean {
    // const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a <= b;
  },
  gt: function (this: any, a: any, b: any): boolean {
    // const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a > b;
  },
  gte: function (this: any, a: any, b: any): boolean {
    // const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a >= b;
  },
  and: function (this: any, a: any, b: any): boolean {
    // const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a && b;
  },
  or: function (this: any, ...args: any[]): any {
    // const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    // return a || b;
    // find if any arg is truthy and return that value
    for (let i = 0; i < args.length; i++) {
      if (args[i]) {
        return args[i];
      }
    }
    return false;
  },
  not: function (this: any, a: any): boolean {
    // const [a] = Reflection.getArguments(args, ['a']);
    return !a;
  },
  in: function (this: any, a: any, b: any): boolean {
    return b.indexOf(a) > -1;
  },
  isNull: function (this: any, a: any): boolean {
    return a === null || a === undefined;
  },
  isNotNull: function (this: any, a: any): boolean {
    return a !== null && a !== undefined;
  }
}