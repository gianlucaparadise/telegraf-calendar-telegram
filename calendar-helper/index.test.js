const CalendarHelper = require('.');

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
