# IMPACTX 2026 — A Better Digital Health Journey

Repository documentation and project foundation for the **IMPACTX 2026** (Round 1) hackathon project.

- **Hackathon:** IMPACTX 2026
- **Round:** Round 1
- **Official Problem Statement:** "A Better Digital Health Journey"
- **GitHub Repository:** `impactx-digital-health`
- **Repository Owner:** `taneesh-kumar`

---

## Current Status: Documentation & Planning Phase

> [!NOTE]
> **No code implementations or framework skeletons are committed.**  
> The tech stack, architectural patterns, domain scope, and user journeys are currently under active evaluation. This repository houses project documentation, decision tracking, and security/privacy guidelines ahead of technical finalization.

---

## Documentation Index

Comprehensive documentation is maintained in the [`docs/`](docs) directory:

- [**Problem Statement**](docs/problem-statement.md): The official problem statement as provided for IMPACTX 2026.
- [**Architecture Considerations**](docs/architecture.md): High-level system goals, evaluation criteria, and candidate technology stacks under review.
- [**Decisions Log**](docs/decisions.md): Architecture Decision Records (ADR) tracking finalized and pending choices.
- [**Development Setup**](docs/development-setup.md): General onboarding, environment preparation, and next steps once the stack is locked.
- [**Security Policy**](SECURITY.md): Baseline rules for handling health data, credentials, and responsible disclosure.

---

## Proposed Tech Stack (Under Evaluation)

The team is reviewing several candidate stacks. One leading candidate includes:

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** NestJS (Node.js/TypeScript) or FastAPI (Python)
- **Data Layer:** PostgreSQL with Prisma ORM
- **Package Management:** pnpm workspaces (if monorepo)

*Final decisions will be documented in [docs/decisions.md](docs/decisions.md) before code implementation begins.*

---

## Security & Privacy Baseline

Because this project addresses digital health:
1. **Zero Real Patient Data:** Real personal health information (PHI) or personally identifiable information (PII) will never be accepted or stored in this repository.
2. **Credential Hygiene:** No API keys, credentials, or production tokens should ever be committed.
3. See [SECURITY.md](SECURITY.md) for complete details.
