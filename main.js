import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { exec }  from  'child_process';
import ffmpeg from 'fluent-ffmpeg';

const openai = new OpenAI(); // process.env.OPENAI_API_KEY by default apiKey

console.log('generating meditation');
const response = await openai.chat.completions.create({
  messages: [
    {
      role: 'system',
      content: 'Eres un asistente que genera meditaciones guiadas. Cada dos o tres oraciones agregar "[very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause][very-long-pause]" para generar pausas'
    },
    {
      role: 'user', content: 'Haz una meditación para empezar el día de 20 minutos y pensar sobre los fracasos y triunfos. necesito ejercicios de respiración y visualización de las energias.'
    }
  ],
  model: 'gpt-3.5-turbo',
  max_tokens: 1000,
  temperature: 0.5,
})

console.log(response)
console.log(response.choices[0].message.content.trim());
console.log('generating speech')
const mp32 = await openai.audio.speech.create({
  input: response.choices[0].message.content.trim(),
  model: 'tts-1', // 'tts-1' | 'tts-1-hd'
  voice: 'nova',
  response_format: 'mp3', // 'opus' | 'aac' | 'flac'
  speed: 0.8 // `0.25` to `4.0`. `1.0` is
});
const buffer2 = Buffer.from(await mp32.arrayBuffer());
await fs.promises.writeFile(path.resolve('/tmp/speech2.mp3'), buffer2);
console.log('generated initial MP3')
console.log('mixing with birds and sounds')

ffmpeg()
  .addInput('/tmp/speech2.mp3')
  .addInput('ambient-forest-sounds.m4a')
  .complexFilter([{
    filter: 'volume',
    options: ['1.0'],
    inputs: "0:0",
    outputs: "[s1]"
  },
  {
    filter: 'volume',
    options: ['0.85'],
    inputs: "1:0",
    outputs: "[s2]"
  },
  {
    filter: 'amix',
    inputs: ["[s1]","[s2]"],
    options: ['duration=first','dropout_transition=0']
  }]).output('/tmp/mixed_audio_fluent.mp3').on('error', function(err) {
    console.log(err);
  })
  .on('end', function() {
    console.log('Amixed audio files together.');
  })
  .run();

console.log('meditation done!')
