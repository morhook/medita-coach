import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI(); // process.env.OPENAI_API_KEY by default apiKey

const response = await openai.chat.completions.create({
  messages: [
    {
      role: 'system',
      content: 'Eres un asistente que genera meditaciones guiadas'
    },
    {
      role: 'user', content: 'Haz una meditación para arrancar el día de 3 minutos'
    }
  ],
  model: 'gpt-3.5-turbo',
  max_tokens: 500,
  temperature: 0.5,
})

console.log(response.choices[0].message.content.trim());

const mp32 = await openai.audio.speech.create({
  input: response.choices[0].message.content.trim(),
  model: 'tts-1', // 'tts-1' | 'tts-1-hd'
  voice: 'shimmer',
  response_format: 'mp3', // 'opus' | 'aac' | 'flac'
  // speed?: number; // `0.25` to `4.0`. `1.0` is
});
const buffer2 = Buffer.from(await mp32.arrayBuffer());
await fs.promises.writeFile(path.resolve('/tmp/speech2.mp3'), buffer2);
