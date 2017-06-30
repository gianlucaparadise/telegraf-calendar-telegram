const Extra = require('telegraf').Extra;

class CalendarHelper {
	constructor(options) {
		this.options = options || {
			startWeekDay: 0,
			weekDayNames: ["S", "M", "T", "W", "T", "F", "S"],
			monthNames: [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun",
				"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			]
		};
	}

	getCalendarMarkup(date) {
		return Extra.HTML().markup((m) => {
			return m.inlineKeyboard(this.getPage(m, date));
		});
	}

	addHeader(page, m, date) {
		let monthName = this.options.monthNames[date.getMonth()];
		let year = date.getFullYear();

		page.push([
			m.callbackButton("<", "calendar-telegram-prev-" + this.toYyyymmdd(date)),
			m.callbackButton(monthName + " " + year, "calendar-telegram-ignore"),
			m.callbackButton(">", "calendar-telegram-next-" + this.toYyyymmdd(date))
		]);

		page.push(this.options.weekDayNames.map(e => m.callbackButton(e, "calendar-telegram-ignore")));
	}

	addDays(page, m, date) {
		let maxDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

		let currentRow = new Array(7).fill(m.callbackButton(" ", "calendar-telegram-ignore"));
		for (var d = 1; d <= maxDays; d++) {
			date.setDate(d);

			let weekDay = this.normalizeWeekDay(date.getDay());
			//currentRow[weekDay] = toYyyymmdd(date);
			currentRow[weekDay] = m.callbackButton(d.toString(), "calendar-telegram-date-" + this.toYyyymmdd(date));

			if (weekDay == 6 || d == maxDays) {
				page.push(currentRow);
				currentRow = new Array(7).fill(m.callbackButton(" ", "calendar-telegram-ignore"));
			}
		}
	}

	getPage(m, date) {
		let page = [];
		this.addHeader(page, m, date);
		this.addDays(page, m, date);
		return page;
	}

	normalizeWeekDay(weekDay) {
		let result = weekDay - this.options.startWeekDay;
		if (result < 0) result += 7;
		return result;
	}

	toYyyymmdd(date) {
		let mm = date.getMonth() + 1; // getMonth() is zero-based
		let dd = date.getDate();

		return [
			date.getFullYear(),
			(mm > 9 ? '' : '0') + mm,
			(dd > 9 ? '' : '0') + dd
		].join('-');
	}
}

module.exports = CalendarHelper;