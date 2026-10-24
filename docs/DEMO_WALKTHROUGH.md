# SwasthyaSetu — 5-Minute Hackathon Demonstration Walkthrough
## IMPACTX 2026 | Challenge 07: A Better Digital Health Journey

This walkthrough provides evaluators, judges, and developers with a structured, step-by-step 5-minute itinerary to inspect all 10 modules of **SwasthyaSetu**.

---

### Executive Highlights
- **Product:** Patient-Controlled Longitudinal Health Record Dossier
- **Guiding Principles:** Zero Silent Merges • Patient Consent Sovereignty • Strict Non-Diagnostic AI • Zero Raw PHI in Audit Ledgers
- **Evaluation Runner:** `npm test` executes all 5 module test suites consecutively (38/38 benchmark checks passing in ~0.3s).

---

## 5-Minute Evaluation Itinerary

```
Step 1 (0:00 - 0:45) ── Overview & Data-Driven Health Metrics
Step 2 (0:45 - 1:30) ── Health Timeline & Timestamp Conflict Verification
Step 3 (1:30 - 2:15) ── Explainable Duplicate Reconciliation (0 Silent Merges)
Step 4 (2:15 - 3:00) ── Medication Divergence Engine & Visit Dossier
Step 5 (3:00 - 3:45) ── Granular 7-Day Specialist Sharing & Instant Revocation
Step 6 (3:45 - 4:15) ── Caregiver Proxy Scoping & 30-Minute Break-Glass Resuscitation
Step 7 (4:15 - 4:45) ── Provider Clinical Corrections & Active Share Propagation
Step 8 (4:45 - 5:00) ── Privacy-Preserving AI Assistant & Factory Seed Reset
```

---

### Step 1: Overview & Data-Driven Health Metrics (0:00 - 0:45)
- **URL:** [`/`](http://localhost:3000/)
- **Role:** **Ramesh Sharma (Patient)** (default)
- **What to Observe:**
  - Notice the **Government Portal Aesthetic**: Navy navigation bar (`#0a1f38`), government orange accents (`#d9531e`), accessibility font resizer (`A-`, `A`, `A+`), and screen-reader skip links.
  - Inspect the **6 Overview Cards** driven strictly by persisted live record counts:
    - `12 Total Records`
    - `2 Need Review (Date Conflicts)`
    - `3 Potential Duplicates`
    - `1 OCR Uncertainty`
    - `2 Active Shares`
    - `1 Caregiver Access`
  - Quick action buttons allow one-click jumping to key clinical workflows.

---

### Step 2: Health Timeline & Timestamp Conflict Verification (0:45 - 1:30)
- **URL:** [`/timeline`](http://localhost:3000/timeline)
- **What to Observe:**
  - Each clinical entry segregates:
    - **Clinical Event Date** (e.g., specimen collection / exam)
    - **Report Release Date** (e.g., laboratory sign-off)
    - **Upload Timestamp** (ingestion date)
  - Click the **"Date Conflict" filter pill** or observe records flagged with orange warning banners:
    - `Liver Function Profile (LFT)`: Clinical specimen collection date occurred *after* the printed report date (human clerical error at diagnostic desk).
  - Open record [`/records/r0888888-8888-8888-8888-888888888888`](http://localhost:3000/records/r0888888-8888-8888-8888-888888888888):
    - Observe the **Handwritten Cursive Prescription Warning**: "Telmisartan dosage stroke is ambiguous (20mg vs 40mg)".
    - Notice that SwasthyaSetu marks it **Unverified** with side-by-side original image preview, preventing silent medication dosing errors.

---

### Step 3: Explainable Duplicate Reconciliation (1:30 - 2:15)
- **URL:** [`/duplicate-review`](http://localhost:3000/duplicate-review)
- **Core Clinical Guarantee:** **Zero Silent Merges.**
- **What to Observe:**
  - Three pre-classified duplicate tiers:
    1. **Exact Binary Duplicate:** SHA-256 hash match (`100% confidence`). Re-upload of identical PDF from Max Healthcare.
    2. **Near Duplicate (Xerox/Camera Scan):** Text similarity 86%, same patient/facility/date, different byte payload.
    3. **Different Longitudinal Event:** Identical HbA1c lab test name, but separate monthly collection dates (Jan 2026 vs Feb 2026).
  - Click **"Compare Side-by-Side"**:
    - Observe feature-by-feature alignment highlighting matching vs divergent attributes.
    - Test reconciliation actions: **"Keep Both Records"**, **"Keep Both & Link Record Chain"**, or **"Mark Distinct Longitudinal Events"**.
    - Notice that both records retain their independent IDs, provenance, and source files.

---

### Step 4: Medication Divergence Engine & Visit Dossier (2:15 - 3:00)
- **URL:** [`/visit-prep`](http://localhost:3000/visit-prep)
- **What to Observe:**
  - **Medication Discrepancy Alert:** Side-by-side comparison between Apollo Clinic prescription (`Metformin 500mg BID`) and Fortis Hospital discharge (`Metformin 850mg OD`).
  - Phrased neutrally without prescribing clinical judgment: *"Divergence detected in prescribed dosage schedule"*.
  - **Customizable Visit Dossier:**
    - Select target provider: **Dr. Arvind Rao (Cardiology)**.
    - Checkbox selector for records to bundle into the visit briefing.
    - Deterministic patient discussion questions auto-linked directly to source record IDs.
    - Print / Export layout ready for doctor consultations.

---

### Step 5: Granular 7-Day Specialist Sharing & Instant Revocation (3:00 - 3:45)
- **URL:** [`/share-consent`](http://localhost:3000/share-consent)
- **What to Observe:**
  - **Patient-Directed Consent Wizard:**
    - Choose recipient: **Dr. Arvind Rao (Cardiology)**.
    - Purpose: **Consultation & Treatment Continuity**.
    - **Time-bound Duration:** Defaults to **7 days** (auto-expiring).
    - **Record-Level Checkbox Scoping:** Select specific records rather than all-or-nothing dossier access.
    - **Sensitive Category Protection:** Mental health & psychiatry notes are unchecked by default.
  - Review the **Plain-Language Pre-Authorization Receipt**:
    - Includes SHA-256 cryptographic verification digest.
  - Click **"Authorize Access Grant"** to establish the active share.
  - Test **Instant Revocation:** Click "Revoke Access Immediately" on any active grant.
    - Instantly changes status to `Revoked`. Any subsequent attempt by the specialist triggers an immediate **403 Access Denied** block.

---

### Step 6: Caregiver Proxy Scoping & 30-Minute Break-Glass (3:45 - 4:15)
- **URL 1 — Caregiver Delegation:** [`/caregiver-access`](http://localhost:3000/caregiver-access)
  - Observe proxy representation for **Priya Sharma (Daughter)**.
  - Delegated category scoping: Lab reports, vital signs, and discharge summaries enabled.
  - Psychotherapy notes explicitly blocked.
  - Proxy boundary enforced: Caregivers **cannot** share patient records or revoke patient-established grants.
- **URL 2 — Emergency Break-Glass Resuscitation:** [`/emergency-access`](http://localhost:3000/emergency-access)
  - Switch to **Dr. Neha Kapoor (Emergency Clinician)** using the Demo Account Selector.
  - Reason for access: *"Acute Coronary Syndrome resuscitation; patient incapacitated"*.
  - Emergency Session bounds: **Strict 30-minute auto-terminating countdown window**.
  - Life-safety clinical records released; psychotherapy notes remain shielded.
  - Switch to **Access History (`/access-history`)**: Verify an immutable, high-priority audit event is logged with zero raw PHI disclosure.

---

### Step 7: Provider Clinical Corrections & Active Share Propagation (4:15 - 4:45)
- **URL:** [`/corrections`](http://localhost:3000/corrections)
- **What to Observe:**
  - Switch role to **Dr. Arvind Rao (Cardiologist)**:
    - Provider correction form allows submitting an amended report with explanation.
  - Switch role to **Ramesh Sharma (Patient)**:
    - Patients cannot unilaterally alter clinical records; they can only submit a **Correction Inquiry** to the issuing facility.
  - **Immutable Versioning (No Silent Deletions):**
    - The original record is marked `is_superseded: true` and points to the new Version 2.
    - Visit [`/records/r0111111-1111-1111-1111-111111111111`](http://localhost:3000/records/r0111111-1111-1111-1111-111111111111) to see the prominent **Superseded Warning Banner** and version selector.
  - **ABDM Active Share Propagation:**
    - The propagation engine automatically notifies all active consent recipients about the amendment while strictly refusing delivery to expired or revoked shares.

---

### Step 8: Privacy-Preserving AI Assistant & Factory Reset (4:45 - 5:00)
- **URL:** [`/ai-assistant`](http://localhost:3000/ai-assistant)
- **What to Observe:**
  - **Role-Scoped Clinical Answering:**
    - Ramesh (Patient) can query entire dossier; Dr. Rao (Specialist) is strictly restricted to consent-granted records.
  - **Strict Non-Diagnostic Guardrails:**
    - Test prompt: *"Do I have heart failure?"* or *"Can I stop taking Metformin?"*
    - Notice that the assistant explicitly refuses diagnosis and dosage alterations, advising in-person physician consultation.
  - **Factual Grounding & Clickable Citations:**
    - Answers cite specific records with clickable `[Record #r01...]` links leading to source documents.
- **Factory Prototype Reset:**
  - Click the **Demo Account Switcher** (top right of utility bar).
  - Click **"Reset Prototype Data to Factory Seed"**.
  - All synthetic records, duplicate reviews, consents, caregiver permissions, and emergency sessions revert to their initial demo state.

---

## Automated Benchmark Test Suite Execution

To verify all clinical logic independently via the terminal:

```bash
npm test
```

### Expected Output Matrix:
```
================================================================================
 INTEGRATION TEST RUNNER SUMMARY MATRIX
================================================================================
[PASS] Suite 1: Module 1: Explainable Duplicate & Conflict Reconciliation — 5/5 tests passed
[PASS] Suite 2: Module 2: Granular Consent, 7-Day Sharing & Instant Revocation — 7/7 tests passed
[PASS] Suite 3: Module 3: Caregiver Proxy Delegation & Emergency Break-Glass Resuscitation — 9/9 tests passed
[PASS] Suite 4: Module 4: Provider Clinical Corrections & Active Share Propagation — 9/9 tests passed
[PASS] Suite 5: Module 5: Restricted Clinical AI Assistant, Role Scoping & Safety Guardrails — 8/8 tests passed
--------------------------------------------------------------------------------
Suites Run:    5
Suites Passed: 5
Suites Failed: 0
Execution:     ~0.30s
================================================================================
✔ ALL 5 MODULE TEST SUITES (38/38 BENCHMARK CHECKS) PASSED CONSECUTIVELY.
```

---

*End of Demonstration Walkthrough — SwasthyaSetu IMPACTX 2026*
