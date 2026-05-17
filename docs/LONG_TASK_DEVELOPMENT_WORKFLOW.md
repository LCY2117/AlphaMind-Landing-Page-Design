# Long Task Development Workflow

Use this workflow for overnight, multi-hour, or high-context coding tasks. It is designed to keep the agent aligned when the task is larger than one clean context window.

## What This Solves

Long tasks fail when the agent loses the original intent, forgets acceptance criteria, or keeps coding after a hidden blocker. This workflow creates durable local anchors:

1. A local plan file.
2. A local state file, like a process control block (PCB).
3. A local blocker queue for user-only actions.
4. Git status/checkpoints for rollback awareness.
5. A local guardrail/check script.
6. A reusable skill: `long-task-guardrail`.

The short reminder is:

```text
PLAN -> STATE/PCB -> BLOCKERS -> GIT
```

Every long-task start, resume, milestone switch, validation pass, blocker discovery, and final report should touch those four anchors.

Optional parallel agents are a fifth layer, not a fifth anchor:

```text
OPTIONAL: SUB-AGENTS -> tracked inside STATE/PCB
```

Use them only when explicitly authorized by the user.

## Project Setup

Every long task should add or reuse these files:

```text
docs/
  LONG_TASK_PLAN.md
  LONG_TASK_PROMPT.md
  LONG_TASK_STATE.md
  LONG_TASK_BLOCKERS.md
scripts/
  check-long-task-plan.ps1
```

Project-specific names are fine. For AlphaMind, the files are:

```text
docs/OVERNIGHT_IMPLEMENTATION_PLAN.md
docs/OVERNIGHT_PROMPT.md
docs/LONG_TASK_STATE.md
docs/LONG_TASK_BLOCKERS.md
scripts/check-overnight-plan.ps1
```

## Long Task Plan Template

Create `docs/LONG_TASK_PLAN.md`:

````markdown
# Long Task Plan

Date: YYYY-MM-DD

## Goal

- What should be true when the task is done?

## Non-Goals

- What should not be changed?
- What high-risk behavior is forbidden?

## Priorities

### Priority 0: Safety And Repo Hygiene

- [ ] Inspect git status.
- [ ] Record current branch and HEAD in `docs/LONG_TASK_STATE.md`.
- [ ] Identify pre-existing user changes before editing.
- [ ] Preserve unrelated user changes.
- [ ] Keep secrets out of source files.
- [ ] Confirm whether checkpoint commits are authorized.

Acceptance:

- No unrelated files reverted.
- No secrets committed.
- Git branch, HEAD, dirty state, and checkpoint policy are recorded in the state file.

### Priority 1: First Deliverable

- [ ] Task item.

Acceptance:

- Concrete, testable condition.

Verification:

```powershell
npm run build
```

## Final Acceptance Checklist

- [ ] Build/test command passes.
- [ ] Main workflow still works without optional services.
- [ ] Error states are friendly.
- [ ] No secrets are committed.
- [ ] Changed files are summarized.

## Stop Conditions

Stop and report if:

- Required local services cannot start.
- Auth/secrets are unclear.
- Build cannot pass after focused fixes.
- The task requires destructive actions not explicitly approved.

## Final Report Format

- Implemented work.
- Changed files.
- Verification commands and results.
- Blockers.
- Setup needed from user.
- Recommended next step.
````

## Prompt Template

Create `docs/LONG_TASK_PROMPT.md`:

````markdown
# Long Task Prompt

Use this prompt to start the task:

```text
Use $long-task-guardrail and follow docs/LONG_TASK_PLAN.md.

Before editing:
1. Inspect git status.
2. Read the plan.
3. Run the local guardrail script.

During work:
1. Follow priorities in order.
2. Run validation after meaningful stages.
3. Preserve fallback behavior.
4. Do not commit secrets.
5. Check the four anchors: PLAN, STATE/PCB, BLOCKERS, GIT.
6. Record branch, HEAD, git status, and changed files in docs/LONG_TASK_STATE.md.
7. Only create checkpoint commits if the user explicitly authorized commits for this long task.
8. Update docs/LONG_TASK_STATE.md after meaningful progress, validation, blockers, and before stopping.
9. If a user-only confirmation blocks one path, append it to docs/LONG_TASK_BLOCKERS.md and continue with the next independent task.
10. If the user explicitly authorized sub-agents, record each sub-agent task, scope, status, and integration result in docs/LONG_TASK_STATE.md.
11. Stop and report only if a stop condition appears or all remaining meaningful work is blocked.

Final output:
Give a final report with implemented work, changed files, validation results, blockers, and next steps.
```
````

## State File Template

Create `docs/LONG_TASK_STATE.md`:

```markdown
# Long Task State

This file is the process control block (PCB) for unattended long tasks. Update it whenever the task changes phase, after meaningful edits, after validation, when a blocker appears, and before any stop/resume handoff.

Last updated: YYYY-MM-DD HH:mm
Status: initialized
Current priority: Priority 0
Current task: Inspect repo and validate plan

## Resume Instructions

1. Read `docs/LONG_TASK_PLAN.md`.
2. Read this file.
3. Read `docs/LONG_TASK_BLOCKERS.md`.
4. Run `powershell -ExecutionPolicy Bypass -File scripts/check-long-task-plan.ps1`.
5. Continue from `Next Unblocked Action`.

## Last Completed Step

- _none yet_

## Work In Progress

- _none yet_

## Next Unblocked Action

- Start Priority 0 safety checks.

## Files Changed Or In Scope

- _none yet_

## Git State

- Branch: _unknown_
- HEAD: _unknown_
- Pre-existing dirty files: _unknown_
- Checkpoint commits authorized: no
- Latest checkpoint commit: _none_

## Commands Run

| Time | Command | Result |
| --- | --- | --- |
| _none yet_ | - | - |

## Validation State

- Latest validation: not run yet.

## Four Anchors Check

- PLAN: unchecked
- STATE/PCB: this file
- BLOCKERS: unchecked
- GIT: unchecked

## Sub-Agent Ledger

- Authorized: no
- Active agents: none
- Completed agents: none
- Integration status: not applicable

## Decisions

- _none yet_

## Open Blockers Summary

- None recorded.
```

Update this file frequently. It is cheaper than rediscovering state from chat history after a context reset.

## Optional Sub-Agent Parallelism

Use sub-agents only when the user explicitly authorizes sub-agents, parallel agents, small agents, or delegation.

Good uses:

- read-only explorer summarizes PLAN, STATE, BLOCKERS, and GIT into a resume brief
- explorer inspects a code area while the main thread works elsewhere
- worker implements a bounded module with disjoint file ownership
- worker updates documentation while another worker edits code
- verifier performs browser/UI checks while implementation continues

Rules:

- Record authorization and all agent assignments in `docs/LONG_TASK_STATE.md`.
- Give every worker a clear ownership scope and disjoint write set.
- Tell workers they are not alone in the codebase and must not revert others' edits.
- Keep the main thread on non-overlapping work.
- Do not use sub-agents to bypass QR scans, verification codes, payment, legal acceptance, real-name checks, or secret creation; those belong in `docs/LONG_TASK_BLOCKERS.md`.
- Integrate returned work deliberately, run validation, and record the result in `docs/LONG_TASK_STATE.md`.

## Git Checkpoint Policy

Git is part of the recovery mechanism, but it must not overwrite user work.

At task start and on every resume:

- run `git branch --show-current`
- run `git rev-parse --short HEAD`
- run `git status --short`
- record branch, HEAD, dirty files, and checkpoint authorization in `docs/LONG_TASK_STATE.md`

If the user authorizes branch creation, create or switch to a dedicated branch using the `codex/` prefix unless told otherwise.

If the user authorizes checkpoint commits:

- commit only coherent, validated milestones
- inspect staged files before committing
- never commit secrets, `.env.local`, credentials, generated bulky artifacts, or unrelated user changes
- record commit hashes in `docs/LONG_TASK_STATE.md`

If commits are not authorized, do not commit. Still record git status and changed files in the state file. If a rollback is needed, ask before destructive operations and prefer targeted forward fixes.

## Blocker Queue Template

Create `docs/LONG_TASK_BLOCKERS.md`:

```markdown
# Long Task Blockers

Use this file during unattended or overnight tasks. If Codex reaches something that requires the user personally, record the blocker here and continue with the next independent task instead of stopping the whole run.

## Active Blockers

| Time | Status | Priority / Task | User Action Needed | Service / URL | What Was Tried | Why Blocked | Work Continued |
| --- | --- | --- | --- | --- | --- | --- | --- |
| _none yet_ | - | - | - | - | - | - | - |

## Resolved Blockers

| Time | Priority / Task | Resolution |
| --- | --- | --- |
| _none yet_ | - | - |
```

User-only blockers include QR-code login, WeChat/QQ/SSO confirmation, email/SMS codes, real-name verification, phone binding, payment, subscription activation, legal term acceptance, secret/API key creation, production deploy approval, destructive operations, and live trading activation.

When a blocker appears, do not stop the whole run. Add a blocker entry, update `docs/LONG_TASK_STATE.md`, then continue with independent engineering work: mocks, adapters, docs, tests, env examples, UI states, fallback paths, schemas, and setup instructions. Stop only when every remaining meaningful task depends on unresolved blockers or continuing would be unsafe.

## Guardrail Script Template

Create `scripts/check-long-task-plan.ps1`:

```powershell
param(
  [switch]$Build
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$planPath = Join-Path $repoRoot "docs\LONG_TASK_PLAN.md"
$statePath = Join-Path $repoRoot "docs\LONG_TASK_STATE.md"
$blockersPath = Join-Path $repoRoot "docs\LONG_TASK_BLOCKERS.md"

if (-not (Test-Path $planPath)) {
  throw "Missing long task plan: $planPath"
}

if (-not (Test-Path $statePath)) {
  throw "Missing long task state PCB: $statePath"
}

if (-not (Test-Path $blockersPath)) {
  throw "Missing long task blocker queue: $blockersPath"
}

Write-Host ""
Write-Host "=== Long Task Guardrail ===" -ForegroundColor Cyan
Write-Host "Repo: $repoRoot"
Write-Host "Plan: docs/LONG_TASK_PLAN.md"
Write-Host ""

Write-Host "Required behavior:" -ForegroundColor Yellow
Write-Host "- Four anchors: PLAN -> STATE/PCB -> BLOCKERS -> GIT."
Write-Host "- Optional sub-agents must be explicitly authorized and tracked in docs/LONG_TASK_STATE.md."
Write-Host "- Read the plan before major edits."
Write-Host "- Read and update docs/LONG_TASK_STATE.md as the task PCB."
Write-Host "- Record user-only blockers in docs/LONG_TASK_BLOCKERS.md and continue unblocked work."
Write-Host "- Record branch, HEAD, and git status in docs/LONG_TASK_STATE.md."
Write-Host "- Do not create checkpoint commits unless the user explicitly authorized commits."
Write-Host "- Preserve unrelated user changes."
Write-Host "- Keep secrets out of source files."
Write-Host "- Keep fallback behavior unless the plan says otherwise."
Write-Host "- Run validation after meaningful stages."
Write-Host ""

Write-Host "Current git status:" -ForegroundColor Yellow
Write-Host "Branch:" (git -C $repoRoot branch --show-current)
Write-Host "HEAD:" (git -C $repoRoot rev-parse --short HEAD)
git -C $repoRoot status --short

if ($Build) {
  Write-Host ""
  Write-Host "Running build verification..." -ForegroundColor Yellow
  Push-Location $repoRoot
  try {
    npm run build
  } finally {
    Pop-Location
  }
}

Write-Host ""
Write-Host "Guardrail check complete. Re-read the plan before the next edit." -ForegroundColor Green
```

Adjust the validation command for non-frontend projects.

## Skill Usage

The global skill is:

```text
long-task-guardrail
```

Use it explicitly:

```text
Use $long-task-guardrail and follow docs/LONG_TASK_PLAN.md.
```

Or with a project-specific prompt:

```text
Use $long-task-guardrail and follow docs/OVERNIGHT_PROMPT.md.
```

## Operating Rules

- Keep the four anchors visible: PLAN, STATE/PCB, BLOCKERS, GIT.
- Use sub-agents only with explicit user authorization; track assignments, scopes, status, and integration results in `docs/LONG_TASK_STATE.md`.
- Run the guardrail script before each new milestone.
- Run it again after context compaction or any resume.
- Read `docs/LONG_TASK_STATE.md` on every resume and update it after meaningful progress, validation, blockers, and before stopping.
- Record branch, HEAD, dirty files, changed files, and checkpoint commit hashes in `docs/LONG_TASK_STATE.md`.
- Create checkpoint commits only when the user has explicitly authorized commits for the long task.
- Record QR scans, verification codes, real-name checks, payment, legal acceptance, secret creation, production approvals, destructive operations, and live trading activation in `docs/LONG_TASK_BLOCKERS.md`; keep working on independent tasks.
- Run build/test checks after meaningful implementation stages.
- For Codex-owned Python utilities, use `$python-project-venv` and the shared Codex tool venv. For Python project runtime/tests, use that project's own environment.
- If the optional backend/service is unavailable, continue with adapter/fallback work instead of blocking.
- End with a morning report.

## Why Skill Plus Script

The skill reminds Codex to follow the workflow. The script provides a deterministic local checkpoint. The plan defines what success means. The state file preserves runtime context. The blocker queue prevents user-only confirmations from wasting unattended time. Git records recovery points when checkpoint commits are authorized.
