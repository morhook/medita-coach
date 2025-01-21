import dotenv from 'dotenv';
dotenv.config()

const webHookUrl = process.env.WEB_HOOK_URL 

fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/setWebhook?url=${webHookUrl}`)
  .then((rawResponse) => rawResponse.json())
  .then((response) => console.log(response))
  .catch((err) => console.log(err));

console.log(`Set Telegram Bot webhook to: ${webHookUrl}`);
