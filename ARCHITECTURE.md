# ARCHITECTURE.md — PickleNickAI

## Overview

PickleNickAI is a **Next.js web app** — not an agent behind the scenes. The app IS the product. Teachers interact with the web interface, which calls the LLM directly.

```
[Teacher] → [Next.js Web App] → [NVIDIA NIM / DeepSeek V3.2] → [Response]
                ↑
        [Skills loaded from lib/skills/vault/]
```

---

## The App Is the Product

PickleNickAI is a single deployed Next.js application at `pickle-nick-ai.vercel.app/owlly`.

- No separate OpenClaw agent runs the product
- No background agent layer — the web app owns all intelligence
- All conversation, lesson planning, rubric generation, auto-marking, and writing feedback flow through the Next.js API routes
- The web UI renders structured markdown responses beautifully

---

## LLM Layer

**Provider:** NVIDIA NIM  
**Endpoint:** `https://integrate.api.nvidia.com/v1/chat/completions`  
**Model:** `deepseek-ai/deepseek-v3.2`  
**Key:** `OPENAI_API_KEY` or `NIM_API_KEY` environment variable

All 19 skills are injected into the system prompt for every request. The LLM has no persistent memory between requests — each session loads fresh skills + conversation history.

---

## Knowledge Layer: Skills Vault

**Location:** `lib/skills/vault/` (19 skills)

Each skill is a `SKILL.md` file inside a named directory:
- `pickle-arts/` `pickle-assessment/` `pickle-behaviour/` `pickle-differentiation/`
- `pickle-education/` `pickle-hass/` `pickle-legal/` `pickle-lesson-standard/`
- `pickle-marking/` `pickle-maths/` `pickle-parent/` `pickle-product/`
- `pickle-reporting/` `pickle-resources/` `pickle-science/` `pickle-standards/`
- `pickle-teaching/` `pickle-technologies/` `pickle-wellbeing/` `pickle-writing/`

**How skills are loaded:** `app/api/chat/route.ts` calls `loadAllSkills()` at startup. It reads every directory in `lib/skills/vault/`, loads the `SKILL.md` from each, and concatenates them into the system prompt. Skills are auto-loaded on every deploy — no manual registration needed.

**Core skill:** `pickle-lesson-standard` contains the John Butler Primary College Instructional Model — the 7-phase explicit teaching sequence that underpins every lesson plan.

---

## Static Content

**Unit Library:** `data/units/` — 101 pre-built units (not yet fully integrated into the UI)

**AC9 Curriculum Data:** referenced in system prompts and skills, not as a separate data file

---

## Features Powered by LLM

All features call `deepseek-ai/deepseek-v3.2` via NVIDIA NIM:

| Route | Feature |
|-------|---------|
| `POST /api/chat` | Main conversational AI — all teaching topics |
| `POST /api/generate` | Lesson plan generation (7-phase explicit model) |
| `POST /api/rubric` | Assessment rubric generation |
| `POST /api/auto-mark` | Auto-marking student work against a rubric |
| `POST /api/writing-feedback` | 10-dimension writing analysis |
| `POST /api/worksheet` | Worksheet generation |
| `POST /api/lessons` | Saved lesson management |
| `POST /api/library/units` | Unit library queries |
| Export routes | PDF/DOCX/PPT generation — not LLM, file generation |

---

## API Route Architecture

```
app/api/
├── chat/route.ts              ← Main chat (streaming + non-streaming)
├── generate/route.ts          ← Lesson plan generation
├── rubric/route.ts            ← Rubric generation
├── auto-mark/route.ts         ← Auto-marking (FormData: rubric + work files)
├── writing-feedback/route.ts  ← 10-dimension writing analysis
├── worksheet/route.ts         ← Worksheet generation
├── lessons/route.ts           ← Save/load lesson plans
├── library/units/route.ts     ← Unit library queries
└── export/
    ├── chat-to-pdf/route.ts
    ├── docx/route.ts
    ├── lesson/pdf/route.ts
    ├── pdf/route.ts
    └── pptx/route.ts
```

---

## Session Model

Each teacher gets an isolated session. The UI sends `sessionId` with every request. Sessions are stored client-side (localStorage). No student data is stored anywhere — per-teacher, not per-student.

---

## Phase 2: Future Agent Features

These are planned additions (not yet implemented):
- **Email onboarding** — welcome email + setup when teachers sign up
- **Reminders** — cron-triggered emails for lesson planning, assessment deadlines
- **Proactive suggestions** — based on session history, suggest next actions
- **Telegram interface** — alternative chat interface via Telegram bot

Phase 2 converts PickleNickAI from a "chat tool" into a proactive teaching assistant. The LLM backbone remains the same.

---

## Adding a New Skill

1. Create a new directory: `lib/skills/vault/pickle-[topic]/`
2. Create `SKLE.md` inside it with the skill content
3. Commit and deploy — `loadAllSkills()` picks it up automatically

**No code changes required.** The skill system is directory-based and auto-loaded.

---

## Environment Variables

```bash
OPENAI_API_KEY=        # NVIDIA NIM key — primary
NIM_API_KEY=           # NVIDIA NIM key — fallback
```

The app falls back to demo mode if no key is configured, showing a placeholder response.

---

## Architecture Principles

1. **Pure LLM** — no agent behind the app, the app calls the LLM directly
2. **Skills as knowledge** — 19 curated skills injected into every prompt
3. **Streaming UI** — chat uses Server-Sent Events for real-time responses
4. **Per-teacher isolation** — sessionId ensures no cross-teacher data leakage
5. **Demo-friendly** — graceful fallback when no API key is configured