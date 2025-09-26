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
  isToday: function (this: any, month: number, day: number): boolean {
    const now = moment(); // use local time instead of utc here
    return now.month() + 1 === month && now.date() === day;
  },
  thisYear: function (this: any): number {
    return moment().year();
  },
  until: function (this: any, month: number, day: number): string {
    const now = moment();
    // calculate the number of days until the next occurrence of month/day
    let thisYear = moment({ year: now.year(), month: month - 1, day: day });
    if (thisYear.isBefore(now, 'day')) {
      thisYear.add(1, 'year');
    }
    return thisYear.from(now);
  },
  within: function (this: any, timeframe: number, unit: string, month: number, day: number): boolean {
    const now = moment();
    let targetDate = moment({ year: now.year(), month: month - 1, day: day });
    if (targetDate.isBefore(now, 'day')) {
      targetDate.add(1, 'year');
    }
    const diff = targetDate.diff(now, unit as moment.unitOfTime.Diff);
    return diff <= timeframe;
  } 
}