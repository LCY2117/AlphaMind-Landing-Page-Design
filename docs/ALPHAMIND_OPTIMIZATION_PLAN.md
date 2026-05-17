# AlphaMind Product Optimization Plan

Date: 2026-05-17

This is the working plan for the current long optimization task. The goal is to improve AlphaMind while third-party API keys are not available yet.

## Goal

Make AlphaMind feel more like a real product before live backend data is available:

- clearer user flow
- stronger dashboard hierarchy
- better login/session experience
- more honest mock/provider states
- improved chart readability
- smoother performance
- stronger resume and validation discipline

## Non-Goals

- Do not require new third-party API keys.
- Do not enable live trading.
- Do not store secrets in source files.
- Do not replace the AlphaMind frontend.
- Do not rewrite the whole app architecture in one pass.
- Do not remove QuantDinger adapter work.

## Priority 0: Task Safety

- [x] Record current git state.
- [x] Preserve uncommitted `docs/API_APPLICATION_CHECKLIST.md`.
- [x] Update `docs/LONG_TASK_STATE.md` for this new task.
- [x] Track sub-agents and completed checks.
- [x] Run `npm run build` after each meaningful implementation batch.

## Priority 1: Information Architecture And Navigation

- [x] Keep one primary navigation path in the left sidebar.
- [x] Make mobile navigation easy to open and dismiss.
- [x] Make current page context obvious.
- [ ] Avoid duplicated global nav inside nested pages.
- [x] Ensure keyboard navigation does not interfere with text inputs.

Acceptance:

- Users can identify where they are and where to go next within 3 seconds.
- Mobile users can reach Home, Chat, Risk, Asset X-Ray, and Features.

## Priority 2: Login And Session Experience

- [x] Improve login modal hierarchy and form clarity.
- [x] Add explicit demo/login state indicators.
- [x] Avoid pretending real authentication exists if it is local-only.
- [x] Keep localStorage demo auth stable.
- [x] Add safe logout and user status display improvements.

Acceptance:

- User understands whether they are in demo/local session mode.
- Login does not block core exploration.

## Priority 3: Asset X-Ray And Data Honesty

- [x] Make provider status more visible and less technical.
- [x] Separate "real", "mock", "fallback", and "waiting for API" states.
- [x] Improve unsupported ticker state.
- [x] Improve radar/chart labels and card hierarchy.
- [x] Add clearer data freshness/analysis scope language.

Acceptance:

- The page does not overclaim real AI/data when using mock.
- Users can still understand useful demo behavior.

## Priority 4: Risk Dashboard And Charts

- [x] Improve empty/filled risk state readability.
- [x] Ensure radar chart/card content is not hidden by layout.
- [x] Make chart legends and score explanations more scan-friendly.
- [x] Add subtle status cards for test freshness and profile confidence.

Acceptance:

- Risk page can be understood without reading long explanatory text.
- Chart containers remain stable on desktop and mobile.

## Priority 5: Chat UX

- [x] Improve stock-analysis response card so it does not show irrelevant allocation chart.
- [x] Make suggested follow-up questions context-aware.
- [x] Improve empty chat quick actions.
- [x] Keep input sticky and unobtrusive.
- [x] Preserve chat history localStorage behavior.

Acceptance:

- Asking for a stock analysis naturally leads to Asset X-Ray.
- General investment chat still works.

## Priority 6: Performance And Maintainability

- [x] Identify expensive animations or unnecessary re-renders.
- [x] Reduce accidental rerenders from recreated page arrays/handlers where practical.
- [x] Avoid heavy DOM/text extraction states in runtime.
- [x] Keep animations transform/opacity based.
- [x] Consider code splitting only if it can be done safely.

Acceptance:

- `npm run build` passes.
- No obvious console/runtime crashes in browser smoke test.

## Priority 7: Documentation And Handoff

- [x] Keep this plan updated.
- [x] Update state PCB after milestones.
- [ ] Add blockers if user-only items appear.
- [x] Report changed files and validation.

## First Implementation Batch

Do the highest-value improvements that do not require third-party APIs:

1. Add a product/status banner component for local demo and API readiness states.
2. Improve Asset X-Ray provider status and unsupported ticker language.
3. Improve chat stock-analysis card hierarchy.
4. Improve login/session status copy.
5. Fix any low-risk performance issues found during audit.

Status: completed in first implementation batch.

## Validation

```powershell
npm run build
```

Browser smoke checks:

- Home renders.
- Sidebar navigation works.
- Chat accepts a stock analysis prompt and shows Asset X-Ray CTA.
- Asset X-Ray renders mock/provider status.
- Login modal opens and closes.
- Risk page renders.

## Final Report

Include:

- optimization checklist status
- implemented changes
- files changed
- build/browser validation
- remaining tasks
- blockers
- sub-agent ledger
