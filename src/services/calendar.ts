/**
 * Google Calendar Integration — Election reminder creation.
 *
 * Creates calendar events for election deadlines, registration cutoffs,
 * polling days, and preparation milestones.
 * Uses OAuth2 with least-privilege scope (calendar.events).
 *
 * @module services/calendar
 */

import { CalendarEventRequest, CalendarEventResponse, ApiResponse } from '../types/index';
import { sanitizeFull } from '../utils/sanitize';

/** OAuth scope required — minimal write access to events only. */
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

/** Google Calendar API base URL. */
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Google Calendar service for election reminders.
 *
 * Manages OAuth authentication and event CRUD operations.
 * Falls back to Google Calendar deep-link creation when OAuth is unavailable.
 */
export class ElectionCalendarService {
  private readonly clientId: string;
  private readonly apiKey: string;
  private accessToken: string | null;
  private tokenExpiry: number;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID || '';
    this.apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || '';
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * Check if Google Calendar credentials are configured.
   *
   * @returns True if at least the client ID or API key is present.
   */
  isConfigured(): boolean {
    return this.clientId.length > 0 || this.apiKey.length > 0;
  }

  /**
   * Check if the user is authenticated with Google Calendar.
   *
   * @returns True if a valid access token exists.
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiry;
  }

  /**
   * Initiate OAuth2 consent flow for Google Calendar access.
   *
   * Opens a popup window for Google sign-in with minimal scope.
   * The access token is extracted from the redirect URL fragment.
   *
   * @returns True if authentication succeeded.
   */
  async authenticate(): Promise<boolean> {
    if (!this.clientId) {
      return false;
    }

    const redirectUri = window.location.origin;
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', CALENDAR_SCOPE);
    authUrl.searchParams.set('prompt', 'consent');

    return new Promise((resolve) => {
      const popup = window.open(
        authUrl.toString(),
        'google-calendar-auth',
        'width=500,height=600',
      );

      if (!popup) {
        resolve(false);
        return;
      }

      const interval = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(interval);
            resolve(false);
            return;
          }

          const hash = popup.location.hash;
          if (hash.includes('access_token')) {
            const params = new URLSearchParams(hash.slice(1));
            const token = params.get('access_token');
            const expiresIn = parseInt(params.get('expires_in') || '3600', 10);

            if (token) {
              this.accessToken = token;
              this.tokenExpiry = Date.now() + expiresIn * 1000;
              popup.close();
              clearInterval(interval);
              resolve(true);
            }
          }
        } catch {
          // Cross-origin — wait for redirect
        }
      }, 500);

      // Timeout after 2 minutes
      setTimeout(() => {
        clearInterval(interval);
        if (!popup.closed) {
          popup.close();
        }
        resolve(false);
      }, 120000);
    });
  }

  /**
   * Create a Google Calendar event for an election reminder.
   *
   * @param request - Event details.
   * @returns API response with the created event or error.
   */
  async createEvent(
    request: CalendarEventRequest,
  ): Promise<ApiResponse<CalendarEventResponse>> {
    if (!this.isAuthenticated()) {
      return {
        ok: false,
        data: null,
        error: 'Not authenticated with Google Calendar. Please sign in first.',
        status: 401,
      };
    }

    const sanitisedSummary = sanitizeFull(request.summary, 200);
    const sanitisedDescription = sanitizeFull(request.description, 1000);

    const event = {
      summary: sanitisedSummary,
      description: sanitisedDescription,
      start: {
        dateTime: request.startDateTime,
        timeZone: request.timeZone || 'Asia/Kolkata',
      },
      end: {
        dateTime: request.endDateTime,
        timeZone: request.timeZone || 'Asia/Kolkata',
      },
      reminders: request.reminders,
    };

    try {
      const response = await fetch(
        `${CALENDAR_API_BASE}/calendars/primary/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        },
      );

      if (!response.ok) {
        return {
          ok: false,
          data: null,
          error: `Calendar API error: ${response.status}`,
          status: response.status,
        };
      }

      const data = (await response.json()) as CalendarEventResponse;
      return { ok: true, data, error: null, status: response.status };
    } catch {
      return {
        ok: false,
        data: null,
        error: 'Failed to create calendar event. Please try again.',
        status: 0,
      };
    }
  }

  /**
   * Generate a Google Calendar deep link for creating an event.
   *
   * This is the zero-auth fallback — opens Google Calendar in a new tab
   * with pre-filled event details. No OAuth required.
   *
   * @param title - Event title.
   * @param date - Date string (YYYY-MM-DD).
   * @param description - Event description.
   * @returns Google Calendar event creation URL.
   */
  generateCalendarLink(title: string, date: string, description: string): string {
    const sanitisedTitle = sanitizeFull(title, 200);
    const sanitisedDesc = sanitizeFull(description, 500);
    const formattedDate = date.replace(/-/g, '');

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', sanitisedTitle);
    url.searchParams.set('dates', `${formattedDate}/${formattedDate}`);
    url.searchParams.set('details', sanitisedDesc);
    url.searchParams.set('ctz', 'Asia/Kolkata');

    return url.toString();
  }

  /**
   * Create a quick election reminder using the deep-link fallback.
   *
   * @param title - Reminder title.
   * @param date - Date (YYYY-MM-DD).
   * @param description - Reminder details.
   */
  openReminderInCalendar(
    title: string,
    date: string,
    description: string,
  ): void {
    const link = this.generateCalendarLink(title, date, description);
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  /**
   * Revoke access and clear tokens.
   */
  signOut(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
  }
}
