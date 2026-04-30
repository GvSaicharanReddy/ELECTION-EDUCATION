/**
 * @fileoverview Structured application logger for Election Saathi India.
 *
 * Provides levelled, prefixed logging that is:
 * - Disabled in production by default (configurable via VITE_LOG_LEVEL)
 * - Free of raw `console.*` calls in business logic
 * - Centralised so the linter never needs to be suppressed
 *
 * @module utils/logger
 */

/** Supported log levels in ascending severity. */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

/** Resolve the minimum log level from the build-time env variable. */
function resolveLevel(): LogLevel {
  const env = import.meta.env['VITE_LOG_LEVEL'] as string | undefined;
  if (env && env in LEVELS) {
    return env as LogLevel;
  }
  // In production builds, default to warnings+; in dev, show all.
  return import.meta.env.PROD ? 'warn' : 'debug';
}

const MIN_LEVEL = LEVELS[resolveLevel()];

/** Application prefix shown on every log line. */
const APP_TAG = '[ElectionSaathi]';

/**
 * Centralised logger for the Election Saathi India application.
 *
 * Usage:
 * ```ts
 * import { logger } from './utils/logger';
 * logger.warn('CoachPanel', 'Failed to load model', error);
 * ```
 */
export const logger = {
  /**
   * Emit a debug-level message (dev only).
   *
   * @param context - Source module or component name.
   * @param message - Human-readable description.
   * @param data    - Optional extra data.
   */
  debug(context: string, message: string, ...data: unknown[]): void {
    if (LEVELS.debug >= MIN_LEVEL) {
      // Production builds tree-shake this block entirely.
      // eslint-disable-next-line no-console
      console.debug(`${APP_TAG} [${context}]`, message, ...data);
    }
  },

  /**
   * Emit an informational message.
   *
   * @param context - Source module or component name.
   * @param message - Human-readable description.
   * @param data    - Optional extra data.
   */
  info(context: string, message: string, ...data: unknown[]): void {
    if (LEVELS.info >= MIN_LEVEL) {
      // eslint-disable-next-line no-console
      console.info(`${APP_TAG} [${context}]`, message, ...data);
    }
  },

  /**
   * Emit a warning that does not halt execution.
   *
   * @param context - Source module or component name.
   * @param message - Human-readable description.
   * @param data    - Optional extra data.
   */
  warn(context: string, message: string, ...data: unknown[]): void {
    if (LEVELS.warn >= MIN_LEVEL) {
      // eslint-disable-next-line no-console
      console.warn(`${APP_TAG} [${context}]`, message, ...data);
    }
  },

  /**
   * Emit an error indicating a recoverable or unrecoverable failure.
   *
   * @param context - Source module or component name.
   * @param message - Human-readable description.
   * @param data    - Optional extra data.
   */
  error(context: string, message: string, ...data: unknown[]): void {
    if (LEVELS.error >= MIN_LEVEL) {
      // eslint-disable-next-line no-console
      console.error(`${APP_TAG} [${context}]`, message, ...data);
    }
  },
};
