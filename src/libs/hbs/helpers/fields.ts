import Reflection from "../../Reflection";

// Infers field type from value
export default {
  fieldType: function (...args: any[]): string {
    const [value] = Reflection.getArguments(args, ['value']);
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'object';
    return 'string';
  }
}

// Optionally, you can add more helpers for friendly names, etc.
