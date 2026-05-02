/**
 * Election Timeline — Key dates and deadlines.
 *
 * Contains general election milestones and sample upcoming dates
 * for multiple election categories across India.
 *
 * @module data/timeline
 */

import { ElectionCategory, TimelineEvent, TimelinePriority } from '../types/index';

/**
 * Generic election process milestones applicable to most Indian elections.
 * These represent the standard sequence after ECI announces dates.
 */
export const ELECTION_PROCESS_MILESTONES: readonly TimelineEvent[] = [
  {
    id: 'milestone-announcement',
    title: 'Election Schedule Announced',
    description:
      'The Election Commission announces dates for all phases. Model Code of Conduct comes into immediate effect.',
    date: 'T-45 to T-60 days before polling',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.CRITICAL,
    isDeadline: false,
    reminderText: 'Election dates announced! Model Code of Conduct is now in effect.',
  },
  {
    id: 'milestone-nomination-start',
    title: 'Nomination Filing Opens',
    description:
      'Candidates begin filing nominations with the Returning Officer along with security deposit and affidavit.',
    date: 'T-30 to T-35 days',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.HIGH,
    isDeadline: false,
    reminderText: 'Nomination period has begun for candidates.',
  },
  {
    id: 'milestone-nomination-end',
    title: 'Last Date for Nominations',
    description:
      'Final day to file nomination papers. Late submissions are not accepted under any circumstances.',
    date: 'T-25 to T-28 days',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.CRITICAL,
    isDeadline: true,
    reminderText: 'Nomination deadline today! Candidates must file papers by end of day.',
  },
  {
    id: 'milestone-scrutiny',
    title: 'Scrutiny of Nominations',
    description:
      'Returning Officers examine all nominations for compliance. Invalid nominations are rejected.',
    date: 'T-24 to T-26 days',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.MEDIUM,
    isDeadline: false,
    reminderText:
      'Nomination scrutiny underway. Check if your constituency candidates are finalised.',
  },
  {
    id: 'milestone-withdrawal',
    title: 'Last Date for Withdrawal',
    description:
      'Final day for candidates to withdraw nominations. After this, the candidate list is final.',
    date: 'T-22 to T-24 days',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.HIGH,
    isDeadline: true,
    reminderText: 'Withdrawal deadline. Final candidate list will be published after today.',
  },
  {
    id: 'milestone-campaign-peak',
    title: 'Campaign Period Peak',
    description:
      'Active campaigning with rallies, door-to-door canvassing, media ads, and social media outreach. Expenditure limits enforced.',
    date: 'T-10 to T-20 days',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.MEDIUM,
    isDeadline: false,
    reminderText: 'Campaign period active. Research candidates and review manifestos.',
  },
  {
    id: 'milestone-silence',
    title: 'Campaign Silence Period Begins',
    description:
      'All campaigning must stop 48 hours before polling. No rallies, no campaign ads, no public canvassing.',
    date: 'T-2 days (48 hours before polling)',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.CRITICAL,
    isDeadline: true,
    reminderText: 'Silence period begins. No more campaigning. Make your voting decision.',
  },
  {
    id: 'milestone-polling',
    title: 'Polling Day',
    description:
      'Cast your vote between 7:00 AM and 6:00 PM at your assigned polling booth. Carry valid ID proof.',
    date: 'T-0 (Polling Day)',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.CRITICAL,
    isDeadline: true,
    reminderText: 'POLLING DAY! Go to your booth, carry your Voter ID, and cast your vote.',
  },
  {
    id: 'milestone-counting',
    title: 'Counting Day & Results',
    description:
      'Votes are counted at designated centres. VVPAT verification for 5 random booths per constituency. Results declared throughout the day.',
    date: 'T+2 to T+5 days after last polling phase',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.HIGH,
    isDeadline: false,
    reminderText: 'Counting day! Track results on results.eci.gov.in.',
  },
] as const;

/**
 * Sample upcoming election events across categories.
 * These are illustrative and should be updated with real ECI announcements.
 */
export const UPCOMING_ELECTION_EVENTS: readonly TimelineEvent[] = [
  {
    id: 'voter-registration-drive-2026',
    title: 'National Voter Registration Drive',
    description:
      'Annual Special Summary Revision of electoral rolls. New voters turning 18 by January 1, 2026 can register. Update address and photo if needed.',
    date: '2026-01-01 to 2026-01-25',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.CRITICAL,
    isDeadline: true,
    reminderText:
      'Voter registration drive! Register or update your voter details before the deadline.',
  },
  {
    id: 'state-assembly-2026',
    title: 'State Assembly Elections 2026',
    description:
      'Multiple states are due for Legislative Assembly elections in 2026. States include West Bengal, Kerala, Tamil Nadu, Assam, and Puducherry (subject to ECI schedule).',
    date: '2026 (dates to be announced by ECI)',
    electionCategory: ElectionCategory.STATE_ASSEMBLY,
    priority: TimelinePriority.HIGH,
    isDeadline: false,
    reminderText: 'State elections approaching. Check if your state is going to polls this year.',
  },
  {
    id: 'panchayat-elections-2026',
    title: 'Panchayat Elections in Multiple States',
    description:
      'Several states hold Panchayat elections in 2026 as per their 5-year cycle. Check your State Election Commission website for exact dates.',
    date: '2026 (state-specific dates)',
    electionCategory: ElectionCategory.PANCHAYAT,
    priority: TimelinePriority.HIGH,
    isDeadline: false,
    reminderText:
      'Panchayat elections in your state may be upcoming. Verify dates with your State Election Commission.',
  },
  {
    id: 'municipal-elections-2026',
    title: 'Municipal Corporation & Council Elections',
    description:
      'Urban local body elections in major cities due in 2026. Check your city municipal corporation or State Election Commission for schedules.',
    date: '2026 (city-specific dates)',
    electionCategory: ElectionCategory.MUNICIPAL,
    priority: TimelinePriority.MEDIUM,
    isDeadline: false,
    reminderText:
      'Municipal elections may be scheduled in your city. Check with your local election office.',
  },
  {
    id: 'national-voters-day-2026',
    title: "National Voters' Day",
    description:
      "Celebrated on January 25 every year (anniversary of the ECI's founding in 1950). New voters are felicitated and encouraged to participate in democracy.",
    date: '2026-01-25',
    electionCategory: ElectionCategory.LOK_SABHA,
    priority: TimelinePriority.LOW,
    isDeadline: false,
    reminderText:
      "Happy National Voters' Day! Celebrate democracy and encourage new voter registration.",
  },
] as const;

/** Memoized combined timeline result. */
let _cachedTimeline: readonly TimelineEvent[] | null = null;

/**
 * Get all timeline events sorted by priority.
 *
 * @returns Combined and priority-sorted array of all timeline events.
 */
export function getAllTimelineEvents(): readonly TimelineEvent[] {
  if (_cachedTimeline) return _cachedTimeline;

  const priorityOrder: Record<TimelinePriority, number> = {
    [TimelinePriority.CRITICAL]: 0,
    [TimelinePriority.HIGH]: 1,
    [TimelinePriority.MEDIUM]: 2,
    [TimelinePriority.LOW]: 3,
  };

  _cachedTimeline = [...ELECTION_PROCESS_MILESTONES, ...UPCOMING_ELECTION_EVENTS].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
  return _cachedTimeline;
}

/**
 * Filter timeline events by election category.
 *
 * @param category - The election category to filter by.
 * @returns Matching timeline events.
 */
export function getTimelineByCategory(category: ElectionCategory): readonly TimelineEvent[] {
  return [...ELECTION_PROCESS_MILESTONES, ...UPCOMING_ELECTION_EVENTS].filter(
    (e) => e.electionCategory === category,
  );
}

/**
 * Get only deadline events.
 *
 * @returns Timeline events that are marked as deadlines.
 */
export function getDeadlineEvents(): readonly TimelineEvent[] {
  return [...ELECTION_PROCESS_MILESTONES, ...UPCOMING_ELECTION_EVENTS].filter((e) => e.isDeadline);
}
