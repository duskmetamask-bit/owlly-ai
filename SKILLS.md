# SKILLS.md — Owlly Knowledge Architecture

## Overview

Owlly's intelligence comes from 19 skills loaded from `lib/skills/vault/`. Every skill is a `SKILL.md` file inside a named directory. Skills are the agent's knowledge base — they define what Owlly knows about teaching, assessment, and the Australian curriculum.

## Directory Structure

```
lib/skills/vault/
├── owlly-arts/SKILL.md
├── owlly-assessment/SKILL.md
├── owlly-behaviour/SKILL.md
├── owlly-differentiation/SKILL.md
├── owlly-education/SKILL.md
├── owlly-hass/SKILL.md
├── owlly-legal/SKILL.md
├── owlly-lesson-standard/SKILL.md      ← Core: John Butler Instructional Model
├── owlly-marking/SKILL.md
├── owlly-maths/SKILL.md
├── owlly-parent/SKILL.md
├── owlly-product/SKILL.md
├── owlly-reporting/SKILL.md
├── owlly-resources/SKILL.md
├── owlly-science/SKILL.md
├── owlly-standards/SKILL.md
├── owlly-teaching/SKILL.md
├── owlly-technologies/SKILL.md
├── owlly-unit-planner/SKILL.md          ← Core: 8-week unit design framework
├── owlly-wellbeing/SKILL.md
└── owlly-writing/SKILL.md
```

**Count: 20 skills** (20 directories in `lib/skills/vault/`)

## How Skills Are Loaded

In `app/api/chat/route.ts`:

```typescript
const SKILLS_DIR = join(process.cwd(), "lib/skills/vault");

function loadAllSkills(): string {
  const skillDirs = readdirSync(SKILLS_DIR).filter(f => {
    const stat = require("fs").statSync(join(SKILLS_DIR, f));
    return stat.isDirectory();
  });
  
  const contents: string[] = [];
  for (const dir of skillDirs) {
    const content = loadSkillContent(join(SKILLS_DIR, dir));
    if (content) {
      contents.push(`\n\n=== ${dir.toUpperCase().replace("PICKLE-", "")} ===\n${content}`);
    }
  }
  return contents.join("\n");
}
```

`loadAllSkills()` is called by `buildSystemPrompt()` which builds the system prompt sent with every chat request. Skills are loaded fresh on every API call — no caching, no persistence between requests.

## Skills and the System Prompt

The system prompt is built per-request in `buildSystemPrompt(profile)`:

```
You are Owlly — expert Australian F-6 teaching assistant with full AC9 knowledge.
[STATE CONTEXT]
[JOHN BUTLER INSTRUCTIONAL MODEL — hardcoded in route.ts]
[TEACHER CONTEXT]
[LESSON PLAN REQUIREMENTS]
[RUBRIC REQUIREMENTS]
[ASSESSMENT RULES]
[SKILLS KNOWLEDGE BASE — loaded from lib/skills/vault/]
[RULES]
```

This means every skill's content is injected directly into the LLM context for every message.

## Adding a New Skill

1. Create `lib/skills/vault/owlly-[topic]/SKILL.md`
2. Format: `# SKILL.md — owlly-[topic]` followed by the skill content
3. Commit and deploy — `loadAllSkills()` picks it up automatically

**No code changes. No registration. Just deploy.**

## Skill Quality Standards

Each skill must be:
- **Curated** — specific knowledge for a teaching domain, not general text
- **Australian F-6 context** — written for Australian primary teachers
- **AC9-aligned** — includes AC9 codes where relevant
- **Classroom-ready** — practical, actionable advice, not theory
- **Structured** — clear sections, headings, and examples

## Skills vs. Static Content

| Layer | Location | Purpose |
|-------|----------|---------|
| Skills | `lib/skills/vault/` | LLM knowledge — dynamic, injected into system prompt |
| Unit Library | `data/units/` | 101 pre-built units — not yet integrated into UI |
| AC9 Data | Referenced in skills/system prompt | Curriculum codes and achievement standards |

Skills are the primary knowledge layer. Static content is referenced but not loaded dynamically.

---

*Updated: 2026-04-29 — Pure LLM architecture. Skills auto-loaded from vault.*