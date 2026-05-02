/**
 * Accessibility Helpers — Utilities for the ARIA fallback layer.
 *
 * Provides functions for screen reader announcements, focus management,
 * keyboard navigation, reduced-motion detection, and live region updates.
 *
 * @module utils/a11y
 */

/** Start index for random segment in generated accessible IDs. */
const A11Y_ID_RAND_START = 2;

/** End index for random segment in generated accessible IDs. */
const A11Y_ID_RAND_END = 8;

/** Base for alphanumeric random string generation. */
const ALPHANUMERIC_BASE = 36;

/**
 * Announce a message to screen readers via the ARIA live region.
 *
 * @param message - Plain text message to announce.
 * @param priority - 'polite' for non-urgent, 'assertive' for immediate.
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcer = document.getElementById('aria-announcer');
  if (!announcer) {
    return;
  }

  announcer.setAttribute('aria-live', priority);
  // Clear and re-set to force re-announcement
  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer.textContent = message;
  });
}

/**
 * Move focus to a specific element by ID.
 *
 * @param elementId - The ID of the target element.
 * @param options - Optional focus options.
 * @returns True if focus was successfully moved.
 */
export function moveFocusTo(
  elementId: string,
  options: FocusOptions = { preventScroll: false },
): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    return false;
  }

  // Make focusable if not naturally focusable
  if (!element.getAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }

  element.focus(options);
  return true;
}

/**
 * Trap focus within a container (for modals and panels).
 *
 * @param containerId - The container element ID.
 * @returns A cleanup function that removes the trap.
 */
export function trapFocus(containerId: string): () => void {
  const container = document.getElementById(containerId);
  if (!container) {
    return () => {};
  }

  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    handleTabFocusShift(event, first, last, document.activeElement as HTMLElement | null);
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Handle tab focus shifting to trap focus within bounds.
 */
function handleTabFocusShift(event: KeyboardEvent, first: HTMLElement, last: HTMLElement, active: HTMLElement | null): void {
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Detect if the user prefers reduced motion.
 *
 * @returns True if the user has enabled reduced motion preferences.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Listen for changes in reduced-motion preference.
 *
 * @param callback - Function called with the new preference value.
 * @returns Cleanup function to stop listening.
 */
export function onReducedMotionChange(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (event: MediaQueryListEvent): void => {
    callback(event.matches);
  };

  query.addEventListener('change', handler);
  return () => {
    query.removeEventListener('change', handler);
  };
}

/**
 * Generate a unique ID for accessible elements.
 *
 * @param prefix - ID prefix describing the element's purpose.
 * @returns A unique string ID.
 */
export function generateA11yId(prefix: string): string {
  const random = Math.random().toString(ALPHANUMERIC_BASE).slice(A11Y_ID_RAND_START, A11Y_ID_RAND_END);
  return `${prefix}-${random}`;
}

/**
 * Set the document's active section for navigation state.
 *
 * Updates ARIA current attributes on nav links.
 *
 * @param navLinkId - The currently active nav link ID.
 */
export function setActiveNavSection(sectionId: string): void {
  const sectionToNavId: Record<string, string> = {
    'election-journey': 'nav-journey',
    'election-types': 'nav-types',
    'timeline': 'nav-timeline',
    'election-coach': 'nav-coach',
    'faq': 'nav-faq',
  };
  const targetLinkId = sectionToNavId[sectionId] ?? sectionId;
  const navLinks = document.querySelectorAll<HTMLElement>('.nav-link');
  navLinks.forEach(link => {
    const isActive = link.id === targetLinkId;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Create a visually hidden but accessible text element.
 *
 * @param text - The text content.
 * @param tag - HTML tag to use (default: 'span').
 * @returns The created element.
 */
export function createScreenReaderText(text: string, tag: string = 'span'): HTMLElement {
  const element = document.createElement(tag);
  element.className = 'sr-only';
  element.textContent = text;
  return element;
}
