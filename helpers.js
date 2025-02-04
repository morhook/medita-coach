import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { OpenAIRealtimeWS } from 'openai/beta/realtime/ws';

const writeWav = async (pcmBuffer, outputFilePath) => {
  const sampleRate = 24000; // Example: 24kHz
  const numChannels = 1; // Mono
  const bitsPerSample = 16; // PCM16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  const wavHeader = Buffer.alloc(44);

  const pcmDataLength = pcmBuffer.length;
  wavHeader.write('RIFF', 0); // ChunkID
  wavHeader.writeUInt32LE(36 + pcmDataLength, 4); // ChunkSize
  wavHeader.write('WAVE', 8); // Format

  wavHeader.write('fmt ', 12); // Subchunk1ID
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavHeader.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  wavHeader.writeUInt16LE(numChannels, 22); // NumChannels
  wavHeader.writeUInt32LE(sampleRate, 24); // SampleRate
  wavHeader.writeUInt32LE(byteRate, 28); // ByteRate
  wavHeader.writeUInt16LE(blockAlign, 32); // BlockAlign
  wavHeader.writeUInt16LE(bitsPerSample, 34); // BitsPerSample

  wavHeader.write('data', 36); // Subchunk2ID
  wavHeader.writeUInt32LE(pcmDataLength, 40); // Subchunk2Size

  const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);

  fs.writeFileSync(outputFilePath, wavBuffer);
};

export const generateAudioRT = (script, outputPath) => {
  return new Promise((resolve) => {

    const rt = new OpenAIRealtimeWS({ model: 'gpt-4o-realtime-preview-2024-12-17' });
    
    rt.socket.on('open', () => {
      console.log('Connection opened!');
      rt.send({
        type: 'session.update',
        session: {
          model: 'gpt-4o-realtime-preview',
        },
      });
    
      rt.send({
        type: 'response.create',
        response: {
          instructions: `Eres un profesor de meditación. Habla en español con acento argentino. Habla rápido. Habla muy fuerte con mucho entusiasmo. Debes leer exactamente este script:
          ${script}
          `,
          // 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse'
          voice: 'alloy',
          // voice: 'ash', // ash se corta
        },
      });
    });
    
    rt.on('error', (err) => {
      throw err;
    });
    
    rt.on('session.created', (event) => {
    });
    
    const audioChunks = [];
    rt.on('response.audio.delta', (message) => {
      const bufferDelta = Buffer.from(message.delta, 'base64');
      audioChunks.push(bufferDelta);
    });
    rt.on('response.audio.done', () => console.log());
    
    rt.on('response.done', () => {
      const concatenatedBuffer = Buffer.concat(audioChunks);

      const currentDate = new Date();

      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      
      const dateTimeString = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
      
      writeWav(concatenatedBuffer, `${dateTimeString}.wav`);

      ffmpeg(`${dateTimeString}.wav`)
        .inputOptions([
          '-ar 24000', // audio sample rate
          '-f s16le', // input format PCM 16-bit little-endian
          '-acodec pcm_s16le', // audio codec PCM 16-bit little-endian
        ])
        .audioCodec('libmp3lame') // specify MP3 codec
        .outputOptions([
          '-ar 24000', // audio sample rate
          '-ac 1', // audio channels
        ])
        .save(outputPath)
        .on('end', () => {
          console.log('Conversion complete');
          resolve(true);
        })
        .on('error', (err) => {
          console.error('Error during conversion:', err);
        });

      rt.close();
    });
  });
};
