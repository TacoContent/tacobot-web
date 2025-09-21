import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const appPackage = JSON.parse(fs.readFileSync(getPackageJsonPath(), 'utf-8'));

function stripQuotes(str: string): string {
  return str.replace(/^"(.*)"$/, '$1');
}

function buildMongoUrl(): string {
  const mUrl = stripQuotes(getEnvVarString('TBW_MONGODB_URL', ''));
  if (mUrl) {
    return mUrl;
  } else {
    const host = stripQuotes(getEnvVarString('TBW_MONGODB_HOST', 'localhost'));
    const port = stripQuotes(getEnvVarString('TBW_MONGODB_PORT', '27017'));
    const user = stripQuotes(getEnvVarString('TBW_MONGODB_USERNAME', ''));
    const pass = encodeURIComponent(stripQuotes(getEnvVarString('TBW_MONGODB_PASSWORD', '')));
    const authSource = stripQuotes(getEnvVarString('TBW_MONGODB_AUTHSOURCE', 'admin'));
    let auth = '';

    if (host && port) {
      if (process.env.TBW_MONGODB_USERNAME && pass) {
        auth = `${user}:${pass}@`;
      }
      const url = `mongodb://${auth}${host}:${port}/${authSource}`;
      const urlStripped = `mongodb://****:****@${host}:${port}/${authSource}`;
      const database = getEnvVarString('TBW_MONGODB_DATABASE', 'tacobot');
      if (database) {
        console.log(`Using Database: ${database}`);
      }
      console.log(`Building MongoDB URL: ${urlStripped}`);
      return url;
    }
  }
  console.log(`Using default MongoDB URL`);
  return 'mongodb://localhost:27017/admin';
}

function getEnvVarBooleanDefault(envVar: string, defaultValue: boolean): boolean {
  if (process.env[envVar] === undefined) {
    return defaultValue;
  }
  return process.env[envVar].toLowerCase() === 'true';
}

function getEnvVarList(envVar: string, defaultValue: string[]): string[] {
  if (process.env[envVar]) {
    return process.env[envVar].split(',').map((h) => h.trim());
  }
  return defaultValue;
}

function getEnvVarString(envVar: string, defaultValue: string): string {
  if (process.env[envVar]) {
    return process.env[envVar];
  }
  return defaultValue;
}

function getEnvVarInt(envVar: string, defaultValue: number): number {
  if (process.env[envVar]) {
    const result = parseInt(process.env[envVar]);
    if (isNaN(result)) {
      return defaultValue;
    }
    return result;
  }
  return defaultValue;
}

function getPackageJsonPath(): string {
  return path.resolve(__dirname, '../../package.json');
}

function getPackageVar(key: string, defaultValue: string): string {
  return appPackage[key] || defaultValue;
}

const uiEnabled = getEnvVarBooleanDefault('TBW_UI_ENABLED', true);

const config = {
  app: {
    version: getPackageVar('version', '1.0.0'),
    buildSha: getPackageVar('buildSha', 'unknown'),
    buildRef: getPackageVar('buildRef', 'unknown'),
    buildDate: getPackageVar('buildDate', 'unknown'),
  },
  tacobot: {
    api: {
      url: getEnvVarString('TBW_TACOBOT_API_URL', 'http://localhost:8931'),
      token: getEnvVarString('TBW_TACOBOT_API_TOKEN', ''),
      header: getEnvVarString('TBW_TACOBOT_API_HEADER', 'X-TACOBOT-TOKEN'),
    },
    primaryGuildId: getEnvVarString('TBW_PRIMARY_GUILD_ID', ''),
  },
  log: {
    level: {
      db: getEnvVarString('TBW_LOG_LEVEL_DB', 'FATAL').toUpperCase(),
      console: getEnvVarString('TBW_LOG_LEVEL_CONSOLE', 'DEBUG').toUpperCase(),
    },
  },
  mongo: {
    url: buildMongoUrl(),
    database: getEnvVarString('TBW_MONGODB_DATABASE', 'tacobot'),
  },
  chatgpt: {
    apiKey: getEnvVarString('TBW_OPENAI_API_KEY', ''),
    apiUrl: getEnvVarString('TBW_OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
    model: getEnvVarString('TBW_OPENAI_MODEL', 'gpt-4o'),
    verifySSL: getEnvVarBooleanDefault('TBW_OPENAI_VERIFY_SSL', true),
    timeout: getEnvVarInt('TBW_OPENAI_TIMEOUT_SECONDS', 5) * 1000, // Convert seconds to milliseconds
  },
  ui: {
    enabled: uiEnabled,
    allow: getEnvVarList('TBW_UI_ALLOWED_HOSTS', uiEnabled ? ['*'] : []),
  },
  timezone: getEnvVarString('TZ', getEnvVarString('TBW_TIMEZONE', 'America/Chicago')),
  language: getEnvVarString('TBW_LANGUAGE', 'en-us'),
  port: getEnvVarInt('TBW_PORT', 3000),
};

export default config;
