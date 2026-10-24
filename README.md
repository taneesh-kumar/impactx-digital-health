# SwasthyaSetu — Patient-Controlled Health Records

> **IMPACTX 2026 Challenge Prototype** | A Better Digital Health Journey  
> **Repository:** `impactx-digital-health`

---

## Overview

**SwasthyaSetu** is an explainable, patient-controlled digital health platform built for the IMPACTX 2026 Challenge. It empowers patients to organize, verify, and securely share longitudinal clinical records across healthcare providers and diagnostic centers while maintaining zero silent merges, transparent provenance, and strict cryptographic audit trails aligned with India's Ayushman Bharat Digital Mission (ABDM).

---

## Key Capabilities Implemented

### 1. Longitudinal Health Timeline & Provenance (Prompt 2)
- **Chronological Segregation:** Strict independence between `clinical_event_date` (specimen draw / exam), `report_date` (lab release stamp), and `upload_timestamp`.
- **Date Discrepancy Auditing:** Transparent detection and flagging of sample-to-release timestamp conflicts without synthetic interpolation.
- **Replaceable OCR Safety Adapter:** Automated detection of handwritten cursive ambiguity in prescriptions; preserves original documents and marks uncertain fields as unverified to prevent silent medication errors.
- **Complete Ingestion Provenance:** Origin attribution tracking issuing facilities, NABL accreditation, and digital feed channels.

### 2. Explainable Duplicate & Conflict Review (Prompt 3)
- **Zero Silent Merges:** Never automatically merges clinical records.
- **Multi-Tier Detection:** Separates exact binary hash matches (SHA-256) from near-duplicate Xerox/mobile scans and distinct longitudinal monthly encounters.
- **Side-by-Side Reconciliation UI:** Highlights matching vs conflicting clinical parameters with explainable rationale.
- **Reproducible Benchmark Suite:** Measured on labelled ground-truth evaluation pairs:
  - **Dataset Size:** 5 ground-truth clinical pairs
  - **Precision:** 100.0%
  - **Recall:** 100.0%
  - **False Merges (FP):** 0

### 3. Government-Style Shell & Overview (Prompt 1)
- Compact utility header with screen reader accessibility, font resizer, and language selector.
- SwasthyaSetu branding bar with global search and responsive primary navy navigation.
- **Data-Driven Overview Cards:** Exact alignment with persisted data:
  - 12 Total Records
  - 2 Need Review (Date Conflicts)
  - 3 Potential Duplicates
  - 1 OCR Uncertainty
  - 2 Active Shares
  - 1 Caregiver Access
- **Demonstration Identity Switcher:** Simulated personas (Patient, Specialist, Caregiver, Emergency Clinician, Auditor) with clear non-bypass prototype labels.

### 4. Enterprise Database & Security Foundation (Prompt 0)
- **12 PostgreSQL Tables** with UUID primary keys, foreign keys, and indexes.
- **Row-Level Security (RLS)** enabled across all protected tables.
- **Safe Environment Handling:** Server-only secret keys isolated from client-accessible bundles.
- **Reproducible Migrations & Seed:** `supabase/migrations/20261024000001_initial_schema.sql` and `supabase/seed.sql`.

---

## Quick Start & Verification

### Prerequisites
- Node.js v20+ or v24
- npm v10+

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run explainable duplicate detection benchmark tests
npm test

# 3. Build optimized production bundle
npm run build

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

---

## Project Structure

```
├── docs/
│   └── architecture.md            # System architecture & technical specs
├── scripts/
│   └── test-duplicate-engine.mjs  # Benchmark evaluation test runner
├── src/
│   ├── app/
│   │   ├── page.tsx               # Overview dashboard (Data-driven stats)
│   │   ├── timeline/              # Longitudinal health timeline
│   │   ├── records/               # Documents directory & record detail views
│   │   ├── duplicate-review/      # Explainable side-by-side reconciliation
│   │   ├── share-consent/         # ABDM consent manager
│   │   ├── visit-prep/            # Outpatient clinical briefing generator
│   │   ├── emergency-access/      # Break-glass clinical bypass
│   │   ├── caregiver-access/      # Family proxy delegation
│   │   ├── corrections/           # Clinical correction tracking
│   │   ├── ai-assistant/          # Privacy-preserving dossier assistant
│   │   └── access-history/        # Immutable audit trail
│   ├── components/
│   │   ├── shell/                 # AppShell, DemoAccountSelector, Breadcrumbs
│   │   └── ui/                    # Reusable UI primitives (Button, Table, Dialog, etc.)
│   └── lib/
│       ├── data/                  # Seed dataset matching database seed
│       ├── duplicate-engine/      # Explainable detector & benchmark evaluation
│       ├── ocr/                   # Replaceable OCR adapter
│       ├── state/                 # Persistent demonstration context & audit logger
│       └── supabase/              # Client, server helpers, and database types
├── supabase/
│   ├── migrations/                # 20261024000001_initial_schema.sql
│   └── seed.sql                   # 12-record synthetic demonstration seed
├── .env.example                   # Safe environment template
├── PROJECT_STATUS.md              # Detailed implementation checklist
└── README.md
```
