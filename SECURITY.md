# Security and Privacy Policy

## 1. Overview

The **IMPACTX 2026: A Better Digital Health Journey** repository is an academic/hackathon software project.

Given the digital health context, security and data privacy are core design principles that must be maintained across all development phases.

---

## 2. Baseline Privacy Rules

### Never Commit Real Patient Data
- **Zero Real Health Data:** Under no circumstances should real personal health information (PHI), personally identifiable information (PII), patient names, medical record numbers, or live clinical notes ever be introduced to this repository.
- **Synthesized Data Only:** Any health records, clinical scenarios, or journey states used during testing or demos must be entirely synthetic and explicitly labeled as mock/demonstration data.

### Compliance Notice
- The application skeleton provided at this stage is an **initial technical foundation** and has not been certified for compliance with health-data privacy regulations (e.g., HIPAA, GDPR, HITECH, or local health regulations).
- Regulatory compliance and privacy architectures must be formally evaluated during subsequent design phases.

---

## 3. Secret and Credential Management

- **No Committed Secrets:** Do not commit database passwords, API tokens, encryption keys, or authentication secrets to Git.
- **Environment Files:**
  - `.env` files are excluded by `.gitignore`.
  - Only safe, non-sensitive default placeholders are stored in `.env.example`.
- **Pre-commit Self-Audit:** Developers should review diffs before staging to confirm no credentials or private connection strings are included.

---

## 4. Reporting a Vulnerability or Privacy Concern

If you discover a security vulnerability or potential privacy leak in this repository:

1. **Do not create a public GitHub issue.**
2. Report the vulnerability privately to the repository owner:
   - Repository Owner: **taneesh-kumar**
   - Provide a clear description of the issue and reproduction steps.
3. The maintainers will acknowledge receipt within 48 hours and work on remediation prior to any public disclosure.
