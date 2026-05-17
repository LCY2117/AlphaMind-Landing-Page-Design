# Long Task Blockers

Use this file during unattended or overnight tasks. If Codex reaches something that requires the user personally, record the blocker here and continue with the next independent task instead of stopping the whole run.

## Active Blockers

| Time | Status | Priority / Task | User Action Needed | Service / URL | What Was Tried | Why Blocked | Work Continued |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-17 | active | QuantDinger live verification | Provide or start a local QuantDinger runtime plus a read/backtest-scoped Agent token only if live testing is desired | `http://localhost:8888`, GitHub `brokermr810/QuantDinger` | `git clone` failed twice with connection reset; raw GitHub API docs/files were used for implementation; AlphaMind build passed in mock/fallback mode | Full live API verification requires a running backend and secrets/tokens that Codex should not create, view, or hardcode unattended | Implemented config-driven provider, mock fallback, chat handoff, and backtest placeholder without blocking on secrets |
| 2026-05-17 | active | Optional fast analysis enrichment | Provide a local-only human JWT and confirm credit usage if `/api/fast-analysis/analyze` should be tested | QuantDinger `/api/fast-analysis/analyze` | Endpoint shape was inspected from raw source/docs | Human JWT may be sensitive and may consume credits, so it is queued instead of used unattended | Adapter makes this enrichment optional and falls back without it |

## Resolved Blockers

| Time | Priority / Task | Resolution |
| --- | --- | --- |
| _none yet_ | - | - |
