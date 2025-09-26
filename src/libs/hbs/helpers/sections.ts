
export default {
  section: function (this: any, name: string, context: any): null {
    if (!this._sections) {
      this._sections = {};
    }

    if (!this._sections[name]) {
      this._sections[name] = [];
    }
    this._sections[name].push(context.fn(this));
    return null;
  },
  block: function (this: any, name: string): string {
    if (!this._sections) {
      this._sections = {};
    }
    const val = (this._sections[name] || []).join('\n');
    this._sections[name] = [];
    return val;
  }
};