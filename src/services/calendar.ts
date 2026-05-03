/**
 * Google Calendar Deep-Link Service — Election Reminder Generator.
 *
 * Generates Google Calendar event deep-links for critical election
 * dates, registration deadlines, polling days, and counting day.
 * No OAuth required — opens Google Calendar in a new tab with
 * pre-filled event details for one-click reminder creation.
 *
 * @module services/calendar
 */

import { sanitizeForApi } from '../utils/sanitize';

/* ---- Types ---- */

/** A civic calendar reminder event. */
export interface ElectionReminder {
  readonly title: string;
  readonly description: string;
  readonly startDate: string; // ISO 8601: YYYY-MM-DD
  readonly endDate?: string; // ISO 8601: YYYY-MM-DD
  readonly isDeadline: boolean;
  readonly category: 'registration' | 'polling' | 'counting' | 'deadline' | 'general';
}

/* ---- Date Helpers ---- */

/** Length of the ISO 8601 date portion (YYYY-MM-DD = 10 chars). */
const ISO_DATE_LENGTH = 10;

/** Number of days ahead for the registration deadline reminder. */
const REGISTRATION_OFFSET_DAYS = 30;

/** Number of days ahead for polling day reminder. */
const POLLING_OFFSET_DAYS = 45;

/** Number of days ahead for counting day reminder (polling + 4). */
const COUNTING_OFFSET_DAYS = 49;

/** Number of days ahead for model code of conduct enforcement reminder. */
const MCC_OFFSET_DAYS = 30;

/**
 * Compute a future ISO date string relative to today.
 *
 * @param offsetDays - Number of days from today.
 * @returns ISO 8601 date string (YYYY-MM-DD).
 */
function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, ISO_DATE_LENGTH);
}

/* ---- Constants ---- */

/** Pre-defined civic election reminders with dynamically computed dates. */
export const ELECTION_REMINDERS: readonly ElectionReminder[] = [
  {
    title: '📝 Voter Registration Deadline — Check Eligibility',
    description:
      'Last date to register as a new voter or update your voter details using Form 6 at nvsp.in. ' +
      'Check your status: https://electoralsearch.eci.gov.in | Helpline: 1950',
    startDate: getRelativeDate(REGISTRATION_OFFSET_DAYS),
    isDeadline: true,
    category: 'registration',
  },
  {
    title: '🗳️ Polling Day — Cast Your Vote',
    description:
      'Election day! Carry your EPIC card or any of the 12 approved photo IDs. ' +
      'Find your booth: https://electoralsearch.eci.gov.in | Helpline: 1950. ' +
      'Remember: voting is your constitutional right under Article 326.',
    startDate: getRelativeDate(POLLING_OFFSET_DAYS),
    isDeadline: false,
    category: 'polling',
  },
  {
    title: '📊 Vote Counting Day — Track Results',
    description:
      'Official vote counting begins. Follow live results at: https://results.eci.gov.in. ' +
      'Results are final and declared by the Election Commission of India.',
    startDate: getRelativeDate(COUNTING_OFFSET_DAYS),
    isDeadline: false,
    category: 'counting',
  },
  {
    title: '📋 Model Code of Conduct Enforcement Begins',
    description:
      'From this date, the Model Code of Conduct (MCC) is in force. ' +
      'All political parties and candidates must comply with ECI guidelines.',
    startDate: getRelativeDate(MCC_OFFSET_DAYS),
    isDeadline: true,
    category: 'deadline',
  },
];


/** Maximum length for calendar event titles. */
const CALENDAR_TITLE_MAX_LENGTH = 200;

/** Maximum length for calendar event descriptions. */
const CALENDAR_DESC_MAX_LENGTH = 1000;

/* ---- Service ---- */

/**
 * Google Calendar integration for election civic reminders.
 *
 * Generates one-click Google Calendar deep-links that let voters
 * add election deadlines, polling day, and counting day to their
 * personal calendar without requiring any app installation.
 */
export class ElectionCalendarService {
  /**
   * Generate a Google Calendar deep-link for an election reminder.
   *
   * The link opens Google Calendar in a new tab with all event
   * details pre-filled. No authentication required.
   *
   * @param reminder - Election reminder event details.
   * @returns Google Calendar add-event URL string.
   */
  generateCalendarLink(reminder: ElectionReminder): string {
    const safeTitle = sanitizeForApi(reminder.title, CALENDAR_TITLE_MAX_LENGTH);
    const safeDesc = sanitizeForApi(reminder.description, CALENDAR_DESC_MAX_LENGTH);

    // Format: YYYYMMDD for all-day events
    const startFormatted = this.formatDateForCalendar(reminder.startDate);
    const endFormatted = reminder.endDate
      ? this.formatDateForCalendar(reminder.endDate)
      : this.getNextDay(reminder.startDate);

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: safeTitle,
      dates: `${startFormatted}/${endFormatted}`,
      details: safeDesc,
      src: 'election-saathi-india',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Get all predefined election reminders.
   *
   * @returns Array of all civic election reminder events.
   */
  getAllReminders(): readonly ElectionReminder[] {
    return ELECTION_REMINDERS;
  }

  /**
   * Get reminders filtered by category.
   *
   * @param category - Reminder category to filter by.
   * @returns Filtered reminders.
   */
  getRemindersByCategory(category: ElectionReminder['category']): readonly ElectionReminder[] {
    return ELECTION_REMINDERS.filter((r) => r.category === category);
  }

  /**
   * Format a YYYY-MM-DD date string into YYYYMMDD for Google Calendar.
   *
   * @param date - ISO date string.
   * @returns Compact date string for Calendar URL.
   */
  private formatDateForCalendar(date: string): string {
    return date.replace(/-/g, '');
  }

  /**
   * Compute the next day after a given date for all-day event end.
   *
   * @param date - ISO date string (YYYY-MM-DD).
   * @returns Next day formatted as YYYYMMDD.
   */
  private getNextDay(date: string): string {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().slice(0, ISO_DATE_LENGTH);
    return next.replace(/-/g, '');
  }
}
