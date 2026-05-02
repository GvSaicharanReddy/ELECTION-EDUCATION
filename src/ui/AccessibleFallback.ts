/**
 * Accessible Fallback Layer — Full DOM mirror of the 3D scene.
 *
 * Creates an invisible-but-navigable semantic DOM that mirrors
 * every interactive state of the WebGL election journey.
 * Fully keyboard-navigable with ARIA labels, live regions, and focus management.
 *
 * @module ui/AccessibleFallback
 */

import { ELECTION_STAGES, getStagePosition } from '../data/election-stages';
import { ELECTION_TYPES } from '../data/election-types';
import { ELECTION_FAQ } from '../data/faq';
import { getAllTimelineEvents } from '../data/timeline';
import { store } from '../state/store';
import { announce, setActiveNavSection } from '../utils/a11y';
import { escapeHtml } from '../utils/sanitize';
import { JourneyStageId, TimelineEvent } from '../types/index';

/**
 * Build and manage the accessible fallback layer.
 *
 * Renders all election journey stages, election types, timeline,
 * and FAQ as semantic HTML within the fallback container.
 * Synchronises state with the 3D scene via the global store.
 */
export class AccessibleFallback {
  private readonly container: HTMLElement;

  /**
   * Initialize the accessible fallback layer.
   *
   * @throws {Error} If the #accessible-fallback container element is missing from the DOM.
   */
  constructor() {
    const el = document.getElementById('accessible-fallback');
    if (!el) {
      throw new Error('[A11y] #accessible-fallback container not found.');
    }
    this.container = el;
    this.render();
    this.subscribeToState();
    this.renderJourneyStages();
    this.renderElectionTypes();
    this.renderTimeline();
    this.renderFaq();
  }

  /**
   * Render the core structure of the fallback layer.
   */
  private render(): void {
    this.container.innerHTML = `
      <h2 class="sr-only">Election Journey — Accessible Text Interface</h2>
      <p class="sr-only">
        This is the full text alternative to the 3D visual experience.
        All 7 election journey stages, election types, timeline, and FAQ are navigable below.
      </p>
      <nav aria-label="Election journey stage navigation">
        <ul role="tablist" aria-label="Journey stages">
          ${ELECTION_STAGES.map(
            (stage, i) => `
            <li role="presentation">
              <button
                role="tab"
                id="a11y-tab-${stage.id}"
                aria-selected="${i === 0 ? 'true' : 'false'}"
                aria-controls="panel-${stage.id}"
                tabindex="${i === 0 ? '0' : '-1'}"
                data-stage-id="${stage.id}"
                class="sr-only"
              >
                Stage ${i + 1} of 7: ${escapeHtml(stage.title)}
              </button>
            </li>
          `,
          ).join('')}
        </ul>
      </nav>
    `;

    // Attach keyboard navigation for tab list
    this.setupKeyboardNav();
  }

  /**
   * Render each stage panel with step content.
   */
  private renderJourneyStages(): void {
    const panelsContainer = document.getElementById('journey-stages');
    const contentContainer = document.getElementById('journey-content');
    if (!panelsContainer || !contentContainer) {
      return;
    }

    // Create initial panel FIRST so aria-controls references are valid
    this.updateStagePanel(JourneyStageId.ELIGIBILITY);

    // Tab buttons with roving tabindex (only first tab focusable via Tab key)
    panelsContainer.innerHTML = ELECTION_STAGES.map(
      (stage, i) => `
      <button
        role="tab"
        id="tab-${stage.id}"
        aria-selected="${i === 0 ? 'true' : 'false'}"
        aria-controls="panel-${stage.id}"
        tabindex="${i === 0 ? '0' : '-1'}"
        class="btn ${i === 0 ? 'btn-primary' : 'btn-secondary'}"
        data-stage-id="${stage.id}"
      >
        <span aria-hidden="true">${stage.icon}</span>
        ${escapeHtml(stage.title)}
      </button>
    `,
    ).join('');

    // Keyboard navigation for visible tabs
    this.setupVisibleTabKeyboard(panelsContainer);

    // Click handlers
    panelsContainer.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-stage-id]');
      if (btn) {
        const stageId = btn.getAttribute('data-stage-id') as JourneyStageId;
        store.goToStage(stageId);
      }
    });
  }

  /**
   * Update the visible stage content panel.
   *
   * @param stageId - Active stage identifier.
   */
  private updateStagePanel(stageId: JourneyStageId): void {
    const content = document.getElementById('journey-content');
    if (!content) {
      return;
    }

    const stage = ELECTION_STAGES.find((s) => s.id === stageId);
    if (!stage) {
      return;
    }

    const pos = getStagePosition(stageId);
    content.innerHTML = this.buildStagePanelHtml(stage, pos);

    this.updateTabSelection(stageId);
  }

  /**
   * Build the HTML for a stage panel.
   */
  private buildStagePanelHtml(stage: (typeof ELECTION_STAGES)[0], pos: number): string {
    const stepsHtml = stage.steps
      .map(
        (step) => `
            <li style="margin-bottom: var(--space-4);">
              <strong>${escapeHtml(step.title)}</strong>
              <p style="color: var(--text-secondary); margin-top: var(--space-1);">${escapeHtml(step.description)}</p>
              ${
                step.actionLabel && step.actionUrl
                  ? `<a href="${escapeHtml(step.actionUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="margin-top: var(--space-2); display: inline-block;">${escapeHtml(step.actionLabel)} ↗</a>`
                  : ''
              }
            </li>
          `,
      )
      .join('');

    return `
      <div
        role="tabpanel"
        id="panel-${stage.id}"
        aria-labelledby="tab-${stage.id}"
        class="card"
      >
        <h3>${escapeHtml(stage.title)}</h3>
        <p class="section-description">${escapeHtml(stage.description)}</p>
        <p class="sr-only">Stage ${pos} of 7. ${escapeHtml(stage.ariaLabel)}</p>
        <ol>
          ${stepsHtml}
        </ol>
      </div>
    `;
  }

  /**
   * Update the tab selection states.
   */
  private updateTabSelection(stageId: JourneyStageId): void {
    const tabs = document.querySelectorAll('#journey-stages [role="tab"]');
    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-stage-id') === stageId;
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      tab.className = isActive ? 'btn btn-primary' : 'btn btn-secondary';
    });
  }

  /**
   * Set up keyboard navigation for the visible journey stage tabs.
   * Arrow keys move focus between tabs; Enter/Space activates.
   */
  private setupVisibleTabKeyboard(container: HTMLElement): void {
    container.addEventListener('keydown', (event) => {
      const target = event.target as HTMLElement;
      if (target.getAttribute('role') !== 'tab') return;

      const tabs = Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]'));
      const currentIndex = tabs.indexOf(target);
      let nextIndex = -1;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== -1 && nextIndex !== currentIndex) {
        event.preventDefault();
        tabs[nextIndex].focus();
        const stageId = tabs[nextIndex].getAttribute('data-stage-id') as JourneyStageId;
        if (stageId) store.goToStage(stageId);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const stageId = target.getAttribute('data-stage-id') as JourneyStageId;
        if (stageId) store.goToStage(stageId);
      }
    });
  }

  /**
   * Render the election types grid.
   */
  private renderElectionTypes(): void {
    const grid = document.getElementById('election-types-grid');
    if (!grid) {
      return;
    }

    grid.innerHTML = ELECTION_TYPES.map(
      (type) => `
      <div class="card" role="listitem" style="margin-bottom: var(--space-4);">
        <h3 style="color: var(--navy);">${escapeHtml(type.name)}</h3>
        <p style="font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-2);">${escapeHtml(type.fullName)}</p>
        <p>${escapeHtml(type.description)}</p>
        <dl style="margin-top: var(--space-3);">
          <dt style="color: var(--text-secondary);">Governance Level</dt>
          <dd style="margin-bottom: var(--space-2);">${escapeHtml(type.governanceLevel)}</dd>
          <dt style="color: var(--text-secondary);">Frequency</dt>
          <dd style="margin-bottom: var(--space-2);">${escapeHtml(type.frequency)}</dd>
          <dt style="color: var(--text-secondary);">Seats</dt>
          <dd style="margin-bottom: var(--space-2);">${escapeHtml(String(type.totalSeats))}</dd>
          <dt style="color: var(--text-secondary);">Voting Method</dt>
          <dd style="margin-bottom: var(--space-2);">${escapeHtml(type.votingMethod)}</dd>
          <dt style="color: var(--text-secondary);">Conducted By</dt>
          <dd>${escapeHtml(type.conductedBy)}</dd>
        </dl>
        <details style="margin-top: var(--space-3);">
          <summary style="cursor: pointer; color: var(--navy); font-weight: 600;">Key Facts (${type.keyFacts.length})</summary>
          <ul style="margin-top: var(--space-2);">
            ${type.keyFacts.map((fact) => `<li style="margin-bottom: var(--space-1); color: var(--text-secondary);">${escapeHtml(fact)}</li>`).join('')}
          </ul>
        </details>
      </div>
    `,
    ).join('');
  }

  /**
   * Render the election timeline.
   */
  private renderTimeline(): void {
    const timeline = document.getElementById('timeline-content');
    if (!timeline) {
      return;
    }

    const events = getAllTimelineEvents();
    timeline.innerHTML = events.map((e) => this.renderTimelineEvent(e)).join('');
  }

  /**
   * Render a single timeline event.
   */
  private renderTimelineEvent(event: TimelineEvent): string {
    const borderColor = this.getEventBorderColor(String(event.priority));
    const bg = event.isDeadline ? 'var(--error)' : 'var(--bg-elevated)';
    const color = event.isDeadline ? 'white' : 'var(--text-secondary)';
    const label = event.isDeadline ? '⚠ Deadline' : event.priority;

    return `
      <div class="card" role="listitem" style="margin-bottom: var(--space-3); border-left: 3px solid ${borderColor};">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <h3 style="font-size: var(--text-lg); color: var(--navy);">${escapeHtml(event.title)}</h3>
          <span style="font-size: var(--text-xs); padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); background: ${bg}; color: ${color};">
            ${label}
          </span>
        </div>
        <p style="color: var(--text-muted); font-size: var(--text-sm); margin: var(--space-1) 0;">${escapeHtml(event.date)}</p>
        <p style="color: var(--text-secondary);">${escapeHtml(event.description)}</p>
      </div>
    `;
  }

  /**
   * Get border color for an event based on priority.
   */
  private getEventBorderColor(priority: string): string {
    if (priority === 'critical') {
      return 'var(--saffron)';
    }
    if (priority === 'high') {
      return 'var(--green-india)';
    }
    return 'var(--border-subtle)';
  }

  /**
   * Render the FAQ accordion.
   */
  private renderFaq(): void {
    const faqContainer = document.getElementById('faq-accordion');
    if (!faqContainer) {
      return;
    }

    faqContainer.innerHTML = ELECTION_FAQ.map(
      (faq) => `
      <details class="card" style="margin-bottom: var(--space-3);">
        <summary style="cursor: pointer; font-weight: 600; color: var(--text-primary);">
          ${escapeHtml(faq.question)}
        </summary>
        <p style="margin-top: var(--space-3); color: var(--text-secondary); line-height: 1.7;">
          ${escapeHtml(faq.answer)}
        </p>
        <p style="margin-top: var(--space-2); font-size: var(--text-xs); color: var(--text-muted);">
          Category: ${escapeHtml(faq.category)}
        </p>
      </details>
    `,
    ).join('');
  }

  /**
   * Subscribe to state changes and sync the DOM.
   */
  private subscribeToState(): void {
    store.subscribe((state) => {
      // Update stage panels
      this.updateStagePanel(state.currentStage);

      // Update a11y tab selection
      ELECTION_STAGES.forEach((stage) => {
        const tab = document.getElementById(`a11y-tab-${stage.id}`);
        if (tab) {
          const isActive = stage.id === state.currentStage;
          tab.setAttribute('aria-selected', String(isActive));
          tab.setAttribute('tabindex', isActive ? '0' : '-1');
        }
      });

      // Announce stage change
      const pos = getStagePosition(state.currentStage);
      const stage = ELECTION_STAGES.find((s) => s.id === state.currentStage);
      if (stage) {
        announce(`Now viewing stage ${pos} of 7: ${stage.title}. ${stage.subtitle}`);
      }

      // Update nav
      setActiveNavSection(state.activeSection || 'election-journey');
    });
  }

  /**
   * Set up keyboard navigation for the tab list.
   * Arrow keys move between tabs; Enter/Space activates.
   */
  private setupKeyboardNav(): void {
    this.container.addEventListener('keydown', (event) => {
      const target = event.target as HTMLElement;
      if (target.getAttribute('role') !== 'tab') {
        return;
      }

      const tabs = Array.from(this.container.querySelectorAll<HTMLElement>('[role="tab"]'));
      this.handleTabKeydown(event, target, tabs);
    });
  }

  /**
   * Handle keydown events for tab navigation.
   */
  private handleTabKeydown(event: KeyboardEvent, target: HTMLElement, tabs: HTMLElement[]): void {
    const currentIndex = tabs.indexOf(target);
    const nextIndex = this.getNextTabIndex(event.key, currentIndex, tabs.length);

    if (nextIndex !== currentIndex && nextIndex !== -1) {
      event.preventDefault();
      tabs[nextIndex].focus();
      this.activateTab(tabs[nextIndex]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activateTab(target);
    }
  }

  /**
   * Determine the next tab index based on key press.
   */
  private getNextTabIndex(key: string, current: number, max: number): number {
    const actions: Record<string, () => number> = {
      ArrowRight: () => (current + 1) % max,
      ArrowDown: () => (current + 1) % max,
      ArrowLeft: () => (current - 1 + max) % max,
      ArrowUp: () => (current - 1 + max) % max,
      Home: () => 0,
      End: () => max - 1,
    };
    return actions[key] ? actions[key]() : -1;
  }

  /**
   * Activate the stage represented by a tab element.
   */
  private activateTab(target: HTMLElement): void {
    const stageId = target.getAttribute('data-stage-id') as JourneyStageId;
    if (stageId) {
      store.goToStage(stageId);
    }
  }
}
