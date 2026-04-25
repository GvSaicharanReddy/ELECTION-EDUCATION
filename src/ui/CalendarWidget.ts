/**
 * Calendar Widget — Election reminder creation UI.
 *
 * Provides a simple interface for voters to create Google Calendar
 * reminders for election deadlines and key dates.
 *
 * @module ui/CalendarWidget
 */

import { ElectionCalendarService } from '../services/calendar';
import { getDeadlineEvents } from '../data/timeline';
import { escapeHtml } from '../utils/sanitize';
import { announce } from '../utils/a11y';

/**
 * Calendar reminder widget embedded in the election coach section.
 *
 * Shows upcoming deadlines and allows one-click reminder creation
 * via Google Calendar deep links (no OAuth required for basic flow).
 */
export class CalendarWidget {
  private calendar: ElectionCalendarService;

  constructor() {
    this.calendar = new ElectionCalendarService();
    this.render();
  }

  /**
   * Render the calendar widget within the coach section.
   */
  private render(): void {
    const coach = document.getElementById('coach-panel');
    if (!coach) {
      return;
    }

    const deadlines = getDeadlineEvents();

    const widget = document.createElement('div');
    widget.id = 'calendar-widget';
    widget.className = 'card';
    widget.style.cssText = 'max-width: 640px; margin: var(--space-4) auto 0;';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Election calendar reminders powered by Google Calendar');

    widget.innerHTML = `
      <h3 style="color: var(--navy); margin-bottom: var(--space-3);">
        📅 Election Reminders
        <span style="font-size: var(--text-xs); color: var(--text-muted); font-weight: 400;">— powered by Google Calendar</span>
      </h3>
      <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4);">
        Never miss an election deadline. Click to add reminders directly to your Google Calendar.
      </p>
      <div id="calendar-deadlines" role="list" aria-label="Upcoming election deadlines">
        ${deadlines
          .slice(0, 5)
          .map(
            (event) => `
          <div role="listitem" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); border-bottom: 1px solid var(--border-subtle);">
            <div>
              <p style="font-weight: 600; font-size: var(--text-sm);">${escapeHtml(event.title)}</p>
              <p style="font-size: var(--text-xs); color: var(--text-muted);">${escapeHtml(event.date)}</p>
            </div>
            <button
              class="btn btn-secondary calendar-add-btn"
              data-title="${escapeHtml(event.title)}"
              data-date="${escapeHtml(event.date)}"
              data-description="${escapeHtml(event.reminderText)}"
              aria-label="Add ${escapeHtml(event.title)} to Google Calendar"
              style="white-space: nowrap;"
            >
              + Calendar
            </button>
          </div>
        `,
          )
          .join('')}
      </div>
    `;

    coach.appendChild(widget);
    this.setupEventListeners(widget);
  }

  /**
   * Set up click handlers for calendar add buttons.
   *
   * @param widget - The widget container element.
   */
  private setupEventListeners(widget: HTMLElement): void {
    widget.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.calendar-add-btn');
      if (!btn) {
        return;
      }

      const title = btn.getAttribute('data-title') || 'Election Reminder';
      const date = btn.getAttribute('data-date') || '';
      const description = btn.getAttribute('data-description') || '';

      // Use deep link fallback (no auth required)
      const dateStr = this.extractDateStr(date);
      this.calendar.openReminderInCalendar(title, dateStr, description);
      announce(`Opening Google Calendar to add: ${title}`);
    });
  }

  /**
   * Extract a YYYY-MM-DD date string from various date formats.
   *
   * @param dateStr - Raw date string.
   * @returns Formatted date string.
   */
  private extractDateStr(dateStr: string): string {
    // Try to find a date pattern
    const match = dateStr.match(/\d{4}-\d{2}-\d{2}/);
    if (match) {
      return match[0];
    }
    // Default to a future date
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    return future.toISOString().split('T')[0];
  }
}
