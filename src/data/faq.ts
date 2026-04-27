/**
 * Frequently Asked Questions about Indian Elections.
 *
 * Covers eligibility, registration, EVMs, NOTA, postal voting,
 * and common voter concerns — with answers sourced from ECI guidelines.
 *
 * @module data/faq
 */

import { FAQItem, JourneyStageId } from '../types/index';

/**
 * Complete FAQ catalogue for voter education.
 * Each item is tagged with a category and optionally linked to a journey stage.
 */
export const ELECTION_FAQ: readonly FAQItem[] = [
  /* ---- Eligibility ---- */
  {
    id: 'faq-age',
    question: 'What is the minimum age to vote in India?',
    answer:
      'You must be 18 years of age or older on the qualifying date (1st January of the year of revision of the electoral roll). For example, if the roll is revised in 2026, you must turn 18 on or before January 1, 2026.',
    category: 'Eligibility',
    relatedStageId: JourneyStageId.ELIGIBILITY,
  },
  {
    id: 'faq-nri-voting',
    question: 'Can NRIs (Non-Resident Indians) vote in Indian elections?',
    answer:
      'Yes. Since 2011, NRIs who hold Indian passports can register as overseas electors. They must be present in their constituency on polling day to vote in person. The ECI has been exploring postal ballot and e-voting options for NRIs, but as of 2025 in-person voting remains the only method.',
    category: 'Eligibility',
    relatedStageId: JourneyStageId.ELIGIBILITY,
  },
  {
    id: 'faq-criminal-record',
    question: 'Can a person with a criminal record vote?',
    answer:
      'A person in lawful custody of the police or serving a prison sentence cannot vote. However, undertrial prisoners (not yet convicted) retain their right to vote, though logistical access may be limited. A past criminal record, after sentence completion, does not disqualify a person from voting.',
    category: 'Eligibility',
    relatedStageId: JourneyStageId.ELIGIBILITY,
  },

  /* ---- Registration ---- */
  {
    id: 'faq-registration-online',
    question: 'How do I register to vote online?',
    answer:
      'Visit the National Voter Service Portal (nvsp.in) and fill out Form 6. You will need: Aadhaar number, address proof, age proof, and a passport-sized photo. You can also register through the Voter Helpline mobile app available on Google Play Store and Apple App Store.',
    category: 'Registration',
    relatedStageId: JourneyStageId.REGISTRATION,
  },
  {
    id: 'faq-multiple-registrations',
    question: 'Can I be registered in two constituencies?',
    answer:
      'No. A person can be registered in only one constituency at a time. If you move to a new address, you must transfer your registration using Form 6A (for shifting within the same constituency or to a new one). Dual registration is a punishable offence under Section 17 of the Representation of the People Act, 1950.',
    category: 'Registration',
    relatedStageId: JourneyStageId.REGISTRATION,
  },
  {
    id: 'faq-voter-id-lost',
    question: 'What if I lose my Voter ID card (EPIC)?',
    answer:
      'Apply for a duplicate EPIC through the NVSP portal or your local Electoral Registration Office. You can also vote using any of the 12 alternative ID proofs approved by the ECI, including Aadhaar, passport, driving licence, PAN card, and others.',
    category: 'Registration',
    relatedStageId: JourneyStageId.REGISTRATION,
  },

  /* ---- Voting Process ---- */
  {
    id: 'faq-evm-security',
    question: 'Are EVMs tamper-proof? Can they be hacked?',
    answer:
      'Indian EVMs are standalone machines with no network connectivity (no Wi-Fi, Bluetooth, or internet). They use one-time programmable (OTP) chips that cannot be reprogrammed. The source code is never shared externally. Additionally, the VVPAT paper trail allows physical verification of votes. The Supreme Court has upheld the reliability of EVMs in multiple rulings.',
    category: 'Voting Process',
    relatedStageId: JourneyStageId.VOTING_METHODS,
  },
  {
    id: 'faq-nota',
    question: 'What happens if NOTA gets the most votes in a constituency?',
    answer:
      'As per the current rules, even if NOTA receives the highest number of votes, the candidate with the most votes among actual candidates wins. NOTA does not lead to re-election or rejection of all candidates. The Supreme Court has recommended that the ECI consider rules for such scenarios, but no law has been enacted yet.',
    category: 'Voting Process',
    relatedStageId: JourneyStageId.VOTING_METHODS,
  },
  {
    id: 'faq-postal-ballot',
    question: 'Who can vote by postal ballot?',
    answer:
      "Postal ballot (Electronically Transmitted Postal Ballot System — ETPBS) is available to: (a) service voters (armed forces, paramilitary, diplomats); (b) voters on election duty; (c) voters above 80 years of age; (d) persons with disabilities (PwD); (e) voters under preventive detention; and (f) COVID-19 positive/quarantined persons (as per ECI's COVID protocols).",
    category: 'Voting Process',
    relatedStageId: JourneyStageId.VOTING_METHODS,
  },

  /* ---- Polling Day ---- */
  {
    id: 'faq-booth-find',
    question: 'How do I find my assigned polling booth?',
    answer:
      'You can find your polling booth through: (a) the Voter Helpline App; (b) the NVSP portal (nvsp.in) by searching with your EPIC number or personal details; (c) SMS — send "EPIC <your voter ID number>" to 1950; or (d) the voter information slip delivered to your home by the Booth Level Officer (BLO) before election day.',
    category: 'Polling Day',
    relatedStageId: JourneyStageId.POLLING_DAY,
  },
  {
    id: 'faq-id-proofs',
    question: 'What ID proofs can I use at the polling booth?',
    answer:
      'The ECI accepts 12 photo ID proofs: (1) EPIC/Voter ID; (2) Aadhaar; (3) Passport; (4) Driving Licence; (5) PAN Card; (6) Service ID (Govt./PSU employees); (7) Bank/Post Office Passbook with Photo; (8) MNREGA Job Card; (9) Health Insurance Smart Card (RSBY); (10) Pension Document with Photo; (11) NPR Smart Card; (12) Official ID issued by MP/MLA/MLC.',
    category: 'Polling Day',
    relatedStageId: JourneyStageId.POLLING_DAY,
  },
  {
    id: 'faq-voting-time',
    question: 'What are the voting hours?',
    answer:
      'Polling booths are typically open from 7:00 AM to 6:00 PM. In some regions (like the Northeast), booths may close at 4:00 PM or 5:00 PM due to security or logistical reasons. If you are in the queue before the closing time, you will be allowed to vote even after the official closing hour.',
    category: 'Polling Day',
    relatedStageId: JourneyStageId.POLLING_DAY,
  },
  {
    id: 'faq-employer-leave',
    question: 'Can my employer refuse to give me leave on polling day?',
    answer:
      'No. Under Section 135B of the Representation of the People Act, 1951, every employer must grant paid leave to employees on polling day. Denying leave is a punishable offence with imprisonment up to 500 days or a fine. The leave applies to all employees — public and private sector.',
    category: 'Polling Day',
    relatedStageId: JourneyStageId.POLLING_DAY,
  },

  /* ---- Post-Vote ---- */
  {
    id: 'faq-results-where',
    question: 'Where can I see election results?',
    answer:
      "Official results are published in real-time on results.eci.gov.in and through the ECI's social media channels. Major news channels (Doordarshan, NDTV, Times Now, etc.) also provide live coverage. Constituency-wise results are declared throughout counting day.",
    category: 'After Voting',
    relatedStageId: JourneyStageId.POST_VOTE,
  },
  {
    id: 'faq-election-petition',
    question: 'Can I challenge election results?',
    answer:
      'Yes. Any voter or defeated candidate can file an election petition in the High Court within 45 days of the result. Grounds include corrupt practices (bribery, undue influence), non-compliance with election law, or improper acceptance/rejection of nominations. The High Court can order a recount or declare the election void.',
    category: 'After Voting',
    relatedStageId: JourneyStageId.POST_VOTE,
  },

  /* ---- Election Types ---- */
  {
    id: 'faq-panchayat-who',
    question: 'Who conducts Panchayat elections?',
    answer:
      'Panchayat elections are conducted by the State Election Commission (SEC) of each state, not the ECI. This is mandated by Article 243K of the Constitution (73rd Amendment, 1992). Each state has its own SEC with an independent State Election Commissioner.',
    category: 'Election Types',
  },
  {
    id: 'faq-rajya-sabha-vote',
    question: 'Can ordinary citizens vote in Rajya Sabha elections?',
    answer:
      'No. Rajya Sabha members are elected by the elected members of State Legislative Assemblies (MLAs) using the Single Transferable Vote system with proportional representation. Citizens do not vote directly in Rajya Sabha elections. However, the 12 nominated members are appointed by the President.',
    category: 'Election Types',
  },
  {
    id: 'faq-by-election-when',
    question: 'When is a by-election held?',
    answer:
      'A by-election must be held within 6 months of a vacancy arising in a Lok Sabha or State Assembly seat (due to death, resignation, disqualification, or court order). The exception: if the remaining term of the house is less than one year, a by-election is not mandatory (Section 151A, Representation of the People Act, 1951).',
    category: 'Election Types',
  },
] as const;

/**
 * Get FAQ items by category.
 *
 * @param category - Category name to filter by.
 * @returns Matching FAQ items.
 */
export function getFaqByCategory(category: string): readonly FAQItem[] {
  return ELECTION_FAQ.filter((f) => f.category === category);
}

/**
 * Get FAQ items related to a specific journey stage.
 *
 * @param stageId - The journey stage ID.
 * @returns FAQ items linked to that stage.
 */
export function getFaqByStage(stageId: JourneyStageId): readonly FAQItem[] {
  return ELECTION_FAQ.filter((f) => f.relatedStageId === stageId);
}

/**
 * Get all unique FAQ categories.
 *
 * @returns Sorted array of unique category names.
 */
export function getFaqCategories(): readonly string[] {
  const categories = new Set(ELECTION_FAQ.map((f) => f.category));
  return [...categories].sort();
}

/**
 * Search FAQs by keyword in question or answer text.
 *
 * @param query - Search query string (case-insensitive).
 * @returns Matching FAQ items.
 */
export function searchFaq(query: string): readonly FAQItem[] {
  const normalised = query.toLowerCase().trim();
  if (!normalised) {
    return [];
  }
  return ELECTION_FAQ.filter(
    (f) =>
      f.question.toLowerCase().includes(normalised) || f.answer.toLowerCase().includes(normalised),
  );
}
