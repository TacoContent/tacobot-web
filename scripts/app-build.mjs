#!/usr/bin/env node
/**
 * Build the application by compiling TypeScript and copying assets.
 *
 * Steps:
 * - Reads tsconfig.json to determine output directory (default ./app)
 * - Optionally cleans the output directory if --clean flag is provided
 * - Runs `node package-sync.mjs` to sync package.json
 * - Installs dependencies in output directory if --install flag is provided
 * - Compiles TypeScript using `npx tsc`
 * - Copies static assets from src/assets to output directory
 * - Copies views from src/views to output directory
 * - Copies .env file if it exists
 *
 * Usage:
 *   node app-build.mjs [--clean] [--install]
 *
 * Flags:
 *   --clean    Remove all files in output directory before building
 *   --install  Run `npm install` in output directory after syncing package.json
 */
// Note: If you want to parse JSON with comments, uncomment below and use instead of JSON.parse()
// const stripJsonComments = require('strip-json-comments').default;
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Helper function to execute shell commands
function runCommand (command, description) {
  try {
    console.log(`\n[INFO] ${description}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`[ERROR] Failed to ${description}`);
    console.error(error.message);
    process.exit(1);
  }
}

const __dirname = path.resolve();


// read the tsconfig.json file
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.error(`[ERROR] tsconfig.json not found at ${tsconfigPath}`);
  process.exit(1);
}

// Parse JSON with comments allowed
const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
const tsconfig = JSON.parse(tsconfigContent);
if (!tsconfig.compilerOptions) {
  console.error('[ERROR] Invalid tsconfig.json: missing compilerOptions');
  process.exit(1);
}

const appDir = path.resolve(__dirname, tsconfig.compilerOptions.outDir);
if (!fs.existsSync(appDir)) {
  console.log(`[INFO] Creating directory: ${appDir}`);
  fs.mkdirSync(appDir, { recursive: true });
}

// Empty everything in the app directory
if (process.argv.includes('--clean')) {
  console.log(`[INFO] Cleaning directory: ${appDir}`);
  fs.rmSync(appDir, { recursive: true, force: true });
  fs.mkdirSync(appDir, { recursive: true });
}

// copy package.json
// runCommand(`npx copyfiles -u 0 package.json ${SRC_DIR}`, 'copy package.json');
// runCommand(`npm install --prefix ${SRC_DIR}`, `install dependencies in ${SRC_DIR}`);
// fs.rmSync(`${SRC_DIR}/package-lock.json`, { force: true });
// fs.rmSync(`${SRC_DIR}/package.json`, { force: true });

// Run package-sync.mjs
runCommand('node ./scripts/package-sync.mjs', 'sync package.json');

// only run this if `--install` flag passed in

if (process.argv.includes('--install')) {
  //  Install dependencies in the ./app directory
  runCommand(`npm install --prefix ${appDir}`, `install dependencies in ${appDir}`);
}

// Compile TypeScript
runCommand('npx tsc', 'compile TypeScript');

// Copy migrations data
runCommand(
  `npx copyfiles -u 1 ./src/.sitemap.yaml ${appDir}/`,
  `copy ./src/.sitemap.yaml => ${appDir}/.sitemap.yaml`
);

// Copy assets
runCommand(
  `npx copyfiles -u 2 ./src/assets/* ${appDir}/assets/`,
  `copy ./src/assets/* => ${appDir}/assets/`
);
runCommand(
  `npx copyfiles -u 2 ./src/assets/**/* ${appDir}/assets/`,
  `copy ./src/assets/**/* => ${appDir}/assets/`
);
runCommand(`ls ${appDir}/assets`, `list ${appDir}/assets`);


// Copy views
runCommand(
  `npx copyfiles -u 2 ./src/views/* ${appDir}/views/`,
  `copy ./src/views/* => ${appDir}/views/`
);
runCommand(
  `npx copyfiles -u 2 ./src/views/**/* ${appDir}/views/`,
  `copy ./src/views/**/* => ${appDir}/views/`
);
runCommand(`ls ${appDir}/views`, `list ${appDir}/views`);

// only copy .env if it exists
// Copy .env file
if (fs.existsSync('.env')) {
  runCommand(
    `npx copyfiles -u 0 .env ${appDir}/`,
    `copy .env => ${appDir}/`
  );
}

console.log('\n[INFO] Build process completed successfully!');
