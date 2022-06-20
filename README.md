# telegraf-calendar-telegram
Inline calendar for Telegram bots using Telegraf framework.
You can test it using this [bot](t.me/CalendarTelegrafBot.).

Description
================
Using this simple inline calendar you can allow your Telegram bot to ask dates. This library is built using [Telegraf](https://github.com/telegraf/telegraf) Framework.

![Demo](https://github.com/gianlucaparadise/telegraf-calendar-telegram/blob/master/images/demo.gif "Demo")

Usage
================
Installation
---------------

```
npm i telegraf-calendar-telegram --save
```

Basic usage
---------------
```javascript
// create the bot
const bot = new Telegraf(process.env.CALENDAR_BOT_TOKEN);
// instantiate the calendar
const calendar = new Calendar(bot);

// listen for the selected date event
calendar.setDateListener((context, date) => context.reply(date));
// retreive the calendar HTML
bot.command("calendar", context => context.reply("Here you are", calendar.getCalendar()));
```

This creates a calendar with the default options: you will have an english calendar with Sunday as starting week day.

Customization
---------------
When you instantiate the calendar, you can pass an option object:

```javascript
const calendar = new Calendar(bot, {
	startWeekDay: 1,
	weekDayNames: ["L", "M", "M", "G", "V", "S", "D"],
	monthNames: [
		"Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
		"Lug", "Ago", "Set", "Ott", "Nov", "Dic"
	]
});
```

This creates an italian calendar.

Default options:

```javascript
{
	startWeekDay: 0,
	weekDayNames: ["S", "M", "T", "W", "T", "F", "S"],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	],
	minDate: null,
	maxDate: null,
	ignoreWeekDays: [],
	hideIgnoredWeeks: false,
	shortcutButtons: []
}
```

The `options` object has the following properties:

- `startWeekDay`: first day of the week, where 0 is Sunday
- `weekDayNames`: week day names, where the first element is `startWeekDay` name
- `monthNames`: month names
- `minDate`: minimum selectable date (there is a setter on Calendar object, too)
- `maxDate`: maximum selectable date (there is a setter on Calendar object, too)
- `ignoreWeekDays`: numbers of week days that can't be selected by user (5 - saturday, 6 - sunday)
- `hideIgnoredWeeks`: hide a week if all days of a week can't be selected
- `shortcutButtons`: list of additional buttons data, which will be displayed at the top of calendar (example: [{"label": "Today", "differenceCurrentDate": 0}])


Example
-----------

You can find [here](./bot/index.js) the code for a working [bot](t.me/CalendarTelegrafBot.).
