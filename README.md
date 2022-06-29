# telegraf-calendar-telegram
Inline calendar for Telegram bots using Telegraf framework.
You can contact [@CalendarTelegrafBot](https://t.me/CalendarTelegrafBot) to test the calendar.

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
or
```
yarn add telegraf-calendar-telegram
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
	shortcutButtons: [],
	hideIgnoredWeeks: false
}
```

The `options` object has the following properties:

- `startWeekDay`: first day of the week, where 0 is Sunday
- `weekDayNames`: week day names, where the first element is `startWeekDay` name
- `monthNames`: month names
- `minDate`: minimum selectable date (there is a setter on Calendar object, too)
- `maxDate`: maximum selectable date (there is a setter on Calendar object, too)
- `ignoreWeekDays`: numbers of week days that can't be selected by user (5 - saturday, 6 - sunday)
- `shortcutButtons`: list of additional buttons data, which will be displayed at the top of calendar. You can add a button with: `shortcutButtons: [{"label": "Today", "action": "ping"}]` and you can handle it with `bot.action("ping", context => context.reply("pong"))`
- `hideIgnoredWeeks`: hide a week if all days of a week can't be selected


Example
-----------

## Polling

You can find [here](./bot/index.js) the code for a simple bot that can run locally using polling.

## Webhooks

You can check [this](https://github.com/gianlucaparadise/telegraf-calendar-telegram-bot/blob/main/src/bot-setup.js) repository for a bot that is using webhooks and is deployed on Vercel. You can contact [@CalendarTelegrafBot](https://t.me/CalendarTelegrafBot) to test this bot.

Local testing
-----------
* Create a Telegram bot using [BotFather](https://core.telegram.org/bots#6-botfather) to get an API token
* Clone this repository
* Run `yarn`
* Run `cp .env.example .env` to create the env file
* Edit the _.env_ file and set the API token of your bot to `CALENDAR_BOT_TOKEN`