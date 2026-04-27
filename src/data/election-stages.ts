/**
 * Election Journey Stages — Step-by-step voter education content.
 *
 * Defines the 7 stages every Indian voter navigates from checking
 * eligibility through casting their vote and beyond.
 *
 * @module data/election-stages
 */

import { JourneyStage, JourneyStageId } from '../types/index';

/**
 * The complete election journey in sequential order.
 * Each stage contains detailed, actionable steps for Indian voters.
 */
export const ELECTION_STAGES: readonly JourneyStage[] = [
  {
    id: JourneyStageId.ELIGIBILITY,
    title: 'Check Your Eligibility',
    subtitle: 'Am I eligible to vote in Indian elections?',
    description:
      'Every Indian citizen aged 18 or above on the qualifying date is eligible to vote, provided they are registered in the electoral roll. Learn the requirements and verify your status.',
    icon: '✓',
    color: '#FF9933',
    ariaLabel: 'Stage 1: Check your eligibility to vote in Indian elections',
    steps: [
      {
        order: 1,
        title: 'Age Requirement',
        description:
          'You must be 18 years or older on the qualifying date (1st January of the year of revision of the electoral roll). Citizens turning 18 on or before this date are eligible.',
      },
      {
        order: 2,
        title: 'Citizenship',
        description:
          'You must be a citizen of India. Persons who are not citizens, or who have voluntarily acquired citizenship of another country, are not eligible.',
      },
      {
        order: 3,
        title: 'Residency',
        description:
          'You must be a "ordinary resident" of the constituency where you wish to vote. This means you must have lived at your address for at least 6 months or have it as your permanent address.',
      },
      {
        order: 4,
        title: 'Mental Fitness',
        description:
          'A person declared of unsound mind by a competent court is not eligible to be enrolled as a voter.',
      },
      {
        order: 5,
        title: 'Not Disqualified',
        description:
          'You must not be disqualified under any law relating to corrupt practices and electoral offences.',
      },
      {
        order: 6,
        title: 'Verify Your Status Online',
        description:
          'Visit the National Voter Service Portal (NVSP) or the Voter Helpline App to check if you are already registered in the electoral roll.',
        actionLabel: 'Check on NVSP',
        actionUrl: 'https://www.nvsp.in/',
      },
    ],
  },
  {
    id: JourneyStageId.REGISTRATION,
    title: 'Register to Vote',
    subtitle: 'How to get your name on the electoral roll',
    description:
      'Voter registration is the first concrete step. You can register online via the NVSP portal, through the Voter Helpline App, or at your nearest Electoral Registration Office using Form 6.',
    icon: '📝',
    color: '#FFFFFF',
    ariaLabel: 'Stage 2: Register to vote — how to enrol in the electoral roll',
    steps: [
      {
        order: 1,
        title: 'Online Registration via NVSP',
        description:
          'Visit the National Voter Service Portal (nvsp.in) and fill out Form 6 online. You will need your Aadhaar number, address proof, and a passport-sized photograph.',
        actionLabel: 'Register Online',
        actionUrl: 'https://www.nvsp.in/Forms/Forms/form6',
      },
      {
        order: 2,
        title: 'Voter Helpline App',
        description:
          'Download the "Voter Helpline" app from Google Play Store or Apple App Store. Register using your mobile number, fill Form 6, and upload required documents.',
      },
      {
        order: 3,
        title: 'Offline Registration',
        description:
          'Visit your nearest Electoral Registration Office (ERO) or Booth Level Officer (BLO). Collect Form 6, fill it in, attach documents, and submit in person.',
      },
      {
        order: 4,
        title: 'Required Documents',
        description:
          'You need: (a) Age proof — birth certificate, school leaving certificate, or Aadhaar; (b) Address proof — ration card, utility bill, bank passbook, or Aadhaar; (c) Passport-sized photograph.',
      },
      {
        order: 5,
        title: 'Electoral Photo Identity Card (EPIC)',
        description:
          'After successful registration, you will receive your EPIC (Voter ID card). This is your primary identification at the polling booth. You can also use 12 other approved ID proofs.',
      },
      {
        order: 6,
        title: 'Update Existing Registration',
        description:
          'If you have moved to a new address, use Form 6A to shift your registration. For corrections to name, photo, or details, use Form 8.',
        actionLabel: 'Update Details on NVSP',
        actionUrl: 'https://www.nvsp.in/Forms/Forms/form8',
      },
    ],
  },
  {
    id: JourneyStageId.CANDIDATES,
    title: 'Understand Candidates & Parties',
    subtitle: 'Making an informed voting decision',
    description:
      'Learn how to research candidates, read affidavits, understand party manifestos, and use official resources to make an informed choice at the ballot.',
    icon: '🏛️',
    color: '#138808',
    ariaLabel: 'Stage 3: Understand candidates and political parties before voting',
    steps: [
      {
        order: 1,
        title: 'Candidate Affidavits',
        description:
          'Every candidate must file a sworn affidavit with the ECI disclosing criminal cases, assets, liabilities, and educational qualifications. These are public documents.',
        actionLabel: 'View on MyNeta',
        actionUrl: 'https://myneta.info/',
      },
      {
        order: 2,
        title: 'Party Manifestos',
        description:
          'Political parties release manifestos outlining their policies, promises, and vision. Compare manifestos across parties for issues you care about.',
      },
      {
        order: 3,
        title: 'Election Symbols',
        description:
          'Each party and independent candidate is assigned an election symbol by the ECI. Learn to recognise the symbols of candidates in your constituency.',
      },
      {
        order: 4,
        title: 'Know Your Constituency',
        description:
          'Find out which Lok Sabha and State Assembly constituency you belong to. Use the Voter Helpline App or the NVSP portal to check your constituency details.',
      },
      {
        order: 5,
        title: 'ADR & Election Watch',
        description:
          "The Association for Democratic Reforms (ADR) provides independent analysis of candidates' criminal and financial backgrounds.",
        actionLabel: 'Visit ADR',
        actionUrl: 'https://adrindia.org/',
      },
    ],
  },
  {
    id: JourneyStageId.VOTING_METHODS,
    title: 'Voting Methods',
    subtitle: 'How votes are cast and counted in India',
    description:
      'India uses Electronic Voting Machines (EVMs) verified by Voter Verifiable Paper Audit Trail (VVPAT). Learn about EVMs, postal ballots, and the counting process.',
    icon: '🗳️',
    color: '#000080',
    ariaLabel: 'Stage 4: Voting methods — EVMs, VVPAT, postal ballots, and counting',
    steps: [
      {
        order: 1,
        title: 'Electronic Voting Machines (EVMs)',
        description:
          'India uses M3 EVMs (third generation) manufactured by BEL and ECIL. Each EVM has a Ballot Unit (voter-facing), Control Unit (with polling officer), and VVPAT printer.',
      },
      {
        order: 2,
        title: 'VVPAT Verification',
        description:
          'The Voter Verifiable Paper Audit Trail (VVPAT) prints a slip showing the candidate name and symbol after you press the button. The slip is visible for 7 seconds before it drops into a sealed box.',
      },
      {
        order: 3,
        title: 'NOTA Option',
        description:
          'Since 2013, every EVM includes a "None of the Above" (NOTA) button. If you choose NOTA, your vote is counted but does not go to any candidate. NOTA cannot cause a candidate to lose even if it gets the most votes.',
      },
      {
        order: 4,
        title: 'Postal Ballot (ETPB)',
        description:
          'Service voters (armed forces, diplomats), persons on election duty, voters above 80 years of age, PwD voters, and COVID-19 affected persons can vote by postal ballot. Apply through Form 12.',
      },
      {
        order: 5,
        title: 'Proxy Voting',
        description:
          'Classified service voters (armed forces in active service) can appoint a proxy to vote on their behalf in their home constituency.',
      },
      {
        order: 6,
        title: 'Counting Process',
        description:
          'Counting happens at designated counting centres under strict security. EVMs are matched against a record of votes cast. VVPAT slips from 5 randomly selected booths per constituency are cross-verified.',
      },
    ],
  },
  {
    id: JourneyStageId.TIMELINE,
    title: 'Election Timeline',
    subtitle: 'Key dates, deadlines & preparation milestones',
    description:
      'Elections follow a structured timeline: from the announcement of dates by the ECI, through nominations, campaigning, silence period, polling, counting, and results. Stay on track with every deadline.',
    icon: '📅',
    color: '#FF9933',
    ariaLabel: 'Stage 5: Election timeline — dates, deadlines, and milestones',
    steps: [
      {
        order: 1,
        title: 'Announcement of Schedule',
        description:
          'The ECI announces the election schedule including key dates for each phase. The Model Code of Conduct comes into effect immediately upon announcement.',
      },
      {
        order: 2,
        title: 'Nomination Filing',
        description:
          'Candidates file nomination papers with the Returning Officer within the specified window (typically 7–10 days after announcement). A security deposit is required.',
      },
      {
        order: 3,
        title: 'Scrutiny of Nominations',
        description:
          'The Returning Officer scrutinises all nominations within one day of the last filing date. Invalid nominations are rejected with stated reasons.',
      },
      {
        order: 4,
        title: 'Withdrawal of Candidacy',
        description:
          'Candidates may withdraw their nomination up to 2 days after scrutiny. After this, the final list of contesting candidates is published.',
      },
      {
        order: 5,
        title: 'Campaign Period',
        description:
          'Active campaigning runs until 48 hours before polling day. Parties and candidates hold rallies, distribute literature, and run media campaigns within ECI expenditure limits.',
      },
      {
        order: 6,
        title: 'Silence Period (48 hours)',
        description:
          'All campaigning must stop 48 hours before polling. This "silence period" allows voters to make their decision free from last-minute pressure.',
      },
      {
        order: 7,
        title: 'Polling Day',
        description:
          'Voting takes place between 7:00 AM and 6:00 PM (may vary). After the last voter in the queue casts their vote, EVMs are sealed and transported to counting centres.',
      },
      {
        order: 8,
        title: 'Counting & Results',
        description:
          'Counting typically begins 2–3 days after the last phase of polling. Results are declared constituency-by-constituency throughout the day on the ECI website.',
      },
    ],
  },
  {
    id: JourneyStageId.POLLING_DAY,
    title: 'Polling Day Guide',
    subtitle: 'What to expect at the polling booth',
    description:
      'A step-by-step walkthrough of polling day: from arriving at your booth, to identity verification, receiving the ballot, casting your vote, and getting your indelible ink mark.',
    icon: '🏫',
    color: '#138808',
    ariaLabel: 'Stage 6: Polling day guide — step-by-step at the booth',
    steps: [
      {
        order: 1,
        title: 'Locate Your Polling Booth',
        description:
          'Your polling booth is assigned based on your address. Find it using the Voter Helpline App, NVSP portal, or your voter information slip delivered by the BLO.',
        actionLabel: 'Find Your Booth',
        actionUrl: 'https://electoralsearch.eci.gov.in/',
      },
      {
        order: 2,
        title: 'Carry Valid ID Proof',
        description:
          'Carry your EPIC (Voter ID card) or one of the 12 approved alternative IDs: Aadhaar, passport, driving licence, PAN card, service ID (government employees), bank passbook with photo, etc.',
      },
      {
        order: 3,
        title: 'Queue & Identity Check',
        description:
          'Join the queue at your designated booth. A polling officer will verify your identity by checking your name on the electoral roll and matching your photo ID.',
      },
      {
        order: 4,
        title: 'Indelible Ink Mark',
        description:
          'After identity verification, indelible ink is applied to your left index finger. This prevents duplicate voting and cannot be easily removed for 48–72 hours.',
      },
      {
        order: 5,
        title: 'Receive Ballot & Vote',
        description:
          "The presiding officer will direct you to the EVM inside the voting compartment. Press the button next to your chosen candidate's name and symbol. The VVPAT slip will be visible for 7 seconds.",
      },
      {
        order: 6,
        title: 'Exit & Voter Helpline',
        description:
          'After voting, leave the booth quietly. If you faced any issues (intimidation, machine malfunction, denial of vote), report immediately to the Presiding Officer or call the Voter Helpline at 1950.',
      },
    ],
  },
  {
    id: JourneyStageId.POST_VOTE,
    title: 'After You Vote',
    subtitle: 'Track results, verify, and stay engaged',
    description:
      "Your civic duty doesn't end at the polling booth. Learn how to track results, understand the government formation process, file complaints if needed, and stay engaged in democracy between elections.",
    icon: '📊',
    color: '#000080',
    ariaLabel: 'Stage 7: After voting — results, government formation, and civic engagement',
    steps: [
      {
        order: 1,
        title: 'Track Election Results',
        description:
          'Results are declared on counting day on the ECI website (results.eci.gov.in), Doordarshan, and major news channels. Results are declared constituency-by-constituency.',
        actionLabel: 'ECI Results Portal',
        actionUrl: 'https://results.eci.gov.in/',
      },
      {
        order: 2,
        title: 'Government Formation',
        description:
          'The party or coalition with a simple majority (272+ seats in Lok Sabha) is invited to form the government. The leader of the majority party is sworn in as Prime Minister by the President.',
      },
      {
        order: 3,
        title: 'File Election Complaints',
        description:
          'If you witnessed electoral malpractice (booth capturing, bribery, voter intimidation), file a complaint with the ECI through the cVIGIL app or contact your District Election Officer.',
        actionLabel: 'Download cVIGIL',
        actionUrl: 'https://play.google.com/store/apps/details?id=in.eci.cvigil',
      },
      {
        order: 4,
        title: 'Demand for Recount',
        description:
          'A candidate can demand a recount if the margin of victory is very small. VVPAT slips from 5 randomly selected booths per constituency are mandatorily verified.',
      },
      {
        order: 5,
        title: 'RTI for Election Data',
        description:
          'You can file Right to Information (RTI) requests with the ECI for election data, spending reports, and compliance records.',
      },
      {
        order: 6,
        title: 'Stay Civically Engaged',
        description:
          "Democracy is a continuous process. Attend Gram Sabha meetings, track your elected representative's performance, participate in public hearings, and vote in every election — local and national.",
      },
    ],
  },
] as const;

/**
 * Look up a journey stage by its identifier.
 *
 * @param id - The stage ID to find.
 * @returns The matching JourneyStage or undefined.
 */
export function getStageById(id: JourneyStageId): JourneyStage | undefined {
  return ELECTION_STAGES.find((s) => s.id === id);
}

/**
 * Get the next stage in the journey sequence.
 *
 * @param currentId - The current stage ID.
 * @returns The next JourneyStage or undefined if at the last stage.
 */
export function getNextStage(currentId: JourneyStageId): JourneyStage | undefined {
  const index = ELECTION_STAGES.findIndex((s) => s.id === currentId);
  if (index === -1 || index >= ELECTION_STAGES.length - 1) {
    return undefined;
  }
  return ELECTION_STAGES[index + 1];
}

/**
 * Get the previous stage in the journey sequence.
 *
 * @param currentId - The current stage ID.
 * @returns The previous JourneyStage or undefined if at the first stage.
 */
export function getPreviousStage(currentId: JourneyStageId): JourneyStage | undefined {
  const index = ELECTION_STAGES.findIndex((s) => s.id === currentId);
  if (index <= 0) {
    return undefined;
  }
  return ELECTION_STAGES[index - 1];
}

/**
 * Get the 1-based position of a stage in the journey.
 *
 * @param id - The stage ID.
 * @returns The position (1–7), or -1 if not found.
 */
export function getStagePosition(id: JourneyStageId): number {
  const index = ELECTION_STAGES.findIndex((s) => s.id === id);
  return index === -1 ? -1 : index + 1;
}
