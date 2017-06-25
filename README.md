# telegraf-calendar-telegram
Inline calendar for Telegram bots using Telegraf framework.
You can test it using this [bot](t.me/CalendarTelegrafBot.).

Description
================
Using this simple inline calendar you can allow your Telegram bot to ask dates. This library is build using [Telegraf](https://github.com/telegraf/telegraf) Framework.

Usage
================
Import the library:
```javascript
const calendar = require('telegraf-calendar-telegram');
```
Retreive the calendar HTML:
```javascript
bot.command("calendar", context => context.reply("Here you are", calendar.getCalendar()));
```
Listen for the selected date event:
```javascript
calendar.setDateListener(bot, (context, date) => context.reply(date));
```

You can find [here](./bot/index.js) the code for a working [bot](t.me/CalendarTelegrafBot.).