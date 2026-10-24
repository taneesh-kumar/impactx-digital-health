# Development & Project Setup Guide

This guide outlines prerequisites and onboarding steps for team members collaborating on **impactx-digital-health**.

---

## 1. Prerequisites

While the final tech stack is being evaluated, contributors should ensure the following core tools are installed on their machines:

- **Git**: Latest stable version
  - Verify with: `git --version`
- **Node.js**: Recommended `v20.x` or `v22.x` LTS
  - Verify with: `node -v`
- **Package Manager (pnpm / npm)**:
  - `pnpm` (recommended for monorepo projects): `npm install -g pnpm`
- **Python (Optional / Under Review)**: `3.11+` or `3.12+` (if a Python backend service is chosen)
- **Docker Desktop** (Optional): For running local containerized services (e.g., PostgreSQL).

---

## 2. Repository Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/taneesh-kumar/impactx-digital-health.git
   cd impactx-digital-health
   ```

2. **Inspect Documentation:**
   - Read the official problem statement in [`docs/problem-statement.md`](problem-statement.md).
   - Review architectural options under evaluation in [`docs/architecture.md`](architecture.md).
   - Review pending and confirmed decisions in [`docs/decisions.md`](decisions.md).
   - Review the security baseline in [`SECURITY.md`](../SECURITY.md).

---

## 3. Workflow for Stack Finalization

Once the team finalizes the technical stack and user journey scope:

1. Update [ADR-002 in `docs/decisions.md`](decisions.md) with the agreed stack.
2. Initialize the project scaffolding according to the selected structure.
3. Add root scripts (`build`, `dev`, `lint`, `test`) and environment configuration (`.env.example`).
4. Update this document with package installation and run commands.
