
export default {
  neq: function (this: any, a: any, b: any): boolean {
    return a !== b;
  },
  eq: function (this: any, a: any, b: any): boolean {
    return a === b;
  },
  lt: function (this: any, a: any, b: any): boolean {
    return a < b;
  },
  lte: function (this: any, a: any, b: any): boolean {
    return a <= b;
  },
  gt: function (this: any, a: any, b: any): boolean {
    return a > b;
  },
  gte: function (this: any, a: any, b: any): boolean {
    return a >= b;
  },
  and: function (this: any, a: any, b: any): boolean {
    return a && b;
  },
  or: function (this: any, a: any, b: any): boolean {
    return a || b;
  }
}