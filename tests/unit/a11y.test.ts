/**
 * Unit tests for accessibility utilities.
 *
 * Covers: announce, moveFocusTo, trapFocus, prefersReducedMotion,
 * onReducedMotionChange, generateA11yId, setActiveNavSection,
 * createScreenReaderText.
 *
 * @module tests/unit/a11y.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  announce,
  moveFocusTo,
  trapFocus,
  prefersReducedMotion,
  onReducedMotionChange,
  generateA11yId,
  setActiveNavSection,
  createScreenReaderText,
} from '../../src/utils/a11y';

describe('announce', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="aria-announcer" aria-live="polite" aria-atomic="true"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets polite message by default', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    announce('Hello');
    const el = document.getElementById('aria-announcer')!;
    expect(el.textContent).toBe('Hello');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });

  it('sets assertive message when specified', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    announce('Urgent!', 'assertive');
    const el = document.getElementById('aria-announcer')!;
    expect(el.getAttribute('aria-live')).toBe('assertive');
  });

  it('does nothing when announcer is missing', () => {
    document.body.innerHTML = '';
    expect(() => announce('test')).not.toThrow();
  });
});

describe('moveFocusTo', () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="test-btn">Click</button><div id="plain">Div</div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('focuses an element by ID and returns true', () => {
    const result = moveFocusTo('test-btn');
    expect(result).toBe(true);
    expect(document.activeElement?.id).toBe('test-btn');
  });

  it('adds tabindex -1 to non-focusable elements', () => {
    moveFocusTo('plain');
    expect(document.getElementById('plain')!.getAttribute('tabindex')).toBe('-1');
  });

  it('returns false for missing element', () => {
    expect(moveFocusTo('nonexistent')).toBe(false);
  });
});

describe('trapFocus', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="trap-container">
        <button id="first-btn">First</button>
        <button id="last-btn">Last</button>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns a cleanup function', () => {
    const cleanup = trapFocus('trap-container');
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('returns noop when container is missing', () => {
    const cleanup = trapFocus('nonexistent');
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('handleKeyDown ignores non-Tab keys', () => {
    trapFocus('trap-container');
    const container = document.getElementById('trap-container')!;
    const spy = vi.spyOn(Event.prototype, 'preventDefault');
    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
  });

  it('handleKeyDown skips action when no focusable elements', () => {
    document.body.innerHTML = '<div id="empty-trap"></div>';
    trapFocus('empty-trap');
    const container = document.getElementById('empty-trap')!;
    expect(() => {
      container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    }).not.toThrow();
    document.body.innerHTML = '';
  });

  it('handleTabFocusShift wraps forward focus from last to first', () => {
    document.body.innerHTML = `
      <div id="focus-trap">
        <button id="btn-a">A</button>
        <button id="btn-b">B</button>
      </div>`;
    trapFocus('focus-trap');
    const container = document.getElementById('focus-trap')!;
    const btnB = document.getElementById('btn-b')!;
    btnB.focus();
    
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab', bubbles: true, cancelable: true
    });
    const preventSpy = vi.spyOn(tabEvent, 'preventDefault');
    Object.defineProperty(document, 'activeElement', { value: btnB, configurable: true });
    container.dispatchEvent(tabEvent);
    expect(preventSpy).toHaveBeenCalled();
    document.body.innerHTML = '';
  });
});

describe('prefersReducedMotion', () => {
  it('returns false when matchMedia is not available', () => {
    const origMatchMedia = window.matchMedia;
    // @ts-ignore
    window.matchMedia = undefined;
    expect(prefersReducedMotion()).toBe(false);
    window.matchMedia = origMatchMedia;
  });

  it('returns value from matchMedia', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as any;
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe('onReducedMotionChange', () => {
  it('returns noop when matchMedia unavailable', () => {
    const origMatchMedia = window.matchMedia;
    // @ts-ignore
    window.matchMedia = undefined;
    const cleanup = onReducedMotionChange(() => {});
    expect(typeof cleanup).toBe('function');
    cleanup();
    window.matchMedia = origMatchMedia;
  });

  it('registers and cleans up listener', () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({
      addEventListener: addListener,
      removeEventListener: removeListener,
    }) as any;

    const cleanup = onReducedMotionChange(() => {});
    expect(addListener).toHaveBeenCalledWith('change', expect.any(Function));

    cleanup();
    expect(removeListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('generateA11yId', () => {
  it('generates unique IDs with prefix', () => {
    const id1 = generateA11yId('test');
    const id2 = generateA11yId('test');
    expect(id1).toMatch(/^test-/);
    expect(id1).not.toBe(id2);
  });
});

describe('setActiveNavSection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <a class="nav-link" id="nav-journey" href="#election-journey">Journey</a>
      <a class="nav-link" id="nav-types" href="#election-types">Types</a>
      <a class="nav-link" id="nav-timeline" href="#timeline">Timeline</a>
      <a class="nav-link" id="nav-coach" href="#election-coach">Coach</a>
      <a class="nav-link" id="nav-faq" href="#faq">FAQ</a>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('sets aria-current on the correct link using section ID mapping', () => {
    setActiveNavSection('election-journey');
    const journeyLink = document.getElementById('nav-journey')!;
    expect(journeyLink.getAttribute('aria-current')).toBe('page');
    expect(journeyLink.classList.contains('active')).toBe(true);
  });

  it('removes aria-current from non-active links', () => {
    setActiveNavSection('timeline');
    const journeyLink = document.getElementById('nav-journey')!;
    expect(journeyLink.getAttribute('aria-current')).toBeNull();
    expect(journeyLink.classList.contains('active')).toBe(false);
  });

  it('handles unmapped section IDs as direct nav link IDs', () => {
    setActiveNavSection('nav-faq');
    const faqLink = document.getElementById('nav-faq')!;
    expect(faqLink.getAttribute('aria-current')).toBe('page');
  });
});

describe('createScreenReaderText', () => {
  it('creates a span with sr-only class by default', () => {
    const el = createScreenReaderText('Hidden text');
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.className).toBe('sr-only');
    expect(el.textContent).toBe('Hidden text');
  });

  it('creates an element with a custom tag', () => {
    const el = createScreenReaderText('Label', 'div');
    expect(el.tagName.toLowerCase()).toBe('div');
  });
});
