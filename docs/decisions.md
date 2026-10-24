# Architecture & Technology Decision Records (ADR)

This log records confirmed decisions as well as pending architectural and technology selections.

---

## Decision Status Summary

| ID | Topic | Status | Notes |
|---|---|---|---|
| ADR-001 | Repository Strategy | **Accepted** | Single collaborative GitHub repository for IMPACTX 2026. |
| ADR-002 | Technology Stack Selection | **Under Evaluation** | Reviewing Full-Stack TypeScript (Next.js + NestJS), Full-Stack Next.js, and Next.js + FastAPI. |
| ADR-003 | Database & Persistence Strategy | **Pending** | Relational (PostgreSQL) vs Document store vs embedded; ORM (Prisma, Drizzle, etc.). |
| ADR-004 | Authentication & Identity | **Pending** | Session vs JWT vs OAuth provider. |
| ADR-005 | Digital Health Scope & Domain Model | **Pending** | Defining the specific patient/clinical journey stage to address. |

---

## Detailed Records

### ADR-001: Centralized Repository for Hackathon
- **Status:** Accepted
- **Context:** The team requires a shared workspace to coordinate research, specifications, and eventual code development for IMPACTX 2026 Round 1.
- **Decision:** Use a single Git repository `taneesh-kumar/impactx-digital-health`.
- **Rationale:** Ensures unified history, centralized documentation, and straightforward collaboration across team members.

### ADR-002: Technology Stack Finalization
- **Status:** Under Evaluation
- **Context:** Multiple frontend and backend architectures are viable for "A Better Digital Health Journey". Tech stack must balance rapid hackathon iteration, reliability, and potential healthcare data/AI extensions.
- **Candidates:**
  1. Next.js + NestJS + PostgreSQL
  2. Next.js Full-Stack (Next.js Route Handlers + PostgreSQL)
  3. Next.js + FastAPI (Python) + PostgreSQL
- **Resolution:** Deferred until problem breakdown and feature scoping are complete. No code scaffolding will be introduced until this decision is finalized.
