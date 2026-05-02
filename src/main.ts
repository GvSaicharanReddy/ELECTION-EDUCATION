/**
 * Election Saathi India — Main Entry Point
 *
 * Bootstraps the complete election education application:
 * 1. 3D WebGL election journey scene
 * 2. Accessible DOM fallback layer
 * 3. Election Coach (Gemini AI) panel
 * 4. Google Cloud Translation widget
 * 5. Google Maps polling location widget
 * 6. Google Calendar election reminders widget
 * 7. Google Cloud Natural Language API analytics
 * 8. Vertex AI semantic FAQ search
 *
 * @module main
 */

import { ElectionScene } from './scene/ElectionScene';
import { AccessibleFallback } from './ui/AccessibleFallback';
import { ElectionCoachPanel } from './ui/ElectionCoachPanel';
import { TranslationWidget } from './ui/TranslationWidget';
import { MapsWidget } from './ui/MapsWidget';
import { CalendarWidget } from './ui/CalendarWidget';
import { EligibilityCheckerWidget } from './ui/EligibilityCheckerWidget';
import { ElectionAnalyticsService } from './services/analytics';
import { ElectionVertexService } from './services/vertex';
import { store } from './state/store';
import { announce, onReducedMotionChange, prefersReducedMotion } from './utils/a11y';
import { logger } from './utils/logger';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Intersection ratio at which a section is considered "active" for nav highlighting. */
const SCROLL_SPY_THRESHOLD = 0.3;

/** Log context label for the bootstrap module. */
const LOG_CTX = 'Bootstrap';

// ─── Module State ─────────────────────────────────────────────────────────────

/** Track initialised scene for cleanup on reduced-motion toggle. */
let scene: ElectionScene | null = null;

// ─── Bootstrap ────────────────────────────────────────────────────────────────

/**
 * Bootstrap the Election Saathi India application.
 *
 * Initialises all UI layers in priority order:
 * 1. Accessible fallback (always first — ensures a11y from the start)
 * 2. 3D scene (progressive enhancement)
 * 3. Coach panel, Translation, Maps widgets
 * 4. Google Cloud services (Analytics, Vertex AI)
 * 5. Global event listeners
 *
 * @throws {Error} If the `#app` root element is missing from the DOM.
 */
async function bootstrap(): Promise<void> {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    throw new Error('Bootstrap: #app root element not found in DOM.');
  }

  initAccessibleFallback();
  init3DScene(appContainer);
  await initWidgets();
  initCloudServices();
  initListeners();
}

/**
 * Initialise the accessible DOM fallback layer.
 * Always runs first to guarantee content is available before JS enhancements.
 */
function initAccessibleFallback(): void {
  try {
    new AccessibleFallback();
  } catch (err) {
    logger.warn(LOG_CTX, 'Accessible fallback failed to initialise', err);
  }
}

/**
 * Initialize the 3D WebGL scene as a progressive enhancement.
 * Falls back gracefully when WebGL is unavailable or reduced-motion is active.
 *
 * @param appContainer - The root `#app` DOM element.
 */
function init3DScene(appContainer: HTMLElement): void {
  const shouldEnable3D = !prefersReducedMotion() && supportsWebGL();
  if (shouldEnable3D) {
    try {
      scene = new ElectionScene(appContainer);
      appContainer.classList.toggle('webgl-active', true);
      store.setState({ is3DEnabled: true });
    } catch (err) {
      logger.warn(LOG_CTX, '3D scene failed to initialise', err);
      store.setState({ is3DEnabled: false });
      appContainer.setAttribute('aria-hidden', 'true');
    }
  } else {
    store.setState({ is3DEnabled: false });
    appContainer.classList.toggle('webgl-active', false);
    appContainer.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Interface for UI widgets that initialise themselves on construction.
 */
interface InitialisableWidget {}

/**
 * Initialize all standard UI widgets.
 * Each widget is initialised independently so a single failure cannot cascade.
 */
async function initWidgets(): Promise<void> {
  const widgets: Array<{ name: string; constructor: new () => InitialisableWidget }> = [
    { name: 'CoachPanel', constructor: ElectionCoachPanel },
    { name: 'TranslationWidget', constructor: TranslationWidget },
    { name: 'MapsWidget', constructor: MapsWidget },
    { name: 'CalendarWidget', constructor: CalendarWidget },
    { name: 'EligibilityChecker', constructor: EligibilityCheckerWidget },
  ];

  for (const { name, constructor } of widgets) {
    try {
      new constructor();
    } catch (err) {
      logger.warn(LOG_CTX, `${name} failed to initialise`, err);
    }
  }
}

/**
 * Initialize Google Cloud Analytics (Natural Language API + Firestore)
 * and Vertex AI text-embedding services.
 */
function initCloudServices(): void {
  initAnalytics();
  initVertexAI();
}

/**
 * Initialise the Google Cloud Natural Language API analytics service.
 */
function initAnalytics(): void {
  try {
    const analytics = new ElectionAnalyticsService();
    if (analytics.isConfigured()) {
      logger.info(LOG_CTX, 'Google Cloud Analytics (NL API + Firestore) active');
    }
  } catch (err) {
    logger.warn(LOG_CTX, 'Analytics service failed to initialise', err);
  }
}

/**
 * Initialise the Vertex AI semantic FAQ embedding service.
 */
function initVertexAI(): void {
  try {
    const vertex = new ElectionVertexService();
    if (vertex.isConfigured()) {
      logger.info(LOG_CTX, 'Vertex AI text-embedding service active');
    }
  } catch (err) {
    logger.warn(LOG_CTX, 'Vertex AI service failed to initialise', err);
  }
}

/**
 * Set up global event listeners:
 * - Reduced-motion media query changes
 * - Scroll-spy intersection observer
 * - ARIA live region announcement
 */
function initListeners(): void {
  onReducedMotionChange((reduced) => {
    store.setState({ isReducedMotion: reduced });
    if (reduced && scene) {
      scene.dispose();
      scene = null;
      store.setState({ is3DEnabled: false });
    }
  });

  announce(
    'Election Saathi India is ready. Navigate through the election journey to learn about Indian elections.',
  );

  setupScrollSpy();
}

/**
 * Check if the browser supports WebGL (v2 or v1 fallback).
 *
 * @returns `true` if WebGL rendering context is available.
 */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Set up an IntersectionObserver to highlight the active nav section on scroll.
 * No-ops gracefully when no `<section id>` elements exist.
 */
function setupScrollSpy(): void {
  const sections = document.querySelectorAll('main > section[id]');
  if (sections.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          store.setState({ activeSection: entry.target.id });
        }
      });
    },
    { threshold: SCROLL_SPY_THRESHOLD },
  );

  sections.forEach((section) => observer.observe(section));
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', bootstrap);

export { bootstrap };
