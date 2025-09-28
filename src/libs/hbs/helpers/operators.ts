import Reflection from "../../Reflection";

export default {
  neq: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a !== b;
  },
  eq: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a === b;
  },
  lt: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a < b;
  },
  lte: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a <= b;
  },
  gt: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a > b;
  },
  gte: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a >= b;
  },
  and: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a && b;
  },
  or: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return a || b;
  },
  not: function (this: any, ...args: any[]): boolean {
    const [a] = Reflection.getArguments(args, ['a']);
    return !a;
  },
  in: function (this: any, ...args: any[]): boolean {
    const [a, b] = Reflection.getArguments(args, ['a', 'b']);
    return b.indexOf(a) > -1;
  }
}