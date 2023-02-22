const CalendarHelper = require('.');

jest.mock('telegraf', () => ({
  Markup: {
    button: {
      callback: (text, callback_data) => ({ text, callback_data }),
    },
  },
}));

const isFillerButton = (btn, prefixAndIndex) => {
  return (
    btn.text === ' ' &&
    btn.callback_data === `calendar-telegram-ignore-filler-${prefixAndIndex}`
  );
};

describe('Calendar Helper', () => {
  describe('constructor and setters tests', () => {
    it('should parse basic options correctly', () => {
      const minDate = new Date('2020-02-03');
      const maxDate = new Date('2020-11-12');

      const options = {
        startWeekDay: 3,
        weekDayNames: ['A', 'B', 'C'],
        monthNames: ['D', 'E', 'F'],
        minDate: minDate,
        maxDate: maxDate,
        ignoreWeekDays: [2],
        hideIgnoredWeeks: true,
        shortcutButtons: [{ label: 'Today', action: 'ping' }],
      };
      const helper = new CalendarHelper(options);

      expect(helper.options).toBeTruthy();
      expect(helper.options.startWeekDay).toBe(options.startWeekDay);
      expect(helper.options.weekDayNames).toBe(options.weekDayNames);
      expect(helper.options.monthNames).toBe(options.monthNames);
      expect(helper.options.minDate).toBe(options.minDate);
      expect(helper.options.maxDate).toBe(options.maxDate);
      expect(helper.options.ignoreWeekDays).toBe(options.ignoreWeekDays);
      expect(helper.options.hideIgnoredWeeks).toBe(options.hideIgnoredWeeks);

      expect(helper.options.shortcutButtons).toHaveLength(1);
      expect(helper.options.shortcutButtons[0].action).toBe('ping');
    });

    it('should check valid min date', () => {
      const maxDate = new Date('2020-11-12');
      const helper = new CalendarHelper({
        maxDate: maxDate,
      });

      const validMinDate = new Date('2020-02-03');
      helper.setMinDate(validMinDate);
      expect(helper.options.minDate).toBe(validMinDate);

      const invalidMinDate = new Date('2021-02-03');
      expect(() => helper.setMinDate(invalidMinDate)).toThrow();
    });

    it('should check valid max date', () => {
      const minDate = new Date('2020-02-03');
      const helper = new CalendarHelper({
        minDate: minDate,
      });

      const validMaxDate = new Date('2020-11-12');
      helper.setMaxDate(validMaxDate);
      expect(helper.options.maxDate).toBe(validMaxDate);

      const invalidMaxDate = new Date('2020-01-12');
      expect(() => helper.setMaxDate(invalidMaxDate)).toThrow();
    });
  });

  describe('builders tests', () => {
    it('should add shortcut buttons to on top of the page', () => {
      const options = {
        shortcutButtons: [{ label: 'Today', action: 'ping' }],
      };
      const helper = new CalendarHelper(options);

      const page = [];
      helper.addShortcutButtons(page);

      expect(page).toHaveLength(1);

      const firstRow = page[0];
      expect(firstRow).toHaveLength(1);

      {
        const firstShortcutButton = firstRow[0];
        expect(firstShortcutButton.text).toBe('Today');
        expect(firstShortcutButton.callback_data).toBe('ping');
      }
    });

    it('should build filler row', () => {
      const fillerRow = CalendarHelper.buildFillerRow('prefix-');
      expect(fillerRow).toHaveLength(7);

      {
        const secondDay = fillerRow[1];
        expect(isFillerButton(secondDay, 'prefix-1')).toBe(true);
      }
    });

    it('should build header with two navigators', () => {
      const headerOptions = {
        startWeekDay: 1,
        weekDayNames: ['L', 'M', 'M', 'G', 'V', 'S', 'D'],
        monthNames: [
          'Gen',
          'Feb',
          'Mar',
          'Apr',
          'Mag',
          'Giu',
          'Lug',
          'Ago',
          'Set',
          'Ott',
          'Nov',
          'Dic',
        ],
      };
      const helper = new CalendarHelper(headerOptions);
      const page = [];
      const date = new Date('2023-01-01');

      helper.addHeader(page, date);

      expect(page).toHaveLength(2);

      {
        const firstRow = page[0]; // Month name row, with navigators
        expect(firstRow).toHaveLength(3);
        expect(firstRow[0].text).toBe('<');
        expect(firstRow[0].callback_data).toBe(
          'calendar-telegram-prev-2023-01-01'
        );
        expect(firstRow[1].text).toBe('Gen 2023');
        expect(firstRow[1].callback_data).toBe(
          'calendar-telegram-ignore-monthname'
        );
        expect(firstRow[2].text).toBe('>');
        expect(firstRow[2].callback_data).toBe(
          'calendar-telegram-next-2023-01-01'
        );
      }

      {
        const secondRow = page[1]; // Weekday names row
        expect(secondRow).toHaveLength(7);
        expect(secondRow[2].text).toBe('M');
        expect(secondRow[2].callback_data).toBe(
          'calendar-telegram-ignore-weekday2'
        );
      }
    });

    it('should build header on min and max month', () => {
      const minMaxMonthOptions = {
        minDate: new Date('2023-02-06'),
        maxDate: new Date('2023-02-27'),
      };
      const helper = new CalendarHelper(minMaxMonthOptions);
      const page = [];
      const date = new Date('2023-02-20');

      helper.addHeader(page, date);

      expect(page).toHaveLength(2);

      {
        const firstRow = page[0]; // Month name row, with navigators
        expect(firstRow).toHaveLength(3);
        expect(firstRow[0].text).toBe(' ');
        expect(firstRow[0].callback_data).toBe(
          'calendar-telegram-ignore-minmonth'
        );
        expect(firstRow[1].text).toBe('Feb 2023');
        expect(firstRow[1].callback_data).toBe(
          'calendar-telegram-ignore-monthname'
        );
        expect(firstRow[2].text).toBe(' ');
        expect(firstRow[2].callback_data).toBe(
          'calendar-telegram-ignore-maxmonth'
        );
      }
    });

    it('should build days page', () => {
      const minMaxMonthOptions = {
        ignoreWeekDays: [0],
        minDate: new Date('2023-02-05'),
        maxDate: new Date('2023-02-25'),
      };
      const helper = new CalendarHelper(minMaxMonthOptions);
      const page = [];
      const date = new Date('2023-02-20');

      helper.addDays(page, date);

      expect(page).toHaveLength(5);

      // February 2023 starts on wednesday and ends on tuesday
      // And in helper options startWeekDay is Monday
      {
        const firstRow = page[0];
        expect(firstRow).toHaveLength(7);
        expect(isFillerButton(firstRow[0], 'firstRow-0')).toBe(true);
        expect(firstRow[6].callback_data).toBe(
          'calendar-telegram-ignore-2023-02-04'
        );
      }
      {
        const secondRow = page[1];
        expect(secondRow).toHaveLength(7);
        // Sundays are ignored because ignoreWeekDays is 0
        expect(secondRow[0].callback_data).toBe(
          'calendar-telegram-ignore-2023-02-05'
        );
        expect(secondRow[1].text).toBe('6');
        expect(secondRow[1].callback_data).toBe(
          'calendar-telegram-date-2023-02-06'
        );
      }
      {
        const lastRow = page[4];
        expect(lastRow).toHaveLength(7);
        expect(lastRow[0].callback_data).toBe(
          'calendar-telegram-ignore-2023-02-26'
        );
        expect(isFillerButton(lastRow[6], 'lastRow-6')).toBe(true);
      }
    });

    it('should build a page', () => {
      // TODO
      const options = {
        minDate: new Date('2023-02-02'),
        maxDate: new Date('2023-03-14'),
        shortcutButtons: [{ label: 'Today', action: 'ping' }],
      };
      const helper = new CalendarHelper(options);
      const inputDate = new Date('2023-02-20');

      const page = helper.getPage(inputDate);

      // 1 row for shortcut buttons + 2 rows for header + 5 rows for days
      expect(page).toHaveLength(8);

      {
        // Checking shortcut buttons row
        const firstRow = page[0];
        expect(firstRow).toHaveLength(1);
        expect(firstRow[0].text).toBe('Today');
      }
      {
        // Checking header rows
        const secondRow = page[1];
        expect(secondRow).toHaveLength(3);
        expect(secondRow[1].text).toBe('Feb 2023');
      }
      {
        // Checking days rows
        const lastRow = page[7];
        expect(lastRow).toHaveLength(7);
        expect(lastRow[0].text).toBe('26');
      }
    });
  });

  describe('date helpers tests', () => {
    it('should normalize weekday', () => {
      const monday = 1;
      const helper = new CalendarHelper({
        startWeekDay: monday,
      });

      const sunday = 0;
      const normalizedSunday = helper.normalizeWeekDay(sunday);
      expect(normalizedSunday).toBe(6);
    });

    it('should recognize same year and month of min date', () => {
      const minDate = new Date('2020-02-03');
      const helper = new CalendarHelper({
        minDate: minDate,
      });

      const validMinDate = new Date('2020-02-27');
      expect(helper.isInMinMonth(validMinDate)).toBe(true);

      const invalidMinDate = new Date('2020-03-27');
      expect(helper.isInMinMonth(invalidMinDate)).toBe(false);
    });

    it('should recognize same year and month of max date', () => {
      const maxDate = new Date('2020-11-12');
      const helper = new CalendarHelper({
        maxDate: maxDate,
      });

      const validMaxDate = new Date('2020-11-01');
      expect(helper.isInMaxMonth(validMaxDate)).toBe(true);

      const invalidMaxDate = new Date('2020-12-01');
      expect(helper.isInMaxMonth(invalidMaxDate)).toBe(false);
    });

    it('should get min day in month', () => {
      const minDate = new Date('2020-02-03');
      const helper = new CalendarHelper({
        minDate: minDate,
      });

      const anyMonth = new Date('2020-05-03');
      expect(helper.getMinDay(anyMonth)).toBe(1);

      const minMonth = new Date('2020-02-20');
      expect(helper.getMinDay(minMonth)).toBe(3);
    });

    it('should get max day in month', () => {
      const maxDate = new Date('2020-11-12');
      const helper = new CalendarHelper({
        maxDate: maxDate,
      });

      const anyMonth = new Date('2020-06-12');
      expect(helper.getMaxDay(anyMonth)).toBe(30);

      const maxMonth = new Date('2020-11-02');
      expect(helper.getMaxDay(maxMonth)).toBe(12);
    });
  });
});
