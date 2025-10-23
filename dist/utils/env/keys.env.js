import fs from 'fs';
import { resolve } from "node:path";
const envContent = fs.readFileSync(resolve('./config/.env.development'), 'utf-8');
const keys = envContent
    .split('\n')
    .map(line => line.split('=')[0].trim())
    .filter(key => key && !key.startsWith('#'));
const typeDef = `export type EnvKey = ${keys.map(k => `'${k}'`).join(' | ')};\n`;
fs.writeFileSync('src/env-keys.d.ts', typeDef);
