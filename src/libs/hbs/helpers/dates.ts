import moment, { isDate, unix } from 'moment-timezone';
import Reflection from '../../Reflection';

function isTimestampInSeconds(timestamp: number): boolean {
  // is there a mathematical way to determine if a timestamp is in seconds or milliseconds?
  return timestamp < 10000000000;
  // return timestamp.toString().length === 10;
}

function convertTS(timestamp: number): number {
  // if the timestamp is in seconds, convert to ms
  // python sends timestamps in seconds, while js uses milliseconds
  if (isTimestampInSeconds(timestamp)) {
    return timestamp * 1000;
  }
  return timestamp;
}

export default {
  isValidDate: function (this: any, ...args: any[]): boolean {
    const [date] = Reflection.getArguments(args, ['date']);
    return moment(date, false).isValid();
  },
  formatDate: function (this: any, ...args: any[]) {
    const [date, format] = Reflection.getArguments(args, ['date', 'format']);
    // check if we need to take the d
    return moment.utc(date).format(format);
  },
  unixToDate: function (this: any, ...args: any[]) {
    const [timestamp, format] = Reflection.getArguments(args, ['timestamp', 'format']);
    return moment.utc(convertTS(timestamp)).format(format);
  },
  unixFromNow: function (this: any, ...args: any[]): string {
    const [timestamp] = Reflection.getArguments(args, ['timestamp']);
    return moment.utc(convertTS(timestamp)).fromNow();
  },
  unixIsAfter: function (this: any, ...args: any[]): boolean {
    const [timestamp] = Reflection.getArguments(args, ['timestamp']);
    const now = moment.utc(); // use local time instead of utc here
    return now.isAfter(moment.utc(convertTS(timestamp)));
  },
  isToday: function (this: any, ...args: any[]): boolean {
    const [month, day, year] = Reflection.getArguments(args, ['month', 'day', 'year'], [1, 1, moment().year()]);
    const now = moment(); // use local time instead of utc here
    return now.month() + 1 === month && now.date() === day && (now.year() === year || !year);
  },
  isAfter: function (this: any, ...args: any[]): boolean {
    const [month, day, year] = Reflection.getArguments(args, ['month', 'day', 'year'], [1, 1, moment().year()]);
    const now = moment.utc(); // use local time instead of utc here
    return now.isAfter(moment.utc({ year, month: month - 1, day }));
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