# Security & Data Protection Policy

**Project:** SwasthyaSetu — Patient-Controlled Health Records  
**Compliance Standard:** ABDM Sandbox & Indian Digital Personal Data Protection (DPDP) Act Guidelines  

---

## 1. Security Architecture Principles

### Zero Silent Merges
Health record merging can result in severe clinical hazards (e.g. attributed allergies, conflicting drug dosages). The system strictly forbids automated silent merges. Similar records are presented with explainable evidence for human verification, preserving both canonical files and their independent identities.

### Row-Level Security (RLS)
PostgreSQL Row-Level Security is enabled across all 12 tables storing patient, clinical, and audit data:
- Direct patient access is restricted to self-records.
- Providers can only access records governed by an active, unexpired, purpose-bound consent grant or an audited emergency break-glass session.

### Private Storage Buckets
Clinical documents (PDFs, radiographs, scanned prescriptions) are stored in private Supabase Storage buckets:
- Unauthenticated access is blocked at the storage gateway.
- Authorized users retrieve documents exclusively through short-lived, cryptographically signed URLs generated server-side.

### Service-Role Credential Segregation
- `NEXT_PUBLIC_` browser environment variables NEVER contain service-role keys.
- Administrative operations, database migrations, and synthetic seeding scripts run strictly in server-side environments using `SUPABASE_SERVICE_ROLE_KEY`.

### Audit Logging & Non-Repudiation
Every read access, consent authorization, emergency break-glass query, and duplicate review decision is immutably logged to `audit_events` with actor role, IP hash, user agent, and timestamp.

---

## 2. Reporting Security Vulnerabilities

Please report potential security or data segregation issues to the project maintainers via encrypted communication. Do not open public issues for sensitive security findings.
