import Reflection from "../../Reflection";

function _flattenObject(input: any): any[] {
  if (input === undefined) return [];
  if (input === null) return [];
  const result = [];
  if (typeof input === 'object') {
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        result.push(...input[key]);
      }
    }
  } else {
    result.push(input);
  }
  return result;
}

export default {
  flattenObject: function (this: any, ...args: any[]): any[] {
    // flatten an object or array of objects into a single-level array
    const [input] = Reflection.getArguments(args, ['input']);
    return _flattenObject(input);
  }
}