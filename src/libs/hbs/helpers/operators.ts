
export default {
  notEq: function (this: any, a: any, b: any): boolean {
    return a !== b;
  },
  eq: function (this: any, a: any, b: any): boolean {
    return a === b;
  },
  xif: function (this: any, v1: any, operator: string, v2: any, context: any) {
    switch (operator) {
      case '==':
        return (v1 == v2) ? context.fn(this) : context.inverse(this);
      case '===':
        return (v1 === v2) ? context.fn(this) : context.inverse(this);
      case '!=':
        return (v1 != v2) ? context.fn(this) : context.inverse(this);
      case '!==':
        return (v1 !== v2) ? context.fn(this) : context.inverse(this);
      case '<':
        return (v1 < v2) ? context.fn(this) : context.inverse(this);
      case '<=':
        return (v1 <= v2) ? context.fn(this) : context.inverse(this);
      case '>':
        return (v1 > v2) ? context.fn(this) : context.inverse(this);
      case '>=':
        return (v1 >= v2) ? context.fn(this) : context.inverse(this);
      case '&&':
        return (v1 && v2) ? context.fn(this) : context.inverse(this);
      case '||':
        return (v1 || v2) ? context.fn(this) : context.inverse(this);
      default:
        return context.inverse(this);
    }
  }
}