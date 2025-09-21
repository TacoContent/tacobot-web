import moment, { unix } from 'moment-timezone';

export default {
  formatDate: function (this: any, date: string, format: string) {
    return moment.utc(date).format(format);
  },
  unixToDate: function (this: any, unixTimestamp: number, format: string) {
    return moment.utc(unixTimestamp * 1000).format(format);
  },
  unixFromNow: function (this: any, unixTimestamp: number): string {
    return moment.utc(unixTimestamp * 1000).fromNow();
  },
}