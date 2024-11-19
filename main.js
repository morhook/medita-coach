import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const openai = new OpenAI(); // process.env.OPENAI_API_KEY by default apiKey

console.log('generating meditation');
const response = await openai.chat.completions.create({
  messages: [
    {
      role: 'system',
      content: 'Eres un asistente que genera meditaciones guiadas. Cada dos o tres oraciones agregar "[pause]" para generar pausas. Tiene que ser de 30 minutos. Necesito 60 oraciones. Necesito que hagas una introducción larga de 5 oraciones. Después necesito que hagas 8 partes de 2 oraciones cada una.Para finalizar necesito que hagas 4 oraciones para cerrar la meditación.'
    },
    {
      role: 'user', content: 'Haz el inicio de una meditación para "la sala del starcraft". Necesito ejercicios de respiración y visualización de las energias. '
    },


  ],
  model: 'gpt-3.5-turbo',
  //model: 'gpt-4-turbo',
  max_tokens: 3000,
  temperature: 2.0,
})

const fullMeditation=response.choices[0].message.content.trim();
console.log(fullMeditation);
const palabrasCount=fullMeditation.split(' ').length;
console.log(palabrasCount);
const meditations = fullMeditation.split("[pause]").filter(meditation => meditation.trim() != '');;
let i = 0;
for(const meditation of meditations) {
  console.log(`generating speech ${i}`)
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
  .addInput('ocean-waves.m4a')
  //.addInput('ambient-forest-sounds.m4a')
  .complexFilter([{
    filter: 'volume',
    options: ['1.0'],
    inputs: "0:0",
    outputs: "[s1]"
  },
  {
    filter: 'volume',
    options: ['0.25'],
    inputs: "1:0",
    outputs: "[s2]"
  },
  {
    filter: 'amix',
    inputs: ["[s1]","[s2]"],
    options: ['duration=first','dropout_transition=0']
  }]).output('/tmp/mixed_audio_fluent_speech.mp3').on('error', function(err) {
    console.log(err);
  })
  .on('end', function() {
    console.log('Amixed audio files together.');
    console.log('meditation done!')
  })
  .run();
