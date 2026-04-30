/**
 * @fileoverview Unit tests for the structured logger utility.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the logger by spying on the underlying console methods.
// This validates the logger routes to the correct console method at each level.

describe('logger utility', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    // Patch env so MIN_LEVEL resolves to 'debug' (all levels active).
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, PROD: false, VITE_LOG_LEVEL: 'debug' },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('exports an object with debug/info/warn/error methods', async () => {
    const { logger } = await import('../../src/utils/logger');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('logger.warn calls console.warn with prefix and context', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { logger } = await import('../../src/utils/logger');
    logger.warn('TestCtx', 'something went wrong', { detail: 1 });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[TestCtx]'),
      'something went wrong',
      { detail: 1 },
    );
  });

  it('logger.error calls console.error with prefix and context', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { logger } = await import('../../src/utils/logger');
    logger.error('TestCtx', 'critical error');
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[TestCtx]'),
      'critical error',
    );
  });

  it('logger.info calls console.info', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const { logger } = await import('../../src/utils/logger');
    logger.info('TestCtx', 'service active');
    expect(spy).toHaveBeenCalled();
  });

  it('logger.debug calls console.debug', async () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const { logger } = await import('../../src/utils/logger');
    logger.debug('TestCtx', 'debug data', [1, 2, 3]);
    expect(spy).toHaveBeenCalled();
  });
});
