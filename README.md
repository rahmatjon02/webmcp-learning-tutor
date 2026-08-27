# WebMCP Learning Tutor

An interactive coding tutor where **ChatGPT (or any WebMCP-aware AI agent) acts as a
personal mentor directly inside the page**. Instead of copy-pasting code between a
separate chat tab and a coding site, the agent calls tools exposed by this website —
generating exercises, checking solutions, giving hints, and reading progress — while
a human can do the exact same things by clicking buttons in the UI. Both paths share
one client-side state store, so the agent and the student always see the same thing.

Built for the [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/).

## How it works

The frontend registers four tools via [`document.modelContext.registerTool`](https://webmachinelearning.github.io/webmcp/)
(the emerging [WebMCP](https://github.com/webmachinelearning/webmcp) W3C Community Group
draft), using the [`@mcp-b/global`](https://www.npmjs.com/package/@mcp-b/global) runtime
as a cross-browser polyfill:

| Tool | What it does |
| --- | --- |
| `generateExercise(topic?, difficulty?)` | Generates a JS exercise. If `difficulty` is omitted, it's picked adaptively from the student's recent progress. |
| `submitSolution(code, exerciseId?)` | Runs the submitted code against the exercise's hidden test cases and returns pass/fail results. |
| `getHint(exerciseId?)` | Reveals the next progressive hint for the active exercise. |
| `getProgress(studentId?)` | Returns solved/attempted stats broken down by topic and difficulty. |

Open the app in a browser that speaks WebMCP (e.g. ChatGPT's browsing agent, or the
[MCP-B Chrome extension](https://mcp-b.ai/) for testing), and ask it to "give me an
easy array exercise" or "check my solution" — it will call these tools instead of
scraping the DOM.

## Architecture

```
backend/    NestJS + TypeORM + SQLite (better-sqlite3)
  ├─ students/     student records
  ├─ exercises/    exercise bank (15 parameterized JS templates across
  │                5 topics × 3 difficulties), hint reveal tracking,
  │                adaptive difficulty suggestion
  └─ submissions/  sandboxed code runner (node:vm) + progress aggregation

frontend/   Vite + React + TypeScript
  ├─ store.ts          single client state store, used by both the UI
  │                    and the WebMCP tool `execute()` callbacks
  ├─ webmcp-tools.ts    registers the 4 tools on document.modelContext
  └─ components/        exercise view, CodeMirror editor, results/hints,
                         progress panel
```

Submitted code runs inside a `node:vm` context with a wall-clock timeout per
execution. This is a best-effort sandbox suitable for a hackathon demo, **not** a
hard security boundary — a production deployment should isolate execution further
(e.g. `isolated-vm`, a worker process, or a container).

Hidden test cases are never sent to the client: the API only returns one worked
example per exercise, and the full test suite runs server-side (`code-runner.service.ts`).

## Running locally

Requires Node.js 22+.

```bash
# backend
cd backend
npm install
npm run start:dev        # http://localhost:3000

# frontend (separate terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

The frontend talks to `http://localhost:3000/api` by default; override with
`VITE_API_URL` (see `frontend/.env.example`). The backend stores data in
`backend/data/db.sqlite` (SQLite file, created automatically); override the path
with `DB_PATH` (see `backend/.env.example`).

## Trying the WebMCP tools

1. Start both servers and open `http://localhost:5173`.
2. With a WebMCP-capable agent (ChatGPT's browsing mode, or the MCP-B extension),
   open the same page and ask it things like:
   - "Give me a medium difficulty exercise about strings"
   - "Here's my solution: `function solution(str) { return str... }` — check it"
   - "I'm stuck, give me a hint"
   - "How am I doing so far?"
3. Watch the page update live — the agent and the UI share the same session
   (student id persisted in `localStorage`).

You can also inspect what's registered from the browser console:

```js
await document.modelContext.getTools();
```

## Notes on scope

This is a 7-day hackathon build, scoped down deliberately:

- One language (JavaScript) and one exercise format (implement `function solution(...)`
  checked against test cases) to keep the surface small and reliable.
- 15 hand-written, randomized exercise templates rather than LLM-generated
  content — deterministic, gradeable, and doesn't depend on an external API key.
- Adaptive difficulty is a simple heuristic (escalate after a fast solve, back off
  after repeated failures), not a full mastery model.
