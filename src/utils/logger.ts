/**
 * @fileoverview Structured application logger for Election Saathi India.
 *
 * Provides levelled, prefixed logging that is:
 * - Disabled in production by default (configurable via VITE_LOG_LEVEL)
 * - Free of raw `console.*` calls in business logic
 * - Centralised so the linter never needs to be suppressed
 *
 * Console calls are permitted in this file via ESLint overrides
 * in `.eslintrc.json` (no inline suppression required).
 *
 * @module utils/logger
 */

/** Supported log levels in ascending severity. */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/** Numeric weights for each log level (ascending severity). */
const LEVEL_WEIGHT: Readonly<Record<LogLevel, number>> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

/** Resolve the minimum log level from the build-time env variable. */
function resolveLevel(): LogLevel {
  const env = import.meta.env['VITE_LOG_LEVEL'] as string | undefined;
  if (env && env in LEVEL_WEIGHT) {
    return env as LogLevel;
  }
  // In production builds, default to warnings+; in dev, show all.
  return import.meta.env.PROD ? 'warn' : 'debug';
}

const MIN_LEVEL: number = LEVEL_WEIGHT[resolveLevel()];

/** Application prefix shown on every log line. */
const APP_TAG = '[ElectionSaathi]';

/**
 * Format a structured log prefix.
 *
 * @param context - Source module or component name.
 * @returns Formatted prefix string.
 */
function formatPrefix(context: string): string {
  return `${APP_TAG} [${context}]`;
}

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
    if (LEVEL_WEIGHT.debug >= MIN_LEVEL) {
      console.debug(formatPrefix(context), message, ...data);
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
    if (LEVEL_WEIGHT.info >= MIN_LEVEL) {
      console.info(formatPrefix(context), message, ...data);
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
    if (LEVEL_WEIGHT.warn >= MIN_LEVEL) {
      console.warn(formatPrefix(context), message, ...data);
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
    if (LEVEL_WEIGHT.error >= MIN_LEVEL) {
      console.error(formatPrefix(context), message, ...data);
    }
  },
};
