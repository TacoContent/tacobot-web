import moment, { unix } from 'moment-timezone';
import Reflection from '../../Reflection';

export default {
  formatDate: function (this: any, ...args: any[]) {
    const [date, format] = Reflection.getArguments(args, ['date', 'format']);
    return moment.utc(date).format(format);
  },
  unixToDate: function (this: any, ...args: any[]) {
    const [timestamp, format] = Reflection.getArguments(args, ['timestamp', 'format']);
    return moment.utc(timestamp * 1000).format(format);
  },
  unixFromNow: function (this: any, ...args: any[]): string {
    const [timestamp] = Reflection.getArguments(args, ['timestamp']);
    return moment.utc(timestamp * 1000).fromNow();
  },
  isToday: function (this: any, ...args: any[]): boolean {
    const [month, day] = Reflection.getArguments(args, ['month', 'day'], [1, 1]);
    const now = moment(); // use local time instead of utc here
    return now.month() + 1 === month && now.date() === day;
  },
  thisYear: function (this: any): number {
    return moment().year();
  },
  until: function (this: any, ...args: any[]): string {
    const [month, day] = Reflection.getArguments(args, ['month', 'day'], [1, 1]);
    const now = moment();
    // calculate the number of days until the next occurrence of month/day
    let thisYear = moment({ year: now.year(), month: month - 1, day: day });
    if (thisYear.isBefore(now, 'day')) {
      thisYear.add(1, 'year');
    }

    return thisYear.from(now);
  },
  within: function (this: any, ...args: any[]): boolean {
    const [timeframe, unit, month, day] = Reflection.getArguments(args, ['timeframe', 'unit', 'month', 'day'], [0, 'days', 1, 1]);
    const now = moment();
    let targetDate = moment({ year: now.year(), month: month - 1, day: day });
    if (targetDate.isBefore(now, 'day')) {
      targetDate.add(1, 'year');
    }
    if (!timeframe || timeframe <= 0) return false;
    const diff = targetDate.diff(now, unit as moment.unitOfTime.Diff);
    return diff <= timeframe;
  } 
}