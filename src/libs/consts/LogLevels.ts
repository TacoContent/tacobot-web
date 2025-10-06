export enum LogLevels {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
  TRACE = 'TRACE',
}

export function logLevelFromString(level: string): LogLevels {
  switch (level.toUpperCase()) {
    case 'DEBUG':
      return LogLevels.DEBUG;
    case 'INFO':
      return LogLevels.INFO;
    case 'WARN':
      return LogLevels.WARN;
    case 'ERROR':
      return LogLevels.ERROR;
    case 'FATAL':
      return LogLevels.FATAL;
    case 'TRACE':
      return LogLevels.TRACE;
    default:
      return LogLevels.INFO;
  }
}