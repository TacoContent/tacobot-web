import Reflection from "../../Reflection";

export default {
  section: function (this: any, ...args: any[]): null {
    const [name, context] = Reflection.getArguments(args, ['name', 'context']);
    if (!this._sections) {
      this._sections = {};
    }

    if (!this._sections[name]) {
      this._sections[name] = [];
    }
    this._sections[name].push(context.fn(this));
    return null;
  },
  block: function (this: any, ...args: any[]): string {
    const [name] = Reflection.getArguments(args, ['name']);
    if (!this._sections) {
      this._sections = {};
    }
    const val = (this._sections[name] || []).join('\n');
    this._sections[name] = [];
    return val;
  }
};