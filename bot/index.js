const calendar = require('../');

const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.CALENDAR_BOT_TOKEN);

calendar.setDateListener(bot, (context, date) => context.reply(date));
bot.command("calendar", context => context.reply("Here you are", calendar.getCalendar()));

bot.startPolling();