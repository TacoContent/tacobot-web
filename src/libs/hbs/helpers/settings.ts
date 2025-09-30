import Reflection from "../../Reflection";

// Infers field type from value
export default {
  settingsGetMetadata: function (...args: any[]): any {
    const [key, metadata] = Reflection.getArguments(args, ['key', 'metadata'], [{}]);
    if (metadata && metadata[key]) {
      console.log('Found metadata for key', key, ':', metadata[key]);
      return metadata[key];
    }
    console.log('No metadata found for key', key);
    return null;
  },
  settingsHasMetadataKey: function (...args: any[]): boolean {
    const [key, metadata] = Reflection.getArguments(args, ['key', 'metadata'], [{}]);
    if (metadata && metadata[key] !== null && metadata[key] !== undefined) {
      return true;
    }
    return false;
  },
  settingMetadata: function (...args: any[]): any {
    const [key, metadata] = Reflection.getArguments(args, ['key', 'metadata'], [{}]);
    console.log('Metadata for key', key, ':', metadata);
    if (metadata && metadata[key] !== null && metadata[key] !== undefined) {
      console.log('Found metadata for key', key, ':', metadata[key]);
      return metadata[key];
    }
    console.log('No metadata found for key', key);
    return null;
  },
  settingFieldLabel: function (...args: any[]): any {
    const [key, metadata] = Reflection.getArguments(args, ['key', 'metadata'], [{}]);
    console.log('Getting label for key', key, 'with metadata:', metadata);
    if (metadata && metadata[key] && metadata[key].name) {
      return metadata[key].name;
    }
    if (!key) return '';
    // Fallback to key with capitalization and spaces
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  },
  settingFieldType: function (...args: any[]): string {
    const [key, value, metadata, type, force] = Reflection.getArguments(args, ['key', 'value', 'metadata', 'type', 'force']);
    let forceMetadataType = force === true;

    if (forceMetadataType) {
      if (metadata && metadata[key] && metadata[key].type) {
        return metadata[key].type;
      }
    }

    if (type) {
      return type;
    }

    if (value === null) {
      return 'null';
    }

    if (value === undefined) {
      return 'undefined';
    }

    if (Array.isArray(value)) {
      return 'array';
    }

    if (typeof value === 'object') {
      return 'object';
    }

    if (metadata && metadata[key] && metadata[key].type) {
      return metadata[key].type;
    }

    if (typeof value === 'boolean') {
      return 'boolean'; 
    }

    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'string') {
      return 'string';
    }

    if (typeof value === 'function') {
      return 'function';
    }

    console.log('Unknown type for key', key, ':', value);
    return 'json';
  }
}

// Optionally, you can add more helpers for friendly names, etc.
