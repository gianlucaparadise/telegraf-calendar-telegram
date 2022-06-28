const Extra = require('telegraf').Extra;

class CalendarHelper {
	constructor(options) {
		this.options = Object.assign({
			startWeekDay: 0,
			weekDayNames: ["S", "M", "T", "W", "T", "F", "S"],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun",
				"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			],
			minDate: null,
			maxDate: null,
			ignoreWeekDays: [],
			shortcutButtons: [],
			hideIgnoredWeeks: false
		}, options);
	}

	getCalendarMarkup(date) {
		return Extra.HTML().markup((m) => {
			return m.inlineKeyboard(this.getPage(m, date));
		});
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
  
	setShortcutButtons(shortcutButtons) {
		this.options.shortcutButtons = shortcutButtons;
	}

	setHideIgnoredWeeks(hideIgnoredWeeks) {
		this.options.hideIgnoredWeeks = hideIgnoredWeeks;
	}

	addShortcutButtons(page, m) {
		let menuShortcutButtons = [];

		let currentDate = new Date();

		for (let shortcutButton of this.options.shortcutButtons) {
			let buttonLabel = shortcutButton.label;
			let buttonAction = shortcutButton.action;

			menuShortcutButtons.push(m.callbackButton(buttonLabel, buttonAction));
		}

		page.push(menuShortcutButtons);
	}

	addHeader(page, m, date) {
		let monthName = this.options.monthNames[date.getMonth()];
		let year = date.getFullYear();

		let header = [];

		if (this.isInMinMonth(date)) {
			// this is min month, I push an empty button
			header.push(m.callbackButton(" ", "calendar-telegram-ignore-minmonth"));
		}
		else {
			header.push(m.callbackButton("<", "calendar-telegram-prev-" + CalendarHelper.toYyyymmdd(date)));
		}

		header.push(m.callbackButton(monthName + " " + year, "calendar-telegram-ignore-monthname"));

		if (this.isInMaxMonth(date)) {
			// this is max month, I push an empty button
			header.push(m.callbackButton(" ", "calendar-telegram-ignore-maxmonth"));
		}
		else {
			header.push(m.callbackButton(">", "calendar-telegram-next-" + CalendarHelper.toYyyymmdd(date)));
		}

		page.push(header);

		page.push(this.options.weekDayNames.map((e, i) => m.callbackButton(e, "calendar-telegram-ignore-weekday" + i)));
	}

	addDays(page, m, date) {
		let maxMonthDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		let maxDay = this.getMaxDay(date);
		let minDay = this.getMinDay(date);

		let daysOfWeekProcessed = 0,
			daysOfWeekIgnored = 0;

		let currentRow = CalendarHelper.buildFillerRow(m, "firstRow-");
		for (var d = 1; d <= maxMonthDay; d++) {
			date.setDate(d);

			let weekDay = this.normalizeWeekDay(date.getDay());
			//currentRow[weekDay] = CalendarHelper.toYyyymmdd(date);
			if (d < minDay || d > maxDay) {
				if (!this.options.hideIgnoredWeeks) {
					currentRow[weekDay] = m.callbackButton(CalendarHelper.strikethroughText(d.toString()), "calendar-telegram-ignore-" + CalendarHelper.toYyyymmdd(date));
				}

				daysOfWeekIgnored++;
			}
			else if (this.options.ignoreWeekDays.includes(weekDay)) {
				currentRow[weekDay] = m.callbackButton(CalendarHelper.strikethroughText(d.toString()), "calendar-telegram-ignore-" + CalendarHelper.toYyyymmdd(date));

				daysOfWeekIgnored++;
			}
			else {
				currentRow[weekDay] = m.callbackButton(d.toString(), "calendar-telegram-date-" + CalendarHelper.toYyyymmdd(date));
			}

			daysOfWeekProcessed++;

			if (weekDay == 6 || d == maxMonthDay) {
				if (!this.options.hideIgnoredWeeks || daysOfWeekProcessed !== daysOfWeekIgnored) {
					page.push(currentRow);
				}
				// I'm at the end of the row: I create a new filler row
				currentRow = CalendarHelper.buildFillerRow(m, "lastRow-");

				daysOfWeekProcessed = 0;
				daysOfWeekIgnored = 0;
			}
		}
	}

	getPage(m, inputDate) {
		// I use a math clamp to check if the input date is in range
		let dateNumber = this.options.minDate || this.options.maxDate ? Math.min(Math.max(inputDate, this.options.minDate), this.options.maxDate) : null;
		let date = dateNumber ? new Date(dateNumber) : inputDate;

		let page = [];

		const shortcutButtons = this.options.shortcutButtons;
		if (shortcutButtons && shortcutButtons.length > 0) {
			this.addShortcutButtons(page, m);
		}
		this.addHeader(page, m, date);
		this.addDays(page, m, date);

		return page;
	}

	normalizeWeekDay(weekDay) {
		let result = weekDay - this.options.startWeekDay;
		if (result < 0) result += 7;
		return result;
	}

	/**
	 * Calculates min day depending on input date and minDate in options
	 * 
	 * @param {*Date} date Test date
	 * 
	 * @returns int
	 */
	getMinDay(date) {
		let minDay;
		if (this.isInMinMonth(date)) {
			minDay = this.options.minDate.getDate();
		}
		else {
			minDay = 1;
		}

		return minDay;
	}

	/**
	 * Calculates max day depending on input date and maxDate in options
	 * 
	 * @param {*Date} date Test date
	 * 
	 * @returns int
	 */
	getMaxDay(date) {
		let maxDay;
		if (this.isInMaxMonth(date)) {
			maxDay = this.options.maxDate.getDate();
		}
		else {
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
			(dd > 9 ? '' : '0') + dd
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
	 * 
	 * @param {*Date} myDate input date
	 * @param {*Date} testDate test date
	 * 
	 * @returns bool
	 */
	static isSameMonth(myDate, testDate) {
		if (!myDate) return false;

		testDate = testDate || new Date();

		return myDate.getFullYear() === testDate.getFullYear() && myDate.getMonth() === testDate.getMonth();
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
	static buildFillerRow(m, prefix) {
		let buttonKey = "calendar-telegram-ignore-filler-" + prefix;
		return Array.from({ length: 7 }, (v, k) => m.callbackButton(" ", buttonKey + k));
	}
}

module.exports = CalendarHelper;
