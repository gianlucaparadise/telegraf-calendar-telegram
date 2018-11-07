const Calendar = require('../');

const Telegraf = require('telegraf');
// create the bot
const bot = new Telegraf(process.env.CALENDAR_BOT_TOKEN);

// instantiate the calendar
const calendar = new Calendar(bot, {
	startWeekDay: 1,
	weekDayNames: ["L", "M", "M", "G", "V", "S", "D"],
	monthNames: [
		"Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
		"Lug", "Ago", "Set", "Ott", "Nov", "Dic"
	]
});

// listen for the selected date event
calendar.setDateListener((context, date) => context.reply(date));
// retreive the calendar HTML
bot.command("calendar", context => {

	const today = new Date();
	const minDate = new Date();
	minDate.setMonth(today.getMonth() - 2);
	const maxDate = new Date();
	maxDate.setMonth(today.getMonth() + 2);
	maxDate.setDate(today.getDate());

	context.reply("Here you are", calendar.setMinDate(minDate).setMaxDate(maxDate).getCalendar())
});

bot.catch((err) => {
	console.log("Error in bot:", err);
});

bot.startPolling();