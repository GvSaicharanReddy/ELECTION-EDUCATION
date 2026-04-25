/**
 * Unit tests for election data modules.
 *
 * Verifies correctness of election types, stages, timeline, and FAQ data.
 *
 * @module tests/unit/election-data.test
 */

import { describe, it, expect } from 'vitest';
import {
  ELECTION_TYPES,
  getElectionTypeById,
  getElectionTypesByLevel,
} from '../../src/data/election-types';
import {
  ELECTION_STAGES,
  getStageById,
  getNextStage,
  getPreviousStage,
  getStagePosition,
} from '../../src/data/election-stages';
import {
  ELECTION_PROCESS_MILESTONES,
  UPCOMING_ELECTION_EVENTS,
  getAllTimelineEvents,
  getTimelineByCategory,
  getDeadlineEvents,
} from '../../src/data/timeline';
import {
  ELECTION_FAQ,
  getFaqByCategory,
  getFaqByStage,
  getFaqCategories,
  searchFaq,
} from '../../src/data/faq';
import { ElectionCategory, GovernanceLevel, JourneyStageId } from '../../src/types/index';

/* ---- Election Types ---- */
describe('Election Types Data', () => {
  it('contains all 6 election categories', () => {
    expect(ELECTION_TYPES).toHaveLength(6);
    const ids = ELECTION_TYPES.map((t) => t.id);
    expect(ids).toContain(ElectionCategory.LOK_SABHA);
    expect(ids).toContain(ElectionCategory.RAJYA_SABHA);
    expect(ids).toContain(ElectionCategory.STATE_ASSEMBLY);
    expect(ids).toContain(ElectionCategory.PANCHAYAT);
    expect(ids).toContain(ElectionCategory.MUNICIPAL);
    expect(ids).toContain(ElectionCategory.BY_ELECTION);
  });

  it('every type has required fields', () => {
    for (const t of ELECTION_TYPES) {
      expect(t.name).toBeTruthy();
      expect(t.fullName).toBeTruthy();
      expect(t.description.length).toBeGreaterThan(50);
      expect(t.keyFacts.length).toBeGreaterThanOrEqual(5);
      expect(t.ageRequirement).toBe(18);
      expect(t.conductedBy).toBeTruthy();
    }
  });

  it('getElectionTypeById returns correct type', () => {
    const ls = getElectionTypeById(ElectionCategory.LOK_SABHA);
    expect(ls).toBeDefined();
    expect(ls?.name).toBe('Lok Sabha');
    expect(ls?.totalSeats).toBe(543);
  });

  it('getElectionTypeById returns undefined for invalid input', () => {
    const result = getElectionTypeById('FAKE' as ElectionCategory);
    expect(result).toBeUndefined();
  });

  it('getElectionTypesByLevel filters correctly', () => {
    const national = getElectionTypesByLevel(GovernanceLevel.NATIONAL);
    expect(national.length).toBeGreaterThanOrEqual(2);
    national.forEach((t) => {
      expect(t.governanceLevel).toBe(GovernanceLevel.NATIONAL);
    });

    const local = getElectionTypesByLevel(GovernanceLevel.LOCAL);
    expect(local.length).toBe(2); // Panchayat + Municipal
  });
});

/* ---- Election Stages ---- */
describe('Election Journey Stages', () => {
  it('contains exactly 7 stages', () => {
    expect(ELECTION_STAGES).toHaveLength(7);
  });

  it('stages are in correct order', () => {
    const expectedOrder = [
      JourneyStageId.ELIGIBILITY,
      JourneyStageId.REGISTRATION,
      JourneyStageId.CANDIDATES,
      JourneyStageId.VOTING_METHODS,
      JourneyStageId.TIMELINE,
      JourneyStageId.POLLING_DAY,
      JourneyStageId.POST_VOTE,
    ];
    const actualOrder = ELECTION_STAGES.map((s) => s.id);
    expect(actualOrder).toEqual(expectedOrder);
  });

  it('every stage has steps', () => {
    for (const stage of ELECTION_STAGES) {
      expect(stage.steps.length).toBeGreaterThanOrEqual(4);
      expect(stage.title).toBeTruthy();
      expect(stage.ariaLabel).toBeTruthy();
    }
  });

  it('getStageById finds eligibility', () => {
    const stage = getStageById(JourneyStageId.ELIGIBILITY);
    expect(stage?.title).toBe('Check Your Eligibility');
  });

  it('getNextStage returns correct stage', () => {
    const next = getNextStage(JourneyStageId.ELIGIBILITY);
    expect(next?.id).toBe(JourneyStageId.REGISTRATION);
  });

  it('getNextStage returns undefined for last stage', () => {
    expect(getNextStage(JourneyStageId.POST_VOTE)).toBeUndefined();
  });

  it('getPreviousStage returns correct stage', () => {
    const prev = getPreviousStage(JourneyStageId.REGISTRATION);
    expect(prev?.id).toBe(JourneyStageId.ELIGIBILITY);
  });

  it('getPreviousStage returns undefined for first stage', () => {
    expect(getPreviousStage(JourneyStageId.ELIGIBILITY)).toBeUndefined();
  });

  it('getStagePosition returns 1-based index', () => {
    expect(getStagePosition(JourneyStageId.ELIGIBILITY)).toBe(1);
    expect(getStagePosition(JourneyStageId.POST_VOTE)).toBe(7);
  });
});

/* ---- Timeline ---- */
describe('Election Timeline', () => {
  it('has process milestones', () => {
    expect(ELECTION_PROCESS_MILESTONES.length).toBeGreaterThanOrEqual(5);
  });

  it('has upcoming events', () => {
    expect(UPCOMING_ELECTION_EVENTS.length).toBeGreaterThanOrEqual(3);
  });

  it('getAllTimelineEvents returns sorted by priority', () => {
    const all = getAllTimelineEvents();
    expect(all.length).toBe(
      ELECTION_PROCESS_MILESTONES.length + UPCOMING_ELECTION_EVENTS.length,
    );
    // First event should be critical priority
    expect(all[0].priority).toBe('critical');
  });

  it('getDeadlineEvents returns only deadlines', () => {
    const deadlines = getDeadlineEvents();
    deadlines.forEach((d) => {
      expect(d.isDeadline).toBe(true);
    });
  });

  it('getTimelineByCategory filters correctly', () => {
    const panchayat = getTimelineByCategory(ElectionCategory.PANCHAYAT);
    panchayat.forEach((e) => {
      expect(e.electionCategory).toBe(ElectionCategory.PANCHAYAT);
    });
  });
});

/* ---- FAQ ---- */
describe('Election FAQ', () => {
  it('has at least 15 questions', () => {
    expect(ELECTION_FAQ.length).toBeGreaterThanOrEqual(15);
  });

  it('every FAQ has required fields', () => {
    for (const faq of ELECTION_FAQ) {
      expect(faq.id).toBeTruthy();
      expect(faq.question).toBeTruthy();
      expect(faq.answer.length).toBeGreaterThan(30);
      expect(faq.category).toBeTruthy();
    }
  });

  it('getFaqByCategory returns matching items', () => {
    const eligibility = getFaqByCategory('Eligibility');
    expect(eligibility.length).toBeGreaterThanOrEqual(2);
    eligibility.forEach((f) => {
      expect(f.category).toBe('Eligibility');
    });
  });

  it('getFaqByStage returns items linked to stage', () => {
    const polling = getFaqByStage(JourneyStageId.POLLING_DAY);
    expect(polling.length).toBeGreaterThanOrEqual(2);
  });

  it('getFaqCategories returns unique sorted categories', () => {
    const categories = getFaqCategories();
    expect(categories.length).toBeGreaterThanOrEqual(4);
    // Check sorted
    for (let i = 1; i < categories.length; i++) {
      expect(categories[i] >= categories[i - 1]).toBe(true);
    }
  });

  it('searchFaq finds matches', () => {
    const results = searchFaq('NOTA');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(
      results.some(
        (r) =>
          r.question.toLowerCase().includes('nota') ||
          r.answer.toLowerCase().includes('nota'),
      ),
    ).toBe(true);
  });

  it('searchFaq returns empty for empty query', () => {
    expect(searchFaq('')).toHaveLength(0);
    expect(searchFaq('   ')).toHaveLength(0);
  });

  it('searchFaq is case-insensitive', () => {
    const upper = searchFaq('VOTER ID');
    const lower = searchFaq('voter id');
    expect(upper.length).toBe(lower.length);
  });
});
