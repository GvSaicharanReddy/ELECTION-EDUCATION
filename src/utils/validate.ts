/**
 * Input Validation — Typed validators for election-related inputs.
 *
 * All validators return a structured ValidationResult with
 * field-specific error messages.
 *
 * @module utils/validate
 */

import { ValidationResult, ElectionCategory, JourneyStageId } from '../types/index';
import { sanitizeUserInput } from './sanitize';

/** Allowlist of valid election categories. */
const VALID_CATEGORIES = new Set<string>(Object.values(ElectionCategory));

/** Allowlist of valid journey stage IDs. */
const VALID_STAGE_IDS = new Set<string>(Object.values(JourneyStageId));

/** Minimum age required to vote in Indian elections. */
const VOTING_AGE = 18;

/** Maximum allowed length for coach queries. */
const MAX_QUERY_LENGTH = 2000;

/** Maximum realistic human age for validation. */
const MAX_VALID_AGE = 150;

/**
 * Validate an election coach query from the user.
 *
 * Rules: non-empty, 1–2000 characters, no HTML.
 *
 * @param query - Raw user query string.
 * @returns Validation result with sanitised value if valid.
 */
export function validateCoachQuery(query: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof query !== 'string') {
    return { isValid: false, errors: ['Query must be a string.'] };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    errors.push('Query cannot be empty.');
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    errors.push('Query must be 2000 characters or fewer.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedValue: sanitizeUserInput(trimmed),
  };
}

/**
 * Validate an election category identifier.
 *
 * @param category - Value to validate.
 * @returns Validation result.
 */
export function validateElectionCategory(category: unknown): ValidationResult {
  if (typeof category !== 'string') {
    return { isValid: false, errors: ['Election category must be a string.'] };
  }

  if (!VALID_CATEGORIES.has(category)) {
    return {
      isValid: false,
      errors: [
        `Invalid election category "${category}". Valid categories: ${[...VALID_CATEGORIES].join(', ')}.`,
      ],
    };
  }

  return { isValid: true, errors: [], sanitizedValue: category };
}

/**
 * Validate a journey stage identifier.
 *
 * @param stageId - Value to validate.
 * @returns Validation result.
 */
export function validateStageId(stageId: unknown): ValidationResult {
  if (typeof stageId !== 'string') {
    return { isValid: false, errors: ['Stage ID must be a string.'] };
  }

  if (!VALID_STAGE_IDS.has(stageId)) {
    return {
      isValid: false,
      errors: [`Invalid stage ID "${stageId}". Valid stages: ${[...VALID_STAGE_IDS].join(', ')}.`],
    };
  }

  return { isValid: true, errors: [], sanitizedValue: stageId };
}

/**
 * Validate a voter's age input.
 *
 * @param age - Age value to validate.
 * @returns Validation result with eligibility message.
 */
export function validateVoterAge(age: unknown): ValidationResult {
  if (typeof age !== 'number' || Number.isNaN(age)) {
    return { isValid: false, errors: ['Age must be a valid number.'] };
  }

  const numericErrors = getNumericAgeErrors(age);
  if (numericErrors.length > 0) {
    return { isValid: false, errors: numericErrors };
  }

  const isEligible = age >= VOTING_AGE;
  const waitYears = VOTING_AGE - age;

  return {
    isValid: true,
    errors: [],
    sanitizedValue: isEligible
      ? `You are ${age} years old. You are eligible to vote!`
      : `You are ${age} years old. You must be ${VOTING_AGE} or older to vote. You will be eligible in ${waitYears} year(s).`,
  };
}

/**
 * Check age for numeric bounds and format errors.
 */
function getNumericAgeErrors(age: number): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(age)) {
    errors.push('Age must be a whole number.');
  }
  if (age < 0 || age > MAX_VALID_AGE) {
    errors.push('Age must be between 0 and 150.');
  }
  return errors;
}

/**
 * Validate a PIN code (Indian postal code).
 *
 * @param pincode - Value to validate (6-digit Indian PIN code).
 * @returns Validation result.
 */
export function validatePinCode(pincode: unknown): ValidationResult {
  if (typeof pincode !== 'string') {
    return { isValid: false, errors: ['PIN code must be a string.'] };
  }

  const trimmed = pincode.trim();
  const PIN_REGEX = /^[1-9]\d{5}$/;

  if (!PIN_REGEX.test(trimmed)) {
    return {
      isValid: false,
      errors: ['PIN code must be a 6-digit number starting with a non-zero digit (e.g., 110001).'],
    };
  }

  return { isValid: true, errors: [], sanitizedValue: trimmed };
}

/**
 * Validate an EPIC (Voter ID) number.
 *
 * @param epicNumber - Value to validate.
 * @returns Validation result.
 */
export function validateEpicNumber(epicNumber: unknown): ValidationResult {
  if (typeof epicNumber !== 'string') {
    return { isValid: false, errors: ['EPIC number must be a string.'] };
  }

  const trimmed = epicNumber.trim().toUpperCase();
  const EPIC_REGEX = /^[A-Z]{3}\d{7}$/;

  if (!EPIC_REGEX.test(trimmed)) {
    return {
      isValid: false,
      errors: ['EPIC number must be 3 uppercase letters followed by 7 digits (e.g., ABC1234567).'],
    };
  }

  return { isValid: true, errors: [], sanitizedValue: trimmed };
}
