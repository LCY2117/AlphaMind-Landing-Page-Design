# AlphaMind Overnight Implementation Plan

Date: 2026-05-16

This document is the local task contract for the long-running implementation pass. The goal is to turn AlphaMind from a polished interactive demo into a product shell that can connect to a real quant/analysis backend, with QuantDinger treated as a candidate backend capability provider.

## Goal

Build the first real-functionality slice for AlphaMind:

1. Keep the current AlphaMind React UI and product experience.
2. Add a backend-adapter layer so UI modules can consume real data instead of hardcoded demo data.
3. Make `Asset X-Ray` the first working integration target.
4. Prepare `AI Advisor` and future risk-aware recommendations to use the same adapter.

## Non-Goals

- Do not replace the AlphaMind React frontend with QuantDinger's Vue frontend.
- Do not enable live trading.
- Do not store real broker or exchange credentials.
- Do not hardcode API keys into source files.
- Do not rebuild the whole app architecture unless required for the integration slice.
- Do not remove the current demo fallback until the real-data path is stable.
- Do not stop the entire overnight run just because a user-only confirmation is required; record it in `docs/LONG_TASK_BLOCKERS.md` and continue with independent work.
- Treat `docs/LONG_TASK_STATE.md` as the process control block for resume after interruption or context compaction.
- Use Git for recovery awareness, but do not create checkpoint commits unless explicitly authorized for the long task.
- Keep the four long-task anchors active on every start/resume/milestone: PLAN, STATE/PCB, BLOCKERS, GIT.
- Use sub-agents only if explicitly authorized; track their assignments, write scopes, status, and integration results in `docs/LONG_TASK_STATE.md`.

## Recommended Architecture

```text
AlphaMind React UI
  -> AlphaMind data service / adapter
  -> QuantDinger REST API or mock-compatible provider
  -> Market data, fast analysis, backtest, strategy jobs
```

The adapter should hide QuantDinger-specific response shapes from UI components. UI components should request AlphaMind-domain objects such as `AssetXRayReport`, not raw QuantDinger payloads.

## Priority 0: Safety And Repo Hygiene

- [ ] Inspect current git status before editing.
- [ ] Check the four anchors: PLAN, STATE/PCB, BLOCKERS, GIT.
- [ ] Record current branch, HEAD, dirty files, and checkpoint policy in `docs/LONG_TASK_STATE.md`.
- [ ] If sub-agents are explicitly authorized, record the sub-agent ledger in `docs/LONG_TASK_STATE.md`.
- [ ] Keep unrelated user changes intact.
- [ ] Do not commit unless explicitly asked.
- [ ] If checkpoint commits are explicitly authorized, commit only coherent validated milestones and record commit hashes in `docs/LONG_TASK_STATE.md`.
- [ ] Keep all secrets in `.env.local` or documented environment variables.
- [ ] Preserve the current demo behavior as a fallback path.
- [ ] Run the local guardrail script before each new priority, after large edit rounds, and after any context resume.
- [ ] Update `docs/LONG_TASK_STATE.md` after meaningful progress, validation, blockers, and before stopping.
- [ ] Record any user-only blockers in `docs/LONG_TASK_BLOCKERS.md` and keep advancing unblocked tasks.

Acceptance:

- `git status --short` is understood before major edits.
- No unrelated files are reverted.
- No API keys or tokens are committed.
- Branch, HEAD, dirty files, and checkpoint policy are recorded in `docs/LONG_TASK_STATE.md`.
- If sub-agents are used, their scope and integration status are recorded in `docs/LONG_TASK_STATE.md`.
- Guardrail script output has been checked during long execution.
- Any QR-code login, verification code, real-name check, payment, legal acceptance, or secret/API-key creation blocker is documented instead of causing idle waiting.
- A new thread can resume from `docs/LONG_TASK_STATE.md`.
- PLAN, STATE/PCB, BLOCKERS, and GIT are all current.

Guardrail command:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-overnight-plan.ps1
```

Guardrail plus build:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-overnight-plan.ps1 -Build
```

## Priority 1: Integration Configuration

Create a small frontend config layer for backend integration.

Expected work:

- Add environment variables for the AlphaMind app:
  - `VITE_ALPHAMIND_DATA_MODE=mock|quantdinger`
  - `VITE_QUANTDINGER_BASE_URL=http://localhost:8888`
  - Optional: `VITE_QUANTDINGER_AGENT_TOKEN=...` only if using Agent Gateway directly from frontend during local testing.
- Prefer a local proxy or server-side adapter for authenticated requests if the integration grows beyond read-only local development.
- Add a documented `.env.example` or docs section explaining local setup.

Acceptance:

- App builds when env variables are absent.
- Default mode remains usable with mock data.
- QuantDinger mode can be enabled without code edits.

Verification:

```powershell
npm run build
```

## Priority 2: Asset X-Ray Data Adapter

Replace hardcoded `AssetXRay` stock reports with an adapter-driven model.

Expected work:

- Define an AlphaMind-side report type, for example:
  - symbol, name, market, sector
  - price, change, marketCap
  - radar scores: valuation, growth, profitability, sentiment, momentum, safety
  - sentiment gauge score and label
  - probability cone inputs
  - conclusion text
  - catalysts / reasons / risks
  - raw provider metadata for debugging
- Implement provider functions:
  - `getAssetXRayReport(input)`
  - mock provider using the current TSLA/NVDA/AAPL data
  - QuantDinger provider using available endpoints
- Keep the existing scan animation and typewriter flow.
- On API failure, show a graceful inline error and offer a fallback demo scan.

Likely QuantDinger endpoints:

- Human API:
  - `POST /api/fast-analysis/analyze`
  - `GET /api/indicator/kline`
  - `GET /api/indicator/price`
- Agent API:
  - `GET /api/agent/v1/klines`
  - `GET /api/agent/v1/price`
  - `POST /api/agent/v1/backtests`

Data mapping notes:

- `scores.technical` -> momentum / technical score
- `scores.fundamental` -> growth / profitability proxy
- `scores.sentiment` -> sentiment gauge
- `scores.overall` or `confidence` -> AI comprehensive score
- `market_data.support/resistance/current_price` + `trend_outlook` -> probability cone approximation
- `summary`, `reasons`, `risks` -> AI conclusion and catalyst/risk cards

Acceptance:

- `Asset X-Ray` no longer depends directly on hardcoded stock data inside the component.
- Mock mode still looks identical or better than current UI.
- QuantDinger mode can call a live local QuantDinger service if available.
- Failed requests do not break the page.
- User can run TSLA/NVDA/AAPL scans from the UI.

Verification:

```powershell
npm run build
```

Manual browser checks:

- Left sidebar shows `资产透视`.
- Opening `资产透视` auto-runs the initial scan.
- Search input can run at least one supported symbol.
- Typewriter conclusion still plays after data returns.

## Priority 3: AI Advisor Tool Hook

Prepare `对话投顾` to trigger asset analysis from user messages.

Expected work:

- Detect simple stock-analysis intents such as:
  - `帮我分析一下特斯拉`
  - `分析 TSLA`
  - `看看 NVDA`
- Route detected intent to the same asset report adapter.
- Render a compact expandable analysis card in the chat stream, or navigate to `资产透视` with the symbol prefilled.
- Do not pretend to execute real trades.

Acceptance:

- Chat can recognize at least TSLA/NVDA/AAPL or explicit ticker input.
- Chat response can surface the same report summary used by `Asset X-Ray`.
- Existing chat demo interactions still work.

Verification:

```powershell
npm run build
```

Manual browser checks:

- Type `帮我分析一下 TSLA`.
- Chat returns an analysis-oriented response or opens the correct analysis workflow.

## Priority 4: Backtest Proof Of Capability

Add a thin placeholder-ready path for future strategy/backtest integration.

Expected work:

- Add service functions for:
  - submit backtest
  - get job status
  - map job result to AlphaMind card data
- Do not build a full strategy IDE.
- If QuantDinger is not running, expose mock backtest result data for UI development.

Acceptance:

- Code has a clear place to plug in QuantDinger backtest endpoints later.
- No visible UI regression if this remains hidden behind a feature flag.

## Priority 5: Documentation

Update local docs so a future developer can run the integration.

Expected work:

- Document mock mode.
- Document QuantDinger local mode:
  - clone QuantDinger
  - copy `backend_api_python/env.example` to `.env`
  - set `SECRET_KEY`
  - run Docker Compose
  - open `http://localhost:8888`
- Document what is known and unknown about auth.
- Document which endpoints AlphaMind currently uses.

Acceptance:

- A user can read the docs and understand how to try the integration.
- Any missing QuantDinger runtime requirement is clearly called out.

## Final Acceptance Checklist

- [ ] `npm run build` passes.
- [ ] The app still runs locally with no QuantDinger service.
- [ ] `资产透视` works in mock mode.
- [ ] QuantDinger mode is implemented behind config or a provider switch.
- [ ] Failed backend calls display a friendly UI state.
- [ ] No live trading is enabled.
- [ ] No secrets are committed.
- [ ] Git branch/HEAD/checkpoint policy and any checkpoint commits are recorded in `docs/LONG_TASK_STATE.md`.
- [ ] If sub-agents were authorized, sub-agent outputs were integrated and validated.
- [ ] Changes are summarized with file paths.

## Stretch Goals

Only attempt after Priority 1 and Priority 2 are stable.

- Add a small provider status indicator in settings or developer-only UI.
- Add local storage for recent analyzed symbols.
- Add a symbol search adapter using QuantDinger market symbol search.
- Add a chart data mapper from real K lines into the probability cone.
- Add Playwright/browser screenshot verification for desktop and mobile.

## Stop Conditions

Stop and report instead of forcing a risky change if:

- QuantDinger cannot run locally because Docker, ports, database, or missing files block it.
- Auth requirements are unclear and would require storing sensitive tokens in frontend source.
- The integration would require disabling security checks.
- Build cannot pass after focused fixes.
- Every remaining meaningful task depends on unresolved user-only blockers recorded in `docs/LONG_TASK_BLOCKERS.md`.

Do not stop merely because one path requires the user to scan a QR code, enter a verification code, accept legal terms, pay, complete real-name verification, or create/copy secrets. Record the blocker, update `docs/LONG_TASK_STATE.md`, and continue with all independent engineering, mock, documentation, validation, and fallback work.

## Morning Report Format

When the overnight pass finishes, report:

- What was implemented.
- What files changed.
- What was verified.
- What remains blocked.
- User-only actions needed from `docs/LONG_TASK_BLOCKERS.md`.
- Four-anchor status: PLAN, STATE/PCB, BLOCKERS, GIT.
- Sub-agent ledger, if used.
- Exact commands run and important results.
- Any manual setup needed from the user.
