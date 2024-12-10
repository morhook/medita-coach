import express from 'express';
import dotenv from 'dotenv';
import child_process from 'child_process';

dotenv.config();

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send({ status: 'ok' });
});


app.post('/message', async (req, res) => {
  console.log('called post on /message');
  console.log(req.body);
  if (req.body.message.text === 'ping') {
    fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=pong&parse_mode=Markdown`)
    console.log('ping pong!');
    return res.send({ status: 'ok' });
  } else if (req.body.message.text === 'meditar') {
    child_process.execSync('npm start');
    fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${req.body.message.from.id}&text=meditacion generada&parse_mode=Markdown`)
    return res.send({ status: 'ok' });
    
  } else {
    return res.send({ status: 'ok' });
  }
});

app.listen((process.env.PORT || 3000), () => {
  console.log('App listening on port ' + (process.env.PORT || 3000));
});
