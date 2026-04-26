# Election Saathi India 🇮🇳

An interactive, AI-powered civic education web application designed to guide Indian voters through every step of the election process. Built with a "DOM-first" architecture combining a cinematic 3D WebGL journey with rigorous WCAG 2.1 AA accessibility and seven integrated Google Cloud services.

[![CI/CD Pipeline](https://github.com/python7188/ELECTION-SAATHI-INDIA/actions/workflows/ci.yml/badge.svg)](https://github.com/python7188/ELECTION-SAATHI-INDIA/actions)

**🚀 Live Application:** [https://election-saathi-india-djda3etlsa-uc.a.run.app](https://election-saathi-india-djda3etlsa-uc.a.run.app)

---

## ✨ Key Features

- **Cinematic 3D Journey:** Procedurally generated WebGL scenes mapping the 7 stages of an Indian election — zero external assets, ultra-lightweight payload.
- **Accessible DOM Mirror:** 100% WCAG 2.1 AA compliant fallback layer, fully synchronised with the 3D scene for screen readers and keyboard users.
- **Official Election Helpdesk (Gemini AI):** Context-aware conversational assistant powered by Google Gemini function calling — answers voter questions, checks eligibility, and routes to specialist tools.
- **Semantic FAQ Search (Vertex AI):** Uses Google Cloud Vertex AI `text-embedding-004` model to find the most relevant FAQ answer through cosine similarity matching.
- **Multi-Language Support (Cloud Translation):** Translates election guidance into 8 Indian regional languages (Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, Gujarati, Malayalam) via Google Cloud Translation API v2.
- **Polling Booth Locator (Google Maps):** Integrated Google Maps Platform for searching polling booths, district election offices, and voter registration centres.
- **Election Reminders (Google Calendar):** One-click Google Calendar deep-links for voter registration deadlines, polling day, and result day — no OAuth required.
- **Query Analytics (Natural Language API + Firestore):** Anonymised query intent classification using Google Cloud Natural Language API, with aggregate logging to Google Cloud Firestore via REST.

---

## 🔧 Google Cloud Services Integrated

| Service | Purpose | Module |
|---|---|---|
| **Google Gemini AI** | Conversational election coaching with function calling | `src/services/gemini.ts` |
| **Google Vertex AI** | Semantic FAQ matching via `text-embedding-004` embeddings | `src/services/vertex.ts` |
| **Cloud Translation API** | Multi-language civic guidance (8 Indian languages) | `src/services/translation.ts` |
| **Google Maps Platform** | Polling booth and election office locator | `src/services/maps.ts` |
| **Google Calendar** | Election reminder deep-links (no OAuth) | `src/services/calendar.ts` |
| **Cloud Natural Language API** | Voter query intent classification and entity extraction | `src/services/analytics.ts` |
| **Cloud Firestore** | Anonymised analytics event logging via REST API | `src/services/analytics.ts` |

---

## 🏗️ Technology Stack

- **Core:** HTML5, CSS3, TypeScript (strict)
- **Graphics:** Three.js (procedural geometries, custom shaders)
- **AI & Cloud:** Google Gemini, Vertex AI, Cloud Translation, Maps, Calendar, Natural Language API, Firestore
- **Tooling:** Vite, Vitest, TypeScript compiler, ESLint, Prettier, Playwright
- **Deployment:** Google Cloud Run via Docker + nginx

---

## 📁 Project Structure

```
src/
├── data/       # Static content — FAQ, timeline, election stages, types
├── scene/      # 3D WebGL implementation (ElectionScene, geometry, shaders)
├── services/   # All Google Cloud API clients (Gemini, Vertex, Maps, Translation, Calendar, Analytics)
├── state/      # Reactive singleton store (Observer pattern)
├── types/      # Shared TypeScript types and interfaces
├── ui/         # DOM layer (Coach panel, translation, maps, calendar widgets)
└── utils/      # Security sanitization, a11y helpers, caching, validation
tests/
├── integration/# End-to-end user journey and state synchronization tests
└── unit/       # Unit tests for all services, data modules, and utilities
```

---

## ⚙️ Setup and Installation

### Prerequisites

- Node.js 20+
- Google Cloud account with the relevant APIs enabled

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/python7188/ELECTION-SAATHI-INDIA.git
   cd ELECTION-SAATHI-INDIA
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   # Linux/macOS
   cp .env.example .env
   # Windows PowerShell
   Copy-Item .env.example .env
   ```
   Edit `.env` and add your Google Cloud API keys.

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local Vite development server |
| `npm run build` | TypeScript check + production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run all unit and integration tests (Vitest) |
| `npm run test:coverage` | Run tests with code coverage report |
| `npm run lint` | ESLint on all TypeScript source files |
| `npm run typecheck` | TypeScript compiler check (no emit) |
| `npm run validate` | Gatekeeper: typecheck + lint + all tests |

---

## 🏛️ Architecture Highlights

### DOM-First Design
The accessible DOM (`#accessible-fallback`) is the absolute source of truth. The 3D scene is a progressive enhancement. If WebGL is unavailable or `prefers-reduced-motion` is set, the app degrades gracefully to a standard accessible website with full functionality.

### Security Posture
- Strict Content Security Policy (CSP) in `index.html` and `nginx.conf`
- Every user input processed through `sanitizeFull()` (HTML escaping + tag stripping + URI validation + control char removal)
- Zero `innerHTML` usage — DOM-first rendering throughout
- API keys loaded exclusively from environment variables

### Offline Resilience
Every Google Cloud service has a graceful degradation path:
- **Gemini:** Static keyword-matched responses for 8 common voter topics
- **Vertex AI:** Keyword-based FAQ fallback when embeddings unavailable
- **Translation:** Returns original text when API key absent or request fails
- **Maps:** Returns sample polling locations when API unavailable
- **Calendar:** Always works — uses pure URL deep-links, no API required
- **Analytics:** Fail-silent — never blocks the voter experience

---

## 📊 Test Coverage

| Metric | Coverage | Threshold |
|---|---|---|
| Statements | 93%+ | ≥80% |
| Branches | 87%+ | ≥70% |
| Functions | 98%+ | ≥80% |
| Lines | 93%+ | ≥80% |

217 unit and integration tests across 9 test suites.

---

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for the full threat model, mitigations, and vulnerability reporting policy.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
