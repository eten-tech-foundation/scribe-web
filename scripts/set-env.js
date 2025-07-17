#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validEnvs = ['local', 'development', 'staging', 'production'];
const envArg = process.argv[2]?.toLowerCase();

if (!validEnvs.includes(envArg)) {
  console.error(`Error: Please specify a valid environment: ${validEnvs.join(', ')}`);
  console.error('Usage: pnpm set-env <environment>');
  process.exit(1);
}

const sourceFile = path.resolve(__dirname, `../.env.${envArg}`);
const targetFile = path.resolve(__dirname, '../.env');

if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Environment file ${sourceFile} does not exist`);
  console.error(`Create .env.${envArg} first before switching to this environment`);
  process.exit(1);
}

try {
  fs.copyFileSync(sourceFile, targetFile);
} catch {
  process.exit(1);
}
