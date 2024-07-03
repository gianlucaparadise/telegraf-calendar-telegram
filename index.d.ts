declare module 'telegraf-calendar-telegram' {
  import { Telegraf, Context } from 'telegraf';

  class Calendar {
    constructor(bot: Telegraf, options?: any);

    bot: Telegraf;
    helper: CalendarHelper;

    getCalendar(date?: Date): any;

    setDateListener(onDateSelected: (context: Context, date: string) => void): void;

    setMinDate(date: Date): this;

    setMaxDate(date: Date): this;

    setWeekDayNames(names: string[]): this;

    setMonthNames(names: string[]): this;

    setStartWeekDay(startDay: number): this;
  }

  class CalendarHelper {
    constructor(options?: any);

    getCalendarMarkup(date: Date): any;

    setMinDate(date: Date): void;

    setMaxDate(date: Date): void;

    setWeekDayNames(names: string[]): void;

    setMonthNames(names: string[]): void;

    setStartWeekDay(startDay: number): void;
  }

  export = Calendar;
}
