
export default class Reflection {
  static getCallingMethodName(): string {
    const error = new Error();
    const stack = error.stack ? error.stack.split('\n') : [];
    // Extract the second line of the stack trace (the caller)
    const callerLine = stack && stack.length > 2 ? stack[2] : '';
    if (callerLine) {
      const match = callerLine.match(/at (\w+)/);
      return match ? match[1] : 'unknown';
    }
    return 'unknown';
  }

  static getArguments(args: any[], keys: string[], defaultValues?: any[]): any[] {

    // find any item in the args array that is an object with a hash property
    // if found, treat it as named arguments
    // otherwise, treat args as positional arguments
    // return values in the order of keys array
    // if a key is not found in named arguments, return undefined for that key
    // if positional arguments are used, return them in order, and if there are fewer args than keys, return undefined for missing keys

    const namedArgs = args.filter(arg => arg && typeof arg === 'object' && arg.hasOwnProperty('hash'));
    const positionalArgs = args.filter(arg => !arg || typeof arg !== 'object' || !arg.hasOwnProperty('hash'));

    // turn the positionalArgs into an object of named args
    const positionalHash = Object.fromEntries(positionalArgs.map((arg, index) => [keys[index], arg]));
    const namedHash = namedArgs.length > 0 ? namedArgs[0].hash : {};

    return keys.map(key => {
      if (namedHash.hasOwnProperty(key)) {
        return namedHash[key];
      } else if (positionalHash.hasOwnProperty(key)) {
        return positionalHash[key];
      } else {
        if (defaultValues) {
          const index = keys.indexOf(key);
          return index >= 0 && index < defaultValues.length ? defaultValues[index] : undefined;
        } else {
          return undefined;
        }
      }
    });
  }
}