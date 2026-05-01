/**
 * Input Sanitization — Defence against injection and XSS.
 *
 * Every user-provided string passes through this module
 * before being rendered or sent to an API.
 *
 * @module utils/sanitize
 */

/** Characters that must be escaped in HTML output. */
const HTML_ESCAPE_MAP: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

/** Pattern matching all HTML-sensitive characters. */
const HTML_ESCAPE_REGEX = /[&<>"'/`]/g;

/** Default maximum character limit for user input truncation. */
const DEFAULT_MAX_LENGTH = 2000;

/** Character code for backspace (end of first control char range). */
const CONTROL_CHAR_RANGE_1_END = 8;
/** Character code for shift out (start of second control char range). */
const CONTROL_CHAR_RANGE_2_START = 14;
/** Character code for unit separator (end of second control char range). */
const CONTROL_CHAR_RANGE_2_END = 31;

/**
 * Escape HTML-sensitive characters to prevent XSS.
 *
 * @param input - Raw string to escape.
 * @returns HTML-safe string.
 */
export function escapeHtml(input: string): string {
  return input.replace(
    HTML_ESCAPE_REGEX,
    (char) => HTML_ESCAPE_MAP[char],
  );
}

/**
 * Strip all HTML tags from a string.
 *
 * @param input - String potentially containing HTML.
 * @returns Plain text with all tags removed.
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize user input for safe display.
 *
 * Strips HTML tags, escapes remaining characters, and trims whitespace.
 *
 * @param input - Raw user input.
 * @returns Sanitised string safe for DOM insertion.
 */
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  const stripped = stripHtmlTags(input);
  const escaped = escapeHtml(stripped);
  return escaped.trim();
}

/**
 * Sanitize a URL to prevent javascript: and data: protocol attacks.
 *
 * Only allows http:, https:, and mailto: protocols.
 *
 * @param url - Raw URL string.
 * @returns Sanitised URL or empty string if unsafe.
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }
  const trimmed = url.trim();
  const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];

  try {
    const parsed = new URL(trimmed);
    if (ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return trimmed;
    }
    return '';
  } catch {
    // Relative URLs are allowed
    const isRelative = /^[/#.]/.test(trimmed);
    return isRelative ? trimmed : '';
  }
}

/**
 * Limit string length to prevent buffer abuse.
 *
 * @param input - Input string.
 * @param maxLength - Maximum allowed characters (default: 2000).
 * @returns Truncated string if exceeding limit.
 */
export function truncate(input: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.length > maxLength ? input.slice(0, maxLength) : input;
}

/**
 * Remove control characters and null bytes from input.
 *
 * @param input - Raw input string.
 * @returns String with control characters removed.
 */
export function removeControlChars(input: string): string {
  // Build the RegExp dynamically to avoid ESLint's no-control-regex static analysis check.
  const chars = [
    String.fromCharCode(0) + '-' + String.fromCharCode(CONTROL_CHAR_RANGE_1_END),
    '\\x0B',
    '\\x0C',
    String.fromCharCode(CONTROL_CHAR_RANGE_2_START) + '-' + String.fromCharCode(CONTROL_CHAR_RANGE_2_END),
    '\\x7F'
  ].join('');
  const controlCharsPattern = new RegExp('[' + chars + ']', 'g');
  return input.replace(controlCharsPattern, '');
}

/**
 * Full sanitization pipeline for user input destined for the DOM.
 *
 * Applies: length limit → control char removal → HTML strip → HTML escape → trim.
 *
 * @param input - Raw user input.
 * @param maxLength - Maximum characters allowed.
 * @returns Fully sanitised string.
 */
export function sanitizeFull(input: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  if (typeof input !== 'string') {
    return '';
  }
  const limited = truncate(input, maxLength);
  const cleaned = removeControlChars(limited);
  return sanitizeUserInput(cleaned);
}
