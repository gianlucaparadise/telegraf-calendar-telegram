const CalendarHelper = require('./calendar-helper');

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
				return context.answerCbQuery()
					.then(() => onDateSelected(context, date));
			}
		});

		this.bot.action(/calendar-telegram-prev-[\d-]+/g, context => {
			let dateString = context.match[0].replace("calendar-telegram-prev-", "");
			let date = new Date(dateString);
			date.setMonth(date.getMonth() - 1);

			let prevText = context.callbackQuery.message.text;
			return context.answerCbQuery()
				.then(() => context.editMessageText(prevText, this.helper.getCalendarMarkup(date)));
		});

		this.bot.action(/calendar-telegram-next-[\d-]+/g, context => {
			let dateString = context.match[0].replace("calendar-telegram-next-", "");
			let date = new Date(dateString);
			date.setMonth(date.getMonth() + 1);

			let prevText = context.callbackQuery.message.text;
			return context.answerCbQuery()
				.then(() => context.editMessageText(prevText, this.helper.getCalendarMarkup(date)));
		});

		this.bot.action(/calendar-telegram-ignore-[\d\w-]+/g, context => context.answerCbQuery());
	}

	setMinDate(date) {
		this.helper.setMinDate(new Date(date));
		return this;
	}

	setMaxDate(date) {
		this.helper.setMaxDate(new Date(date));
		return this;
	}

	setWeekDayNames(names) {
		this.helper.setWeekDayNames(names);
		return this;
	}

	setMonthNames(names) {
		this.helper.setMonthNames(names);
		return this;
	}

	setStartWeekDay(startDay) {
		this.helper.setStartWeekDay(startDay);
		return this;
	}
}

module.exports = Calendar;
