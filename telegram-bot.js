import express from 'express';
import dotenv from 'dotenv';
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

const commands = [
  {
    command: 'meditar',
    description: 'arranca una meditación'
  },
  {
    command: 'start',
    description: 'help'
  },
  {
    command: 'meditate',
    description: 'starts a meditation'
  },

]

tgBot.setMyCommands(commands)

const tgBotEndpoint = async (req, res) => {
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
    } else if (lowerCaseMessage.startsWith('meditar') 
      || lowerCaseMessage.startsWith('/meditar')) {
      let topico = textMessage;
    
      fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=generando meditacion&parse_mode=Markdown`)
      
      generateMeditation(tgBot, req.body.message.from.id, topico, 'es')

      return res.send({ status: 'ok' });
      
    } else if (lowerCaseMessage.startsWith('meditate')
      || lowerCaseMessage.startsWith('/meditate')) {
      let topico = textMessage;
    
      fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=generating meditation&parse_mode=Markdown`)
      
      generateMeditation(tgBot, req.body.message.from.id, topico, 'en')

      return res.send({ status: 'ok' });
      
    } else if (textMessage === '/start') {
      fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=Hola! Soy un bot que te ayuda a meditar. Para comenzar, escribe "meditar" seguido de un tema sobre el que quieras meditar. %0A%0AHello! I'm a bot that will help you meditate. Put "meditate" to start meditating. &parse_mode=Markdown`)
      return res.send({ status: 'ok' });
    } else {
      return res.send({ status: 'ok' });
    }
    
  } else {
    if (textMessage === '/start') {
      fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=Hola! Soy un bot que te ayuda a meditar. Para entrar al sistema enviar un mensaje personal a morhook avisandole que te autorize con tu id ${telegramUserId}. %0A%0AHello! To start meditating, please ask for authorization to morhook with your telegram id ${telegramUserId} &parse_mode=Markdown`)
    }
    return res.send({ status: 'ok' });
  }
};

app.post('/message', tgBotEndpoint);

// If run from file and not imported from other
if (process.argv.join().indexOf('telegram-bot') > -1) {
  app.listen((process.env.PORT || 3000), () => {
    console.log('App listening on port ' + (process.env.PORT || 3000));
  });
}

export { tgBotEndpoint };
