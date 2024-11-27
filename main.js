import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const openai = new OpenAI(); // process.env.OPENAI_API_KEY by default apiKey

console.log('generating meditation');
async function generateMeditationTexts(longMeditation) {
  if (longMeditation === false) {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que genera meditaciones guiadas. Cada dos o tres oraciones agregar "[pause]" para generar pausas.'
        },
        {
          role: 'user', content: 'Haz una meditación para "la sala del starcraft". Necesito ejercicios de respiración y visualización de las energias. Agregar mensajes de autovaloración. Que sea de 20 oraciones aproximadamente.'
        }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.5,
    })

    console.log(response.choices[0].message.content.trim())
    const fullMeditation = response.choices[0].message.content.trim();
    return fullMeditation;
  } else {
    const meditations = []
    const messages = [
      {
        role: 'system',
        content: 'Eres un asistente que genera meditaciones guiadas. Cada dos o tres oraciones agregar "[pause]" para generar pausas.'
      },
      {
        role: 'user', content: 'Empieza una meditación para arrancar el día. Necesito ejercicios de respiración y visualización de las energias. Agregar mensajes de autovaloración. Es importante que mantengas cerrados los ojos en todo momento y no los abras ni regreses al presente aún.'
      }
    ];
    const response = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.5,
    })

    console.log(response.choices[0].message.content.trim())
    meditations.push(response.choices[0].message.content.trim());
    console.log('fin de generacion inicial')

    messages.push({
      role: 'assistant',
      content: meditations[0]
    });

    messages.push(
      {
        role: 'user',
        content: 'Continúa la meditación con varias oraciones mas para adentrarte en temas mas profundos. '
      })
    const responseSecond = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.5,
    });
    console.log(responseSecond.choices[0].message.content.trim())
    console.log(responseSecond);
    meditations.push(responseSecond.choices[0].message.content.trim());
    console.log('generada la segunda')

    messages.push({
      role: 'assistant',
      content: meditations[1]
    });

    messages.push(
      {
        role: 'user',
        content: 'Haz el cierre de la meditación, pidele a la persona que abra los ojos y que mueva un poco su cuerpo para volver a despertarse al mundo real.'
      })
    const responseThird = await openai.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.5,
    });
    console.log(responseThird.choices[0].message.content.trim())
    console.log(responseThird);
    meditations.push(responseThird.choices[0].message.content.trim());
    console.log('generacion tercera lista')

    return meditations.join();
  }
}
const fullMeditation = await generateMeditationTexts(true);
console.log(fullMeditation);

const meditations = fullMeditation.split("[pause]").filter(meditation => meditation.trim() != '');;
let i = 0;
for (const meditation of meditations) {
  console.log(`generating speech ${i}`)
  console.log(meditation);
  const mp32 = await openai.audio.speech.create({
    input: meditation,
    model: 'tts-1', // 'tts-1' | 'tts-1-hd'
    voice: 'nova',
    response_format: 'mp3', // 'opus' | 'aac' | 'flac'
    speed: 0.8 // `0.25` to `4.0`. `1.0` is
  });
  const buffer = Buffer.from(await mp32.arrayBuffer());
  await fs.promises.writeFile(path.resolve(`/tmp/partial_speech${i}.mp3`), buffer);
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
  })
  .run();
