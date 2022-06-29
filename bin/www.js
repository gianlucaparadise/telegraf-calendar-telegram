import bot from '../bot/index.js';
import { createServer } from 'http';

var server = createServer(function (req, res) {
	res.writeHead(200);
	res.end('Calendar Bot is up');
});
server.listen(process.env.CALENDAR_BOT_PORT || '3000');