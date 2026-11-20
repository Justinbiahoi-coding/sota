<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Sota Web Development Directives (Taste Skill & Member 4 Role)

## Context & Assignment
- **Owner:** Tuấn (Member 4) — Responsible for Layout, Homepage, Souvenir Store, User Account, and the Full Sota Web Interface for PA4.
- **Full Web Spec:** Refer to `../docs/Dac_ta_Giao_dien_Toan_Web_Sota.md` and `../docs/Tong_hop_du_an.md`.
- **Taste Skill:** Refer to `../.agents/skills/design-taste-frontend/SKILL.md`.

## Core Technical & Aesthetic Rules
1. **White Cube Gallery Aesthetics:**
   - Background: Warm gallery white / parchment (`bg-background` / `#fcfbf9`).
   - Typography: Serif headings (`font-heading`, Newsreader/Fraunces), clean Sans body (`font-sans`), Monospace metadata (`font-mono`, `placard`).
   - Borders & Shadows: Fine razor borders (`border border-border/70`), no fuzzy glow shadows, no neon gradients, no over-rounded corners.
2. **Mock Data Reliance:**
   - Until backend Express API connects, use rich mock data from `@/lib/mock-data`.
   - Ensure all interactive features (search, filter, cart additions, modal popups, simulated checkout) work interactively on client state/localStorage.
3. **Quality Standards:**
   - Every interactive flow must handle Empty, Loading, and Success states.
   - 100% responsive down to 360px mobile viewport without horizontal overflow.
   - Clean TypeScript, zero build/lint errors.

