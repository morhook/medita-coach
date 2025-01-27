#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { resolve } from 'path';

const __dirname = resolve(new URL('.', import.meta.url).pathname);

let argumentsStr = '';
for (let i = 2; i < process.argv.length; i++) {
  argumentsStr += ' ' + process.argv[i];
}

let cmd = 'node --no-warnings ' + resolve(__dirname, 'medita-cli.js' + argumentsStr);
cmd = cmd.replace(RegExp('"', 'g'), '\\"');
spawnSync(cmd, { stdio: 'inherit', shell: true });
