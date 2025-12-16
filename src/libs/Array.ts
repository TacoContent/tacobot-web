export default class ArrayUtility { 
  static wrap(value: any): any[] { 
    return value instanceof Array ? value : [value]; 
  }

  static join(arr: any[], separator: string = ','): string {
    return arr.join(separator);
  }
}