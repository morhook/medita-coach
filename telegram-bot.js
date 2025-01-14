import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import generateMeditation from './main.js';

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const tgBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

app.get('/', (_req, res) => {
  res.send({ status: 'ok' });
});

const TELEGRAM_USERS = process.env.TELEGRAM_USERS.split(',')

app.post('/message', async (req, res) => {
  console.log('called post on /message');
  console.log(req.body);
  const textMessage = req.body.message.text;
  const telegramUserId = req.body.message.from.id;
  console.log(telegramUserId)
  if (TELEGRAM_USERS.includes(String(telegramUserId))) {
    const lowerCaseMessage = textMessage.toLowerCase();

    if (lowerCaseMessage === 'ping') {
      fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=pong&parse_mode=Markdown`, { signal: AbortSignal.timeout(5000) })
      console.log('ping pong!');
      return res.send({ status: 'ok' });
    } else if (lowerCaseMessage.startsWith('meditar')) {
      let topico = textMessage;
     
      fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=generando meditacion&parse_mode=Markdown`)
      
      generateMeditation(tgBot, req.body.message.from.id, topico, 'es')

      return res.send({ status: 'ok' });
      
    } else if (lowerCaseMessage.startsWith('meditate')) {
      let topico = textMessage;
     
      fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=generando meditacion&parse_mode=Markdown`)
      
      generateMeditation(tgBot, req.body.message.from.id, topico, 'en')

      return res.send({ status: 'ok' });
      
    } else {
      return res.send({ status: 'ok' });
    }
    
  } else {
    return res.send({ status: 'ok' });
  }
});

app.listen((process.env.PORT || 3000), () => {
  console.log('App listening on port ' + (process.env.PORT || 3000));
});
