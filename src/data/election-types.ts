/**
 * All types of elections conducted in India.
 *
 * Covers Lok Sabha, Rajya Sabha, State Legislative Assembly,
 * Panchayat (three tiers), Municipal (three tiers), and By-elections.
 *
 * Data sourced from Election Commission of India (ECI) guidelines.
 *
 * @module data/election-types
 */

import { ElectionCategory, ElectionType, GovernanceLevel } from '../types/index';

/**
 * Complete catalogue of Indian election types.
 * Each entry contains governance level, frequency, voting method,
 * and key facts relevant to voter education.
 */
export const ELECTION_TYPES: readonly ElectionType[] = [
  {
    id: ElectionCategory.LOK_SABHA,
    name: 'Lok Sabha',
    fullName: 'Lok Sabha (House of the People) General Elections',
    governanceLevel: GovernanceLevel.NATIONAL,
    description:
      "The Lok Sabha is the lower house of India's Parliament. Members are directly elected by citizens through universal adult suffrage. The party or coalition with a majority forms the Central Government and its leader becomes the Prime Minister.",
    frequency: 'Every 5 years (unless dissolved earlier)',
    totalSeats: 543,
    votingMethod:
      'First Past the Post (FPTP) — direct voting via Electronic Voting Machines (EVMs) with VVPAT verification',
    conductedBy: 'Election Commission of India (ECI)',
    ageRequirement: 18,
    keyFacts: [
      'Total 543 elected constituencies across India',
      '2 seats can be nominated by the President for Anglo-Indian community (discontinued after 104th Amendment, 2020)',
      'Term of 5 years from the date of first meeting',
      'Voting age: 18 years and above',
      'Candidate minimum age: 25 years',
      'Uses Electronic Voting Machines (EVMs) with Voter Verifiable Paper Audit Trail (VVPAT)',
      'Model Code of Conduct applies from announcement of election dates',
      'NOTA (None of the Above) option available since 2013',
      'Largest democratic exercise in the world — over 900 million eligible voters',
      'Multi-phase polling conducted over several weeks',
    ],
  },
  {
    id: ElectionCategory.RAJYA_SABHA,
    name: 'Rajya Sabha',
    fullName: 'Rajya Sabha (Council of States) Elections',
    governanceLevel: GovernanceLevel.NATIONAL,
    description:
      "The Rajya Sabha is the upper house of India's Parliament. Members are elected indirectly by elected members of State Legislative Assemblies and Union Territory assemblies. It is a permanent body — not subject to dissolution — with one-third of members retiring every two years.",
    frequency: 'Biennial elections (one-third of seats every 2 years)',
    totalSeats: 245,
    votingMethod: 'Single Transferable Vote (STV) by elected MLAs — proportional representation',
    conductedBy: 'Election Commission of India (ECI)',
    ageRequirement: 18,
    keyFacts: [
      '233 elected members + 12 nominated by the President for expertise in literature, science, art, and social service',
      'Members serve 6-year terms; one-third retire every 2 years',
      'Not subject to dissolution — it is a permanent body',
      'Elected by elected members of State Legislative Assemblies (MLAs)',
      'Candidate minimum age: 30 years',
      'Uses open ballot system with Single Transferable Vote',
      "Each state's representation is proportional to its population",
      'Vice President of India serves as ex-officio Chairman',
      'Cannot introduce Money Bills but can suggest amendments',
      'Special powers to declare a subject in the State List as a matter of national importance (Article 249)',
    ],
  },
  {
    id: ElectionCategory.STATE_ASSEMBLY,
    name: 'State Assembly',
    fullName: 'State Legislative Assembly (Vidhan Sabha) Elections',
    governanceLevel: GovernanceLevel.STATE,
    description:
      'State Legislative Assembly elections determine the government of each Indian state. Voters in each constituency directly elect their Member of Legislative Assembly (MLA). The party or coalition with majority forms the state government, and its leader becomes the Chief Minister.',
    frequency: 'Every 5 years per state (schedules vary by state)',
    totalSeats: 'Varies by state (60–403 seats)',
    votingMethod: 'First Past the Post (FPTP) — direct voting via EVMs with VVPAT',
    conductedBy:
      'Election Commission of India (ECI) in coordination with State Election Commissions',
    ageRequirement: 18,
    keyFacts: [
      '28 states and 3 Union Territories (Delhi, Puducherry, J&K) have Legislative Assemblies',
      'Uttar Pradesh has the most seats (403); Sikkim and Goa among the fewest (40 and 40)',
      'Candidate minimum age: 25 years',
      'Seats reserved for Scheduled Castes (SC) and Scheduled Tribes (ST) based on population',
      'Governor may nominate 1 Anglo-Indian member (discontinued after 104th Amendment)',
      'Some states also have a Legislative Council (Vidhan Parishad) — the upper house',
      'Model Code of Conduct applies from announcement date',
      'State elections can be held simultaneously with Lok Sabha or independently',
      'EVMs and VVPATs are used across all constituencies',
      'Results determine Chief Minister and Council of Ministers for the state',
    ],
  },
  {
    id: ElectionCategory.PANCHAYAT,
    name: 'Panchayat',
    fullName: 'Panchayati Raj Institution (PRI) Elections — Village, Block & District',
    governanceLevel: GovernanceLevel.LOCAL,
    description:
      'Panchayat elections form the backbone of rural self-governance in India under the 73rd Constitutional Amendment (1992). They operate at three tiers: Gram Panchayat (village), Panchayat Samiti / Block Panchayat (block/taluk), and Zila Parishad (district). These elections empower rural citizens to choose local leaders who handle development, welfare, and public services.',
    frequency: 'Every 5 years per state (schedules managed by State Election Commissions)',
    totalSeats: 'Varies by state — over 2.5 lakh Panchayats across India',
    votingMethod:
      'Direct voting for Gram Panchayat members; indirect/direct for block and district levels (varies by state)',
    conductedBy: 'State Election Commissions (SEC) — constitutionally mandated under Article 243K',
    ageRequirement: 18,
    keyFacts: [
      'Three-tier system: Gram Panchayat (village) → Panchayat Samiti (block) → Zila Parishad (district)',
      'Gram Sabha (village assembly of all adults) is the foundation — meets at least twice a year',
      'Mandatory reservation: one-third of seats for women; SC/ST seats proportional to population',
      'Some states reserve seats for OBCs at the Panchayat level',
      'Sarpanch / Gram Pradhan heads the Gram Panchayat',
      'Panchayats handle 29 subjects listed in the Eleventh Schedule of the Constitution',
      'Subjects include agriculture, drinking water, roads, education, health, and social welfare',
      'Over 31 lakh elected Panchayat representatives across India — largest elected body network in the world',
      'Voting age: 21 years for candidacy in some states, 18 for voting',
      'State Finance Commissions recommend grants and funding for Panchayats',
    ],
  },
  {
    id: ElectionCategory.MUNICIPAL,
    name: 'Municipal',
    fullName:
      'Urban Local Body (ULB) Elections — Nagar Panchayat, Municipality & Municipal Corporation',
    governanceLevel: GovernanceLevel.LOCAL,
    description:
      'Municipal elections govern urban areas under the 74th Constitutional Amendment (1992). They operate at three levels: Nagar Panchayat (transitional/small town), Municipal Council / Nagar Palika (medium town), and Municipal Corporation / Nagar Nigam (large city). Elected councillors and mayors/chairpersons manage urban services, infrastructure, and local development.',
    frequency: 'Every 5 years per state/city (schedules managed by State Election Commissions)',
    totalSeats: 'Varies by city/town — wards determined by population',
    votingMethod:
      'Direct voting for ward councillors; Mayor/Chairperson elected directly or by councillors (varies by state)',
    conductedBy: 'State Election Commissions (SEC) — constitutionally mandated under Article 243ZA',
    ageRequirement: 18,
    keyFacts: [
      'Three-tier system: Nagar Panchayat (small town) → Municipal Council (medium town) → Municipal Corporation (large city)',
      'Mandatory reservation: one-third of seats for women; SC/ST seats proportional to population',
      'Municipalities handle 18 subjects listed in the Twelfth Schedule of the Constitution',
      'Subjects include urban planning, water supply, public health, fire services, and slum improvement',
      'Municipal Corporation is headed by a Mayor; Municipal Council by a Chairperson',
      'Ward committees are mandatory in cities with 3 lakh+ population',
      'Property tax, water tax, and other local taxes fund municipal bodies',
      'State Finance Commissions recommend revenue sharing with municipalities',
      'Some states have directly elected Mayors (e.g., Madhya Pradesh, Uttarakhand)',
      'Municipal bodies prepare city development plans and manage urban infrastructure',
    ],
  },
  {
    id: ElectionCategory.BY_ELECTION,
    name: 'By-Election',
    fullName: 'By-Elections (Upchunaav) — Parliamentary & Assembly Seat Vacancies',
    governanceLevel: GovernanceLevel.NATIONAL,
    description:
      'By-elections are held to fill vacancies that arise in Lok Sabha or State Legislative Assemblies between general elections. Vacancies occur due to death, resignation, disqualification, or election being voided by a court. By-elections follow the same rules as the original election for that constituency and must be held within 6 months of the vacancy (unless the remaining term is less than one year).',
    frequency: 'As needed — within 6 months of vacancy arising',
    totalSeats: '1 per vacancy (single constituency)',
    votingMethod: 'Same as the original election type for that seat (FPTP with EVMs and VVPAT)',
    conductedBy:
      'Election Commission of India (ECI) for Lok Sabha/Rajya Sabha; State Election Commission may assist for Assembly seats',
    ageRequirement: 18,
    keyFacts: [
      'Triggered by death, resignation, disqualification, or court-ordered voiding of an election',
      'Must be conducted within 6 months of vacancy (Section 151A of the Representation of the People Act, 1951)',
      'Exception: not required if remaining term of the house is less than one year',
      'Multiple by-elections across states may be clubbed together for logistical efficiency',
      'Same constituency boundaries and voter rolls as the last general election',
      'Model Code of Conduct applies in the specific constituency',
      'By-election winners serve only the remainder of the original term',
      "Often seen as a referendum on the ruling government's mid-term performance",
      'Can shift the balance of power in closely divided legislatures',
      'Voter turnout in by-elections is typically lower than in general elections',
    ],
  },
] as const;

/**
 * Look up a specific election type by category.
 *
 * @param category - The election category to find.
 * @returns The matching ElectionType or undefined.
 */
export function getElectionTypeById(category: ElectionCategory): ElectionType | undefined {
  return ELECTION_TYPES.find((t) => t.id === category);
}

/**
 * Filter election types by governance level.
 *
 * @param level - The governance level to filter by.
 * @returns Array of matching election types.
 */
export function getElectionTypesByLevel(level: GovernanceLevel): readonly ElectionType[] {
  return ELECTION_TYPES.filter((t) => t.governanceLevel === level);
}
