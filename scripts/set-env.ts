#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const validEnvs = ['local', 'development', 'staging', 'production'] as const;
type Environment = (typeof validEnvs)[number];

const envArg = process.argv[2]?.toLowerCase() as Environment;

if (!validEnvs.includes(envArg)) {
  console.error(`Error: Please specify a valid environment: ${validEnvs.join(', ')}`);
  console.error('Usage: pnpm set-env <environment>');
  process.exit(1);
}

const sourceFile = path.resolve(_dirname, `../.env.${envArg}`);
const targetFile = path.resolve(_dirname, '../.env');

if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Environment file ${sourceFile} does not exist`);
  console.error(`Create .env.${envArg} first before switching to this environment`);
  process.exit(1);
}

try {
  fs.copyFileSync(sourceFile, targetFile);
} catch (error) {
  console.error(`❌ Error switching environment: ${(error as Error).message}`);
  process.exit(1);
}
