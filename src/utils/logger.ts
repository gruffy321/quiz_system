/**
 * Centralized logging and messaging system.
 * This ensures homogeneous warning, error, and info broadcasting across the app.
 * Can be hooked into an external monitoring service (e.g. Sentry) later without rewriting UI logic.
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export class SystemLogger {
  static log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    
    // Format the message uniformly
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
      case LogLevel.INFO:
        console.info(formattedMessage, context || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, context || '');
        // Hook for UI alerts or remote tracking
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, context || '');
        // Hook for critical remote tracking
        break;
    }
  }

  static info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  static warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  static error(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context);
  }
}
