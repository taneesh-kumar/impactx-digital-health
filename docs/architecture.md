# SwasthyaSetu — System Architecture & Technical Specifications

**Challenge:** IMPACTX 2026 — A Better Digital Health Journey  
**Solution:** SwasthyaSetu (Patient-Controlled Health Records)  
**Author:** Full-Stack & Database Architecture Team  

---

## 1. Architectural Principles

1. **Patient Sovereignty & ABDM Alignment:**  
   Health data belongs solely to the patient. Providers, facilities, and proxies only receive access through explicit, purpose-bound, time-limited consent grants backed by cryptographic receipts.

2. **Chronological Integrity:**  
   Clinical dates (specimen collection, physical examination) are strictly decoupled from laboratory release dates and dossier ingestion timestamps. Missing dates are recorded as unknown without synthetic interpolation.

3. **Explainable Reconciliation (Zero Silent Merges):**  
   Records are never silently merged. The reconciliation engine separates binary hash equality (SHA-256) from semantic text overlap and distinct longitudinal events. Both records in candidate duplicate pairs preserve their identities, provenance, and original files.

4. **Honest Clinical Safety & OCR Transparency:**  
   Uncertain handwritten cursive strokes (e.g., medication dosages) are explicitly flagged with low-confidence warnings. The original image is preserved and never converted into verified clinical data without human sign-off.

5. **Row-Level Security (RLS) & Private Storage:**  
   Every database table enforces PostgreSQL Row Level Security. Protected medical files reside in private storage buckets accessible only via server-signed, short-lived URLs.

---

## 2. Technical Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | Next.js 15 (App Router) + React 19 | High-performance server/client hybrid rendering, deterministic routing |
| **Language** | Strict TypeScript 5 | End-to-end type safety across clinical schemas, DTOs, and UI |
| **Styling** | Tailwind CSS v3 | Restrained government digital-service design tokens, accessible color contrasts |
| **Icons & Design** | Lucide React | Clean, semantic iconography |
| **Database & Auth** | Supabase (PostgreSQL 15+) | Enterprise relational integrity, pgCrypto, UUIDs, RLS policies |
| **Data Storage** | Supabase Private Storage | Private S3-compatible encrypted buckets |
| **Reconciliation Engine** | Lightweight Deterministic Matcher | SHA-256 hash comparison + Jaccard token overlap + metadata heuristics |

---

## 3. Database Schema Overview (12 Core Tables)

```
[profiles]
   ▲
   │ (1:1)
   ├──────────────────────────────┐
[patients]                   [providers]
   ▲                              ▲
   │ (1:N)                        │ (1:N)
[health_records] ◄────────────────┘
   ├───────────────┬────────────────┬────────────────┐
   ▼               ▼                ▼                ▼
[record_versions] [extracted_fields] [duplicate_relationships] [correction_events]
                                                             ▲
                                                             │
[consent_grants] ◄── [consent_receipts]                      │
[caregiver_delegations]                                      │
[emergency_access_sessions]                                  │
[visit_summaries]                                            │
[audit_events] ──────────────────────────────────────────────┘
[notification_events]
```

1. **`profiles`**: User profiles with synthetic demonstration identities (patient, specialist, caregiver, emergency clinician, auditor).
2. **`patients`**: Patient MRN, demographic, allergy lists, and chronic condition arrays.
3. **`providers`**: Licensing credentials, medical specialization, hospital facility name.
4. **`record_sources`**: Trusted feeds (AIIMS HL7 Gateway, Lal PathLabs) and manual camera uploads.
5. **`health_records`**: Core health documents with distinct `clinical_event_date`, `report_date`, and `upload_timestamp`.
6. **`extracted_fields`**: Diagnostic parameters (Cholesterol, HbA1c) with confidence scores and provenance notes.
7. **`record_versions`**: Versioning history tracking clinical modifications.
8. **`duplicate_relationships`**: Side-by-side match tiers (`exact_duplicate`, `near_duplicate`, `different_event`).
9. **`consent_grants` & `consent_receipts`**: ABDM-compliant data access authorization tokens.
10. **`caregiver_delegations`**: Proxy representation permissions.
11. **`emergency_access_sessions`**: Audited break-glass emergency clinician bypass.
12. **`audit_events`**: Immutable audit trail for all read, write, export, and break-glass events.

---

## 4. Security & Compliance Posture

- **Service Role Key Isolation:** `SUPABASE_SERVICE_ROLE_KEY` is restricted exclusively to server-side route handlers and CLI migrations.
- **Demo Identity Security:** The synthetic demonstration account selector simulates role contexts for hackathon judging without bypassing production auth guards.
- **Audit Logging:** Every duplicate decision, role switch, emergency break-glass, and file upload produces an immutable record in `audit_events`.
