# Long Task State

This file is the process control block (PCB) for unattended long tasks. Update it whenever the task changes phase, after meaningful edits, after validation, when a blocker appears, and before any stop/resume handoff.

Last updated: 2026-05-26 01:41 CST
Status: paused
Current priority: Roadshow long task startup gate prepared
Current task: AlphaMind roadshow plan baseline committed; waiting for explicit implementation start

## Resume Instructions

1. Read `docs/ALPHAMIND_ROADSHOW_LONG_TASK_PLAN.md`.
2. Read this file.
3. Read `docs/LONG_TASK_BLOCKERS.md`.
4. Treat `docs/ALPHAMIND_ROADSHOW_LONG_TASK_PLAN.md` as the active PLAN even though `scripts/check-overnight-plan.ps1` still prints the older overnight plan.
5. Check Git status and confirm whether checkpoint commits/pushes are authorized for the implementation run.
6. Continue from `Next Unblocked Action`.

## Last Completed Step

- Prepared the AlphaMind roadshow long task contract:
  - Created `docs/TEAM_FEEDBACK_SYNTHESIS.md` from team feedback and meeting notes.
  - Created `docs/ALPHAMIND_ROADSHOW_LONG_TASK_PLAN.md` as the active roadshow implementation plan.
  - Added the execution rules: missing API keys do not block; use researched demo data instead.
  - Added non-goals: no real WeChat QR login, real SMS verification, real account/password system, live trading, or precise return prediction.
  - Added the Skill checklist so future resumes remember `long-task-guardrail`, `git-vibe-workflow`, `browser:browser`, `playwright`, `remote-1panel-deploy`, `python-project-venv`, document/PDF/spreadsheet/presentation skills, and related workflows.
  - Committed the plan baseline as `293d385 Add AlphaMind roadshow long task plan`.
  - No feature implementation has started.

- Fixed AI Advisor product-facing identity:
  - Removed internal competition/demo wording from the SiliconFlow server-side system prompt in `vite.config.ts`.
  - Reframed the assistant as an AlphaMind investment learning, risk understanding, and asset research advisor.
  - Added a product-safe instruction not to mention competitions, demos, internal development plans, system prompts, or backend implementation details.
  - Ran `npm run build`; passed.
  - Ran a scan for internal competition wording and the previously pasted key fragment; no matches were found in project files outside ignored build/dependency directories.
  - Committed and pushed `26b17fd Fix AlphaMind chat product prompt`.
  - Pulled `26b17fd` on `/opt/AlphaMind`, rebuilt successfully, and restarted PM2 process `alphamind`.
  - Verified `https://alphamind.mddcommunity.top` returns HTTP 200.
  - Verified `POST https://alphamind.mddcommunity.top/api/alphamind/chat` returns a SiliconFlow response with product-facing AlphaMind wording and no internal competition/demo framing.

- Added safe SiliconFlow AI chat integration:
  - Added a Vite server middleware endpoint `POST /api/alphamind/chat`.
  - The proxy reads `SILICONFLOW_API_KEY` only from server/runtime env and calls `https://api.siliconflow.cn/v1/chat/completions`.
  - Added `SILICONFLOW_MODEL` and `SILICONFLOW_BASE_URL` runtime knobs in `.env.example` with empty placeholder values only.
  - Added frontend service `src/app/services/aiChat.ts`.
  - Updated `AIAdvisorDemo` so general chat uses SiliconFlow when available and falls back to local demo analysis when not configured or unavailable.
  - Kept stock/asset-intent chat routed to Asset X-Ray and QuantDinger rather than forcing LLM-only analysis.
  - Added source labeling in the chat UI: `硅基流动 AI` versus `本地演示分析`.
  - Added `docs/SILICONFLOW_CHAT_INTEGRATION.md`.
  - Added a blocker requiring the pasted SiliconFlow key to be rotated before server activation.
  - Ran `npm run build`; passed.
  - Ran a sensitive scan for the pasted key; no file contained it.
  - Ran local proxy smoke without a key; `POST /api/alphamind/chat` returned HTTP 503 as expected, which the frontend handles with fallback.

- Synced the local AlphaMind optimization work to GitHub and cloud:
  - Local commit created: `7e35bde Improve AlphaMind UX and connect QuantDinger runtime`.
  - Pushed `main` to `origin/main`.
  - Pulled the commit on `/opt/AlphaMind` with `git pull --ff-only origin main`.
  - Preserved server-only `/opt/AlphaMind/.env.local`:
    - `VITE_ALPHAMIND_DATA_MODE=quantdinger`
    - `VITE_QUANTDINGER_BASE_URL=/api/quantdinger`
  - Ran `npm install` and `npm run build` on the server; build passed.
  - Restarted PM2 process `alphamind`; status returned `online`.
  - Verified public AlphaMind page returns HTTP 200 at `https://alphamind.mddcommunity.top`.
  - Verified public QuantDinger same-origin proxy returns HTTP 200 with `x-alphamind-upstream: quantdinger`.
  - Confirmed `/opt/QuantDinger` containers remain healthy.
  - Cleaned a server-only `package-lock.json` metadata change caused by the deploy-time `npm install`, leaving `/opt/AlphaMind` clean at `7e35bde`.
  - Noted deploy warning: server `npm install` reported `react-router@7.13.0` wants Node `>=20`, while the direct `npm install` command used system Node `v18.19.1`; PM2 runs AlphaMind with Node `24.14.0`, and both server build/runtime validation passed.
  - Noted deploy warning: `npm audit` reported 1 high severity issue; no force audit fix was applied during deployment.

- Resolved the QuantDinger live runtime blocker on the cloud server:
  - Connected to `104.248.151.6` as `root` using the existing SSH key after an initial `Exceeded MaxStartups` SSH retry condition.
  - Cloned `brokermr810/QuantDinger` into `/opt/QuantDinger` at HEAD `0b61d06`.
  - Created `/opt/QuantDinger/backend.env` and `/opt/QuantDinger/.env` with loopback-bound ports and `AGENT_LIVE_TRADING_ENABLED=false`; no API keys, JWTs, or broker credentials were added.
  - Started QuantDinger with `docker compose -f docker-compose.ghcr.yml up -d`.
  - Verified all QuantDinger containers are healthy: `quantdinger-backend`, `quantdinger-frontend`, `quantdinger-db`, `quantdinger-redis`.
  - Verified `http://127.0.0.1:8888/health` and `http://127.0.0.1:5000/api/health`.
  - Verified live indicator responses for TSLA:
    - `GET http://127.0.0.1:8888/api/indicator/price?market=USStock&symbol=TSLA`
    - `GET http://127.0.0.1:8888/api/indicator/kline?market=USStock&symbol=TSLA&timeframe=1D&limit=5`
  - Added OpenResty same-origin proxy `/api/quantdinger/` for `alphamind.mddcommunity.top`, backed up the previous proxy config, ran `nginx -t`, and reloaded OpenResty.
  - Verified public same-origin proxy:
    - `GET https://alphamind.mddcommunity.top/api/quantdinger/api/indicator/price?market=USStock&symbol=TSLA`
    - `GET https://alphamind.mddcommunity.top/api/quantdinger/api/indicator/kline?market=USStock&symbol=TSLA&timeframe=1D&limit=3`
  - Wrote remote `/opt/AlphaMind/.env.local`:
    - `VITE_ALPHAMIND_DATA_MODE=quantdinger`
    - `VITE_QUANTDINGER_BASE_URL=/api/quantdinger`
  - Restarted PM2 process `alphamind`; confirmed Vite injects `VITE_ALPHAMIND_DATA_MODE=quantdinger`.
  - Updated `docs/LONG_TASK_BLOCKERS.md` so the runtime blocker is resolved and only token/JWT user actions remain active.
  - Updated `docs/QUANTDINGER_INTEGRATION.md` with cloud runtime status and validated endpoints.

- Committed and pushed QuantDinger adapter work to GitHub (`c58ae36`), then pulled it on `/opt/AlphaMind` cloud server.
- Added `docs/API_APPLICATION_CHECKLIST.md` for API application delegation; currently uncommitted and must be preserved.
- Created `docs/ALPHAMIND_OPTIMIZATION_PLAN.md` for this new long optimization task.
- Completed the first API-independent optimization batch:
  - Converted auth/login UX into explicit local demo identity.
  - Added demo session indicators in navigation and settings.
  - Added real local data clearing in settings.
  - Improved Asset X-Ray provider/data state, freshness, coverage, unsupported ticker handling, and chart labels.
  - Improved Risk dashboard empty states, status cards, behavior-chart gating, and timer cleanup.
  - Improved chat stock-analysis handoff to Asset X-Ray with contextual follow-ups.
  - Added mobile global navigation drawer and clickable logo home behavior.
  - Lazy-loaded heavy pages and removed arrow-key page hijacking.
  - Added favicon link and reduced overclaiming hero copy.
  - Validated with `npm run build` and Playwright browser smoke checks.

Previous completed integration steps:

- Updated the long-task workflow with a PCB state file, blocker queue, and Git recovery policy.
- Validated the global `long-task-guardrail` skill.
- Ran the AlphaMind overnight guardrail script successfully.
- Started the QuantDinger integration long task with explicit authorization for sub-agent/parallel agent use.
- Investigated QuantDinger via raw GitHub files after `git clone` failed with connection resets.
- Added AlphaMind integration config for `mock` and `quantdinger` modes.
- Added `AssetXRayReport` domain model plus mock and QuantDinger provider paths.
- Refactored `AssetXRay` to consume the provider layer, preserve scan/typewriter animation, and show provider/fallback state.
- Added chat intent detection for TSLA/NVDA/AAPL and Chinese company names.
- Added chat-to-Asset-X-Ray handoff with the detected stock symbol.
- Added a QuantDinger Agent Gateway backtest service placeholder with mock fallback.
- Integrated Raman reviewer findings:
  - optional fast-analysis failure no longer fails the whole scan
  - QuantDinger fetches now time out after 8 seconds and fall back
  - raw JSON provider responses are accepted in addition to envelopes
  - unsupported tickers keep the requested symbol visible instead of silently becoming TSLA
  - input fields no longer trigger global arrow-key page navigation
  - Asset X-Ray invalidates stale requests on unmount
- Ran `npm run build` three times after implementation/fixes; all passed with only the Vite chunk-size warning.

## Work In Progress

- No active implementation in progress.
- Roadshow long task startup gate is prepared, but P0 implementation has not started.
- User previously authorized sub-agent/parallel agent usage for an earlier long task; for this roadshow implementation run, confirm authorization again if parallel agents should write code.

## Next Unblocked Action

- Wait for the user's explicit instruction to start implementation.
- On start, begin with P0 in `docs/ALPHAMIND_ROADSHOW_LONG_TASK_PLAN.md`:
  1. Establish lightweight user profile storage/service.
  2. Fix prompt leakage and public reasoning display.
  3. Build domestic demo asset data provider.
  4. Add homepage personalized research candidates and search.
- Before editing feature code, record Git status and whether checkpoint commits/pushes are authorized.
- The existing QuantDinger/SiliconFlow blockers are not startup blockers for this roadshow task; use demo data when keys or real providers are absent.

## Files Changed Or In Scope

- `docs/ALPHAMIND_ROADSHOW_LONG_TASK_PLAN.md`
- `docs/TEAM_FEEDBACK_SYNTHESIS.md`
- `docs/LONG_TASK_STATE.md`
- `.env.example`
- `docs/LONG_TASK_BLOCKERS.md`
- `docs/LONG_TASK_DEVELOPMENT_WORKFLOW.md`
- `docs/OVERNIGHT_IMPLEMENTATION_PLAN.md`
- `docs/OVERNIGHT_PROMPT.md`
- `docs/QUANTDINGER_INTEGRATION.md`
- `docs/SILICONFLOW_CHAT_INTEGRATION.md`
- `docs/API_APPLICATION_CHECKLIST.md`
- `docs/ALPHAMIND_OPTIMIZATION_PLAN.md`
- `index.html`
- `scripts/check-overnight-plan.ps1`
- `src/app/App.tsx`
- `src/app/components/AIAdvisorDemo.tsx`
- `src/app/components/AssetXRay.tsx`
- `src/app/components/HeroSection.tsx`
- `src/app/components/LoginModal.tsx`
- `src/app/components/LoginPage.tsx`
- `src/app/components/Navigation.tsx`
- `src/app/components/RiskAssessment.tsx`
- `src/app/components/SettingsModal.tsx`
- `src/app/components/StockTicker.tsx`
- `src/app/contexts/AuthContext.tsx`
- `src/app/services/alphamindConfig.ts`
- `src/app/services/aiChat.ts`
- `src/app/services/assetXRay.ts`
- `src/app/services/backtest.ts`
- `vite.config.ts`

Remote server files changed, not part of this repository:

- `/opt/QuantDinger/.env`
- `/opt/QuantDinger/backend.env`
- `/opt/1panel/www/sites/alphamind.mddcommunity.top/proxy/quantdinger.conf`
- `/opt/AlphaMind/.env.local`

## Git State

- Branch: `main`
- HEAD: `293d385`
- Current dirty files: `docs/LONG_TASK_STATE.md`
- Pre-existing dirty files before the roadshow startup gate: untracked `docs/ALPHAMIND_ROADSHOW_LONG_TASK_PLAN.md`, untracked `docs/TEAM_FEEDBACK_SYNTHESIS.md`; both are now committed in `293d385`.
- Checkpoint commits authorized for the roadshow implementation: not yet confirmed.
- Latest local roadshow plan baseline commit: `293d385 Add AlphaMind roadshow long task plan`
- Remote sync status: local `main` is ahead of `origin/main` until the startup-state commit/push is completed.

## Four Anchors Check

- PLAN: `docs/ALPHAMIND_ROADSHOW_LONG_TASK_PLAN.md`
- STATE/PCB: `docs/LONG_TASK_STATE.md`
- BLOCKERS: `docs/LONG_TASK_BLOCKERS.md`
- GIT: branch `main`, HEAD `293d385`, dirty file `docs/LONG_TASK_STATE.md`; startup state update is in progress

## Sub-Agent Ledger

- Authorized: not yet confirmed for the roadshow implementation run. Earlier QuantDinger/optimization work allowed sub-agents, but this run should re-confirm if write-capable agents are desired.
- Active agents:
  - none.
- Completed agents:
  - `019e3524-5bcd-70c2-b2d5-d938d9c19c0e` / Godel: read-only UI/UX audit; findings integrated into mobile nav, empty chat, demo data honesty, and keyboard behavior.
  - `019e3524-7937-7842-aa32-d8b71956e5d6` / Galileo: read-only auth/session audit; findings integrated into local demo auth, masked phone storage, demo copy, and data clearing.
  - `019e3524-97de-7b61-b7d3-6e75e89ac0f1` / Confucius: read-only chart/data honesty audit; findings integrated into ticker label, Risk empty states, Asset X-Ray provider status, and unsupported ticker handling.
  - `019e3524-b8d3-73b2-bdd0-d273ba7466f8` / Socrates: read-only performance/engineering audit; findings integrated into lazy loading, current page memoization, and timer cleanup.
  - `019e321c-f47d-7843-bee4-41e11b7ef0c5` / Epicurus: read-only QuantDinger API investigation; findings integrated into adapter design.
  - `019e3227-f8b7-7123-8624-8e11ea5cf4f5` / Raman: read-only integration review; findings integrated into adapter and UX fixes.
- Integration status: completed and validated by build.

## Commands Run

| Time | Command | Result |
| --- | --- | --- |
| 2026-05-17 | _initialization_ | State file created |
| 2026-05-17 | `C:\Users\LCY\.codex\tool-venvs\python-tools\Scripts\python.exe C:\Users\LCY\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\LCY\.codex\skills\long-task-guardrail` | Passed |
| 2026-05-17 | `powershell -ExecutionPolicy Bypass -File scripts\check-overnight-plan.ps1` | Passed; branch `main`, HEAD `f7048ee` |
| 2026-05-17 | `powershell -ExecutionPolicy Bypass -File scripts\check-overnight-plan.ps1` | Passed at task start; branch `main`, HEAD `f7048ee`; sub-agents authorized |
| 2026-05-17 | `git clone https://github.com/brokermr810/QuantDinger.git _external\QuantDinger` | Failed twice with `Recv failure: Connection was reset`; used raw GitHub files instead |
| 2026-05-17 | `npm run build` | Passed; Vite warned that one chunk is larger than 500 kB |
| 2026-05-17 | `npm run build` | Passed after chat handoff/backtest placeholder |
| 2026-05-17 | `npm run build` | Passed after Raman resilience fixes |
| 2026-05-17 | `npm run dev -- --host 127.0.0.1 --port 5173` | Started local Vite server on `http://127.0.0.1:5173` |
| 2026-05-17 | Browser check via in-app browser | Page rendered; sidebar nav and Asset X-Ray entry visible. Chat async automation was partially blocked by browser tool timeouts, but build and server response remained healthy. |
| 2026-05-17 | `powershell -ExecutionPolicy Bypass -File scripts\check-overnight-plan.ps1` | Passed after context resume; branch `main`, HEAD `c58ae36` |
| 2026-05-17 | `npm run build` | Passed after first optimization edits; chunks split into lazy page bundles |
| 2026-05-17 | `npm run dev -- --host 127.0.0.1 --port 5174` | Started temporary local Vite server for smoke test; stopped after validation |
| 2026-05-17 | Playwright CLI smoke test | Passed: login modal/demo login, Risk page empty state, Asset X-Ray mock status, Chat stock-analysis CTA. Caught and fixed a Risk empty RadarChart crash and chat Enter behavior. Console ended with 0 errors/warnings except React devtools info. |
| 2026-05-17 | `npm run build` | Passed after fixes; main JS chunk about 325.77 kB raw / 103.17 kB gzip with heavy pages lazy-loaded |
| 2026-05-17 | `ssh root@104.248.151.6 "whoami && hostname && uname -a"` | Passed after retry; initial attempts hit SSH `Exceeded MaxStartups` |
| 2026-05-17 | `git clone https://github.com/brokermr810/QuantDinger.git /opt/QuantDinger` on server | Passed; remote QuantDinger HEAD `0b61d06` |
| 2026-05-17 | `docker compose -f docker-compose.ghcr.yml pull && docker compose -f docker-compose.ghcr.yml up -d` on server | Passed; QuantDinger stack started |
| 2026-05-17 | `docker compose -f docker-compose.ghcr.yml ps` on server | Passed; backend/frontend/Postgres/Redis all healthy |
| 2026-05-17 | `curl http://127.0.0.1:8888/api/indicator/price?market=USStock&symbol=TSLA` on server | Passed; returned live QuantDinger JSON with TSLA price data |
| 2026-05-17 | `curl http://127.0.0.1:8888/api/indicator/kline?market=USStock&symbol=TSLA&timeframe=1D&limit=5` on server | Passed; returned live QuantDinger JSON with TSLA K-line data |
| 2026-05-17 | OpenResty proxy update plus `nginx -t` and reload | Passed; added `/api/quantdinger/` same-origin proxy |
| 2026-05-17 | `curl https://alphamind.mddcommunity.top/api/quantdinger/api/indicator/price?market=USStock&symbol=TSLA` | Passed; HTTP 200 with `x-alphamind-upstream: quantdinger` |
| 2026-05-17 | PM2 restart `alphamind --update-env` | Passed; cloud Vite process restarted and injected `VITE_ALPHAMIND_DATA_MODE=quantdinger` |
| 2026-05-17 | Playwright ad hoc module smoke | Not completed; temporary `npx` CLI was available, but `require('playwright')` could not resolve without installing a project dependency. API/env validation was completed by curl and Vite module inspection instead. |
| 2026-05-17 | `npm run build` | Passed locally before cloud sync |
| 2026-05-17 | `rg` sensitive-value scan | Passed; only placeholder examples were found in `.env.example` |
| 2026-05-17 | `git commit -m "Improve AlphaMind UX and connect QuantDinger runtime"` | Created commit `7e35bde` |
| 2026-05-17 | `git push origin main` | Passed; `origin/main` updated from `c58ae36` to `7e35bde` |
| 2026-05-17 | Server `git pull --ff-only origin main` in `/opt/AlphaMind` | Passed; cloud repo updated to `7e35bde` |
| 2026-05-17 | Server `npm install` | Completed with `react-router@7.13.0` engine warning under direct SSH system Node `v18.19.1`; no secrets were touched |
| 2026-05-17 | Server `npm run build` | Passed after pulling `7e35bde` |
| 2026-05-17 | Server PM2 restart `alphamind --update-env` | Passed; process `alphamind` online |
| 2026-05-17 | `Invoke-WebRequest https://alphamind.mddcommunity.top` | Passed; HTTP 200 |
| 2026-05-17 | `Invoke-WebRequest https://alphamind.mddcommunity.top/api/quantdinger/api/indicator/price?market=USStock&symbol=TSLA` | Passed; HTTP 200 with `x-alphamind-upstream: quantdinger` |
| 2026-05-17 | Server `git checkout -- package-lock.json` | Restored deploy-time lockfile metadata drift caused by direct `npm install`; `/opt/AlphaMind` clean at `7e35bde` |
| 2026-05-17 | `npm run build` | Passed after adding SiliconFlow chat proxy and frontend service |
| 2026-05-17 | `rg` scan for pasted SiliconFlow key | Passed; the pasted key was not written to project files |
| 2026-05-17 | Local dev proxy smoke on `127.0.0.1:5180` without `SILICONFLOW_API_KEY` | Returned HTTP 503 as expected; frontend fallback path remains available |
| 2026-05-17 | `npm run build` | Passed after removing internal competition/demo wording from the AI Advisor system prompt |
| 2026-05-17 | `rg -n "医学创新|竞赛项目|医创赛|sk-ij|ijhkkei" . --glob '!node_modules/**' --glob '!dist/**'` | Passed with no matches; prompt contamination and pasted key fragment are absent from project files |
| 2026-05-17 | `git commit -m "Fix AlphaMind chat product prompt"` | Created commit `26b17fd` |
| 2026-05-17 | `git push origin main` | Passed; `origin/main` updated from `f921f07` to `26b17fd` |
| 2026-05-17 | Server `git pull --ff-only origin main && npm run build` | Passed; cloud `/opt/AlphaMind` updated to `26b17fd` and build passed |
| 2026-05-17 | Server PM2 restart `alphamind --update-env` | Passed; process `alphamind` online |
| 2026-05-17 | `Invoke-WebRequest https://alphamind.mddcommunity.top` | Passed; HTTP 200 |
| 2026-05-17 | `POST https://alphamind.mddcommunity.top/api/alphamind/chat` | Passed; returned SiliconFlow product-facing AlphaMind advisor answer without internal competition/demo wording |
| 2026-05-26 | `git commit -m "Add AlphaMind roadshow long task plan"` | Created commit `293d385` with `docs/ALPHAMIND_ROADSHOW_LONG_TASK_PLAN.md` and `docs/TEAM_FEEDBACK_SYNTHESIS.md` |
| 2026-05-26 | `git status --short --branch` | Branch `main`; local branch ahead of `origin/main`; current dirty file after PCB update: `docs/LONG_TASK_STATE.md` |

## Validation State

- Latest readiness gate: plan docs committed; Node/npm/rg/node_modules available; Git remote fetch works; SSH to `/opt/AlphaMind` works; browser automation became ready after using the current browser plugin cache path. No feature implementation or acceptance validation has started for the roadshow plan.
- Latest local validation: `npm run build` passed after AI Advisor prompt cleanup; internal competition wording and pasted-key-fragment scan returned no matches.
- Latest remote validation: `/opt/AlphaMind` is at `26b17fd`, PM2 `alphamind` is online, public page returns HTTP 200, `/api/alphamind/chat` returns SiliconFlow product-facing wording, QuantDinger containers remain healthy, and indicator API works through the AlphaMind same-origin proxy.
- Browser validation note: Playwright smoke test on `http://127.0.0.1:5174` passed earlier for demo login, Risk page, Asset X-Ray, and Chat-to-Asset-X-Ray CTA. A later ad hoc Playwright network smoke did not run because the temporary package was not importable without adding a dependency.

## Decisions

- Treat `LONG_TASK_STATE.md` as the durable PCB for recovery after interruption or context compaction.
- Treat `LONG_TASK_BLOCKERS.md` as the waiting queue for user-only confirmations.
- Use Git status/branch/HEAD as recovery metadata, but do not create commits unless the user explicitly authorizes checkpoint commits.
- Keep the four long-task anchors visible on every resume: PLAN, STATE/PCB, BLOCKERS, GIT.
- User explicitly authorized sub-agents/parallel agents for this long task; track assignments and integration in this state file.
- Keep QuantDinger behind config/fallback; the app must remain usable without a running QuantDinger service.
- Do not place real Agent/JWT tokens in source. `.env.example` documents variable names only.
- Do not enable live trading; Agent scopes should be limited to read/backtest (`R,B`) when user later provides tokens.
- Use QuantDinger as backend capability provider only; preserve AlphaMind React UI.
- Authentication remains local demo identity until a real backend/session system is introduced.
- Mock/provider states must stay explicit in financial UI until real data contracts are available.
- Remote QuantDinger should stay loopback-only; public access should go through AlphaMind/OpenResty same-origin proxy.
- Agent Gateway and fast-analysis tokens remain user-only secrets and must not be copied into chat or committed files.
- The SiliconFlow key pasted into chat should be treated as exposed; only a rotated replacement key should be placed into server-only env.
- For the roadshow task, missing API keys do not go to the blocker queue; use researched demo data and local mock providers instead.
- Real WeChat QR login, real SMS verification, and real account/password auth are out of scope for the roadshow task.
- The active roadshow PLAN supersedes older optimization/overnight plans for new implementation decisions.

## Open Blockers Summary

- Active blockers are recorded in `docs/LONG_TASK_BLOCKERS.md`.
- Full live indicator verification no longer needs a QuantDinger runtime; it is running on the cloud server.
- Agent Gateway backtest verification still needs a user-created read/backtest-scoped token.
- Optional fast-analysis enrichment needs a human JWT and credit/usage confirmation.
- SiliconFlow live chat activation needs a rotated server-only `SILICONFLOW_API_KEY`.
