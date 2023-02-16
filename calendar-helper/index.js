const { Markup } = require('telegraf');

class CalendarHelper {
  constructor(options) {
    this.options = Object.assign(
      {
        startWeekDay: 0,
        weekDayNames: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        monthNames: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        minDate: null,
        maxDate: null,
        ignoreWeekDays: [],
        shortcutButtons: {
          buttons: [],
          placement: 'top',
          callbackSuffix: '',
          shouldPrefixButtonCallbacks: false,
        },
        hideIgnoredWeeks: false,
      },
      options
    );
  }

  getCalendarMarkup(date) {
    return Markup.inlineKeyboard(this.getPage(date));
  }

  setMinDate(date) {
    if (this.options.maxDate && date > this.options.maxDate) {
      throw "Min date can't be greater than max date";
    }
    this.options.minDate = date;
  }

  setMaxDate(date) {
    if (this.options.minDate && date < this.options.minDate) {
      throw "Max date can't be lower than min date";
    }
    this.options.maxDate = date;
  }

  setWeekDayNames(names) {
    this.options.weekDayNames = names;
  }

  setMonthNames(names) {
    this.options.monthNames = names;
  }

  setStartWeekDay(startDay) {
    this.options.startWeekDay = startDay;
  }

  setIgnoreWeekDays(ignoreWeekDays) {
    this.options.ignoreWeekDays = ignoreWeekDays;
  }

  setShortcutButtons(buttons) {
    this.options.shortcutButtons.buttons = buttons;
  }

  setHideIgnoredWeeks(hideIgnoredWeeks) {
    this.options.hideIgnoredWeeks = hideIgnoredWeeks;
  }

  transformShortcutButtonCallbackAction(buttonAction) {
    const prefix = this.options.shortcutButtons.shouldPrefixButtonCallbacks
      ? 'calendar-telegram-date-'
      : '';
    return `${prefix}${buttonAction}${this.options.shortcutButtons.callbackSuffix}`;
  }

  addShortcutButtons(page, shortcutButtons, placeAtBottom) {
    const menuShortcutButtons = [];

    for (let shortcutButton of shortcutButtons) {
      let buttonLabel = shortcutButton.label;
      let buttonAction = shortcutButton.action;

      menuShortcutButtons.push(
        Markup.button.callback(
          buttonLabel,
          this.transformShortcutButtonCallbackAction(buttonAction)
        )
      );
    }

    page[placeAtBottom ? 'push' : 'unshift'](menuShortcutButtons);
  }

  handleAddShortcutButtons(page) {
    const buttons = this.options.shortcutButtons.buttons;
    const placeAtBottom = this.options.shortcutButtons.placement === 'bottom';

    if (buttons.every((shortcut) => Array.isArray(shortcut))) {
      (placeAtBottom ? buttons : buttons.reverse()).forEach((buttons) => {
        this.addShortcutButtons(page, buttons, placeAtBottom);
      });
    } else {
      this.addShortcutButtons(page, buttons, placeAtBottom);
    }
  }

  addHeader(page, date) {
    let monthName = this.options.monthNames[date.getMonth()];
    let year = date.getFullYear();

    let header = [];

    if (this.isInMinMonth(date)) {
      // this is min month, I push an empty button
      header.push(
        Markup.button.callback(' ', 'calendar-telegram-ignore-minmonth')
      );
    } else {
      header.push(
        Markup.button.callback(
          '<',
          'calendar-telegram-prev-' + CalendarHelper.toYyyymmdd(date)
        )
      );
    }

    header.push(
      Markup.button.callback(
        monthName + ' ' + year,
        'calendar-telegram-ignore-monthname'
      )
    );

    if (this.isInMaxMonth(date)) {
      // this is max month, I push an empty button
      header.push(
        Markup.button.callback(' ', 'calendar-telegram-ignore-maxmonth')
      );
    } else {
      header.push(
        Markup.button.callback(
          '>',
          'calendar-telegram-next-' + CalendarHelper.toYyyymmdd(date)
        )
      );
    }

    page.push(header);

    page.push(
      this.options.weekDayNames.map((e, i) =>
        Markup.button.callback(e, 'calendar-telegram-ignore-weekday' + i)
      )
    );
  }

  addDays(page, date) {
    let maxMonthDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    let maxDay = this.getMaxDay(date);
    let minDay = this.getMinDay(date);

    let daysOfWeekProcessed = 0,
      daysOfWeekIgnored = 0;

    let currentRow = CalendarHelper.buildFillerRow('firstRow-');
    for (var d = 1; d <= maxMonthDay; d++) {
      date.setDate(d);

      let weekDay = this.normalizeWeekDay(date.getDay());
      //currentRow[weekDay] = CalendarHelper.toYyyymmdd(date);
      if (d < minDay || d > maxDay) {
        if (!this.options.hideIgnoredWeeks) {
          currentRow[weekDay] = Markup.button.callback(
            CalendarHelper.strikethroughText(d.toString()),
            'calendar-telegram-ignore-' + CalendarHelper.toYyyymmdd(date)
          );
        }

        daysOfWeekIgnored++;
      } else if (this.options.ignoreWeekDays.includes(weekDay)) {
        currentRow[weekDay] = Markup.button.callback(
          CalendarHelper.strikethroughText(d.toString()),
          'calendar-telegram-ignore-' + CalendarHelper.toYyyymmdd(date)
        );

        daysOfWeekIgnored++;
      } else {
        const prefix = this.options.shortcutButtons.shouldPrefixButtonCallbacks
          ? 'calendar-telegram-date-'
          : '';

        currentRow[weekDay] = Markup.button.callback(
          d.toString(),
          prefix +
            CalendarHelper.toYyyymmdd(date) +
            this.options.shortcutButtons.callbackSuffix
        );
      }

      daysOfWeekProcessed++;

      if (weekDay == 6 || d == maxMonthDay) {
        if (
          !this.options.hideIgnoredWeeks ||
          daysOfWeekProcessed !== daysOfWeekIgnored
        ) {
          page.push(currentRow);
        }
        // I'm at the end of the row: I create a new filler row
        currentRow = CalendarHelper.buildFillerRow('lastRow-');

        daysOfWeekProcessed = 0;
        daysOfWeekIgnored = 0;
      }
    }
  }

  getPage(inputDate) {
    // I use a math clamp to check if the input date is in range
    let dateNumber =
      this.options.minDate || this.options.maxDate
        ? Math.min(
            Math.max(inputDate, this.options.minDate),
            this.options.maxDate
          )
        : null;
    let date = dateNumber ? new Date(dateNumber) : inputDate;

    let page = [];

    this.addHeader(page, date);
    this.addDays(page, date);

    const shortcutButtons = this.options.shortcutButtons.buttons;
    if (shortcutButtons && shortcutButtons.length > 0) {
      this.handleAddShortcutButtons(page);
    }

    return page;
  }

  normalizeWeekDay(weekDay) {
    let result = weekDay - this.options.startWeekDay;
    if (result < 0) result += 7;
    return result;
  }

  /**
   * Calculates min day depending on input date and minDate in options
   * @param {*Date} date Test date
   * @returns int
   */
  getMinDay(date) {
    let minDay;
    if (this.isInMinMonth(date)) {
      minDay = this.options.minDate.getDate();
    } else {
      minDay = 1;
    }

    return minDay;
  }

  /**
   * Calculates max day depending on input date and maxDate in options
   * @param {*Date} date Test date
   * @returns int
   */
  getMaxDay(date) {
    let maxDay;
    if (this.isInMaxMonth(date)) {
      maxDay = this.options.maxDate.getDate();
    } else {
      maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    return maxDay;
  }

  static toYyyymmdd(date) {
    let mm = date.getMonth() + 1; // getMonth() is zero-based
    let dd = date.getDate();

    return [
      date.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd,
    ].join('-');
  }

  /**
   * Check if input date is in same year and month as min date
   */
  isInMinMonth(date) {
    return CalendarHelper.isSameMonth(this.options.minDate, date);
  }

  /**
   * Check if input date is in same year and month as max date
   */
  isInMaxMonth(date) {
    return CalendarHelper.isSameMonth(this.options.maxDate, date);
  }

  /**
   * Check if myDate is in same year and month as testDate
   * @param {*Date} myDate input date
   * @param {*Date} testDate test date
   * @returns bool
   */
  static isSameMonth(myDate, testDate) {
    if (!myDate) return false;

    testDate = testDate || new Date();

    return (
      myDate.getFullYear() === testDate.getFullYear() &&
      myDate.getMonth() === testDate.getMonth()
    );
  }

  /**
   * This uses unicode to draw strikethrough on text
   * @param {*String} text text to modify
   */
  static strikethroughText(text) {
    return text.split('').reduce(function (acc, char) {
      return acc + char + '\u0336';
    }, '');
  }

  /**
   * Builds an array of seven ignored callback buttons
   * @param {*object} m Telegraf Markup object
   * @param {*String} prefix String to be added before the element index
   */
  static buildFillerRow(prefix) {
    let buttonKey = 'calendar-telegram-ignore-filler-' + prefix;
    return Array.from({ length: 7 }, (v, k) =>
      Markup.button.callback(' ', buttonKey + k)
    );
  }
}

module.exports = CalendarHelper;
