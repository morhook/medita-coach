//const webHookUrl = 'https://b2d3-181-46-202-10.ngrok-free.app/message'
//const webHookUrl = 'https://www.postb.in/1733842040466-2183750914409'
//const webHookUrl = 'https://b9333cad8d7266.lhr.life/message'
//
import dotenv from 'dotenv';
dotenv.config()

//const webHookUrl = 'https://9eec443ab275ad.lhr.life/message'
//const webHookUrl = 'https://8721-181-46-202-10.ngrok-free.app/message'
const webHookUrl = 'https://73a0-181-46-202-10.ngrok-free.app/message'

fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/setWebhook?url=${webHookUrl}`)
  .then((rawResponse) => rawResponse.json())
  .then((response) => console.log(response))
  .catch((err) => console.log(err));

console.log(`Set Telegram Bot webhook to: ${webHookUrl}`);
