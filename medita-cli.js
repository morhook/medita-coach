import { tgBotEndpoint } from './telegram-bot.js';

if (!process.argv[2]) {
  console.log('Missing Telegram id. E.g. node medita 123456 /start');
  process.exit(0);
}
if (!process.argv[3]) {
  console.log('Missing message. E.g. node medita 123456 /start');
  process.exit(0);
}

tgBotEndpoint({
  body: {
    message: {
      from: {
        id: process.argv[2],
      },
      text: process.argv[3],
    }
  }}, {
  send: (output) => {
    console.log('Endpoint answer to Telegram bot:');
    console.log(output);
  }
});
