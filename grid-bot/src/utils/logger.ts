/**
 * Structured logger for terminal output + file logging
 *
 * Color-coded by level, includes timestamps and agent context.
 */

import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const COLORS = {
  debug: '\x1b[36m',  // cyan
  info: '\x1b[32m',   // green
  warn: '\x1b[33m',   // yellow
  error: '\x1b[31m',  // red
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: '📡',
  warn: '⚠️',
  error: '🚨',
};

class Logger {
  private level: LogLevel;
  private context: string;
  private logDir: string;

  constructor(level: LogLevel = 'info', context: string = 'bot') {
    this.level = level;
    this.context = context;
    this.logDir = join(process.cwd(), 'data', 'logs');

    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  withContext(context: string): Logger {
    const child = new Logger(this.level, context);
    return child;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.level]) return;

    const now = new Date();
    const time = now.toISOString().slice(11, 23);
    const color = COLORS[level];
    const icon = ICONS[level];

    // Terminal output
    const prefix = `${COLORS.dim}${time}${COLORS.reset} ${icon} ${color}[${this.context.toUpperCase().padEnd(10)}]${COLORS.reset}`;
    const dataStr = data ? ` ${COLORS.dim}${JSON.stringify(data)}${COLORS.reset}` : '';
    console.log(`${prefix} ${message}${dataStr}`);

    // File output
    const logLine = `${now.toISOString()} [${level.toUpperCase()}] [${this.context}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
    try {
      const dateStr = now.toISOString().slice(0, 10);
      appendFileSync(join(this.logDir, `${dateStr}.log`), logLine);
    } catch {
      // Silently fail file logging
    }
  }
}

/** Global logger instance */
export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || 'info'
);
