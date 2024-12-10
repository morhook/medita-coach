import express from 'express';
import dotenv from 'dotenv';
import child_process from 'child_process';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const tgBot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

app.get('/', (_req, res) => {
  res.send({ status: 'ok' });
});


app.post('/message', async (req, res) => {
  console.log('called post on /message');
  console.log(req.body);
  if (req.body.message.text === 'ping') {
    fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=pong&parse_mode=Markdown`, { signal: AbortSignal.timeout(5000) })
    console.log('ping pong!');
    return res.send({ status: 'ok' });
  } else if (req.body.message.text === 'meditar') {
   fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=generando meditacion&parse_mode=Markdown`)
   	  
   child_process.exec('npm start');
   //fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=meditacion generada&parse_mode=Markdown`)
    //fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendAudio?chat_id=${req.body.message.from.id}&text=meditacion generada&parse_mode=Markdown`)
    return res.send({ status: 'ok' });
    
  } else if( req.body.message.text === 'dame meditacion') {
    const fileName = "/tmp/mixed_audio_fluent_speech.mp3";
    const stats = fs.statSync(fileName);
    let readStream = fs.createReadStream(fileName);
    const fileSizeInBytes = stats.size;

    const mp3File = fs.createReadStream(fileName);
    tgBot.sendAudio(req.body.message.from.id, mp3File)
      .then((data) => console.log(data))
      .catch(err => console.error(err));

    return res.send({ status: 'ok' });
    
  } else {
    return res.send({ status: 'ok' });
  }
});

app.listen((process.env.PORT || 3000), () => {
  console.log('App listening on port ' + (process.env.PORT || 3000));
});
