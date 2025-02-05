import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { generateAudioRT } from './helpers.js';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI(); // process.env.OPENAI_API_KEY by default apiKey

async function generateMeditationTexts(longMeditation, topico, language) {
  console.log('generating meditation');
  const prompts = {
    es: {
      system: 'Eres un asistente que genera meditaciones guiadas. Cada dos o tres oraciones agregar "[pause]" para generar pausas.',
      user: `Haz una meditación con el tema ${topico}. Necesito ejercicios de respiración y visualización de las energias. Agregar mensajes de autovaloración. Que sea de 20 oraciones aproximadamente.`,
      userLong: 'Empieza una meditación para arrancar el día. Necesito ejercicios de respiración y visualización de las energias. Agregar mensajes de autovaloración. Es importante que mantengas cerrados los ojos en todo momento y no los abras ni regreses al presente aún.',
      userContinue: 'Continúa la meditación con varias oraciones mas para adentrarte en temas mas profundos.',
      userClose: 'Haz el cierre de la meditación, pidele a la persona que abra los ojos y que mueva un poco su cuerpo para volver a despertarse al mundo real.'
    },
    en: {
      system: 'You are an assistant that generates guided meditations. Every two or three sentences add "[pause]" to create pauses.',
      user: `Create a meditation on the topic ${topico}. I need breathing exercises and energy visualization. Add self-worth messages. It should be about 20 sentences long.`,
      userLong: 'Start a meditation to begin the day. I need breathing exercises and energy visualization. Add self-worth messages. It is important to keep your eyes closed at all times and not open them or return to the present yet.',
      userContinue: 'Continue the meditation with several more sentences to delve into deeper topics.',
      userClose: 'Close the meditation, ask the person to open their eyes and move their body a bit to wake up to the real world.'
    }
  };

  const selectedPrompts = prompts[language];

  if (longMeditation === false) {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: selectedPrompts.system
        },
        {
          role: 'user', content: selectedPrompts.user
        }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.5,
    });

    console.log(response.choices[0].message.content.trim());
    const fullMeditation = response.choices[0].message.content.trim();
    return fullMeditation;
  } else {
    const meditations = [];
    const messages = [
      {
        role: 'system',
        content: selectedPrompts.system
      },
      {
        role: 'user', content: selectedPrompts.userLong
      }
    ];
    const response = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.5,
    });

    console.log(response.choices[0].message.content.trim());
    meditations.push(response.choices[0].message.content.trim());
    console.log('fin de generacion inicial');

    messages.push({
      role: 'assistant',
      content: meditations[0]
    });

    messages.push({
      role: 'user',
      content: selectedPrompts.userContinue
    });
    const responseSecond = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.5,
    });
    console.log(responseSecond.choices[0].message.content.trim());
    meditations.push(responseSecond.choices[0].message.content.trim());
    console.log('generada la segunda');

    messages.push({
      role: 'assistant',
      content: meditations[1]
    });

    messages.push({
      role: 'user',
      content: selectedPrompts.userClose
    });
    const responseThird = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.5,
    });
    console.log(responseThird.choices[0].message.content.trim());
    meditations.push(responseThird.choices[0].message.content.trim());
    console.log('generacion tercera lista');

    return meditations.join();
  }
}
async function generateMeditation(tgBot, chatId, topico, language) {
  const fullMeditation = await generateMeditationTexts(false, topico, language);
  console.log(fullMeditation);
  
  const meditations = fullMeditation.split("[pause]").filter(meditation => meditation.trim() != '');;
  let i = 0;
  for (const meditation of meditations) {
    console.log(`generating speech ${i}`)
    console.log(meditation);
    if (language === 'es')
      await generateAudioRT(meditation, `/tmp/partial_speech${i}.mp3`);
    else 
      await generateAudioRT(meditation, `/tmp/partial_speech${i}.mp3`, 'english', 'new yorker');

    i = i + 1;
  };
  console.log('merging together all generated files')
  
  await new Promise((resolve, reject) => {
    let command = ffmpeg();
  
    meditations.forEach((_, i) => {
      console.log(`added /tmp/partial_speech{$i].mp3`);
      command = command.addInput(`/tmp/partial_speech${i}.mp3`);
      if (i < meditations.length - 2) {
        console.log(`added 5 seconds silence`);
        command = command.addInput(`5-seconds-of-silence.mp3`);
      } else if (i == meditations.length - 2) {
        console.log(`added 30 seconds silence`);
        command = command.addInput(`30-seconds-of-silence.mp3`);
      } else {
        console.log(`last section`);
      }
    })
    command.mergeToFile('/tmp/speech2.mp3', '/tmp').on('end', () => {
      console.log('finished concatenation');
      resolve();
    });
  });
  
  console.log('generated initial MP3')
  console.log('mixing with birds or ocean')
  
  ffmpeg()
    .addInput('/tmp/speech2.mp3')
    //.addInput('ocean-waves.m4a')
    .addInput('ambient-forest-sounds.m4a')
    .complexFilter([{
      filter: 'volume',
      options: ['1.0'],
      inputs: "0:0",
      outputs: "[s1]"
    },
    {
      filter: 'volume',
      options: ['0.45'],
      inputs: "1:0",
      outputs: "[s2]"
    },
    {
      filter: 'amix',
      inputs: ["[s1]", "[s2]"],
      options: ['duration=first', 'dropout_transition=0']
    }]).output('/tmp/mixed_audio_fluent_speech.mp3').on('error', function (err) {
      console.log(err);
    })
    .on('end', function () {
      console.log('Amixed audio files together.');
      console.log('meditation done!')

      if(tgBot && chatId) {
        const finishedMeditation = (language === 'es' ? 'generada meditación' : 'meditation generated');
        fetch(`https://api.telegram.org/bot${ process.env.TELEGRAM_TOKEN }/sendMessage?chat_id=${chatId}&text=${finishedMeditation}&parse_mode=Markdown`)
        const fileName = "/tmp/mixed_audio_fluent_speech.mp3";
    
        const mp3File = fs.createReadStream(fileName);
        tgBot.sendAudio(chatId, mp3File)
          .then((data) => console.log(data))
          .catch(err => console.error(err));
    
      }
    })
    .run();
  
}

export default generateMeditation;