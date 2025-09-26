export default {
  /**
   * Formats a UUID string according to the specified format.
   * 
   * Supported format options:
   * - 'l' or 'lower': Convert to lowercase.
   * - 'u' or 'upper': Convert to uppercase.
   * - '+b' or 'braces': Add braces around the UUID.
   * - '-b', 'braceless', or 'no-braces': Remove braces from the UUID.
   * - '-d', 'dashless', or 'no-dashes': Remove dashes from the UUID.
   * - '+d' or 'dashes': Add dashes to a 32-character UUID.
   * - 's' or 'short': Return the first 8 characters of the UUID without dashes.
   **/
  uuidFormat: function (this: any, uuid: string, format: string) {
    if (!uuid) return '';
    const formats = format.split(' ');
    for (const fmt of formats) {
      switch (fmt) {
        case 'l':
        case 'lower':
          uuid = uuid.toLowerCase();
          break;
        case 'u':
        case 'upper':
          uuid = uuid.toUpperCase();
          break;
        case '+b':
        case 'braces':
          if (!uuid.startsWith('{')) {
            uuid = '{' + uuid;
          }
          if (!uuid.endsWith('}')) {
            uuid = uuid + '}';
          }
          break;
        case '-b':
        case 'braceless':
        case 'no-braces':
          uuid = uuid.replace(/^\{/, '').replace(/\}$/, '');
          break;
        case '-d':
        case 'dashless':
        case 'no-dashes':
          uuid = uuid.replace(/-/g, '');
          break;
        case '+d':
        case 'dashes':
          if (uuid.length === 32) {
            uuid = uuid.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
            break;
          }
          break;
        case "s":
        case 'short':
          uuid = uuid.replace(/-/g, '').substring(0, 8)
          break;
        default:
          break;
      }
    }
    return uuid;
  }
}