const CalendarHelper = require('./calendar-helper');

// todo: handle localization

class Calendar {
	constructor(bot, options) {
		this.bot = bot

		this.helper = new CalendarHelper(options);
	}

	/**
	 * Return Calendar Markup
	 */
	getCalendar() {
		return this.helper.getCalendarMarkup(new Date());
	}

	setDateListener(onDateSelected) {
		this.bot.action(/calendar-telegram-date-[\d-]+/g, context => {
			if (onDateSelected) {
				let date = context.match[0].replace("calendar-telegram-date-", "");
				onDateSelected(context, date);
			}
		});

		this.bot.action(/calendar-telegram-prev-[\d-]+/g, context => {
			let dateString = context.match[0].replace("calendar-telegram-prev-", "");
			let date = new Date(dateString);
			date.setMonth(date.getMonth() - 1);

			let prevText = context.callbackQuery.message.text;
			context.editMessageText(prevText, this.helper.getCalendarMarkup(date));
		});

		this.bot.action(/calendar-telegram-next-[\d-]+/g, context => {
			let dateString = context.match[0].replace("calendar-telegram-next-", "");
			let date = new Date(dateString);
			date.setMonth(date.getMonth() + 1);

			let prevText = context.callbackQuery.message.text;
			context.editMessageText(prevText, this.helper.getCalendarMarkup(date));
		});

		this.bot.action("calendar-telegram-ignore", context => { });
	}

	setMinDate(date) {
		this.helper.options.setMinDate(date);
		return this;
	}

	setMaxDate(date) {
		this.helper.options.setMaxDate(date);
		return this;
	}
}

module.exports = Calendar;