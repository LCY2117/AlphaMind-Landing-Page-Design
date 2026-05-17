param(
  [switch]$Build
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$planPath = Join-Path $repoRoot "docs\OVERNIGHT_IMPLEMENTATION_PLAN.md"
$promptPath = Join-Path $repoRoot "docs\OVERNIGHT_PROMPT.md"
$statePath = Join-Path $repoRoot "docs\LONG_TASK_STATE.md"
$blockersPath = Join-Path $repoRoot "docs\LONG_TASK_BLOCKERS.md"

if (-not (Test-Path $planPath)) {
  throw "Missing overnight plan: $planPath"
}

if (-not (Test-Path $promptPath)) {
  throw "Missing overnight prompt: $promptPath"
}

if (-not (Test-Path $statePath)) {
  throw "Missing long task state PCB: $statePath"
}

if (-not (Test-Path $blockersPath)) {
  throw "Missing long task blocker queue: $blockersPath"
}

Write-Host ""
Write-Host "=== AlphaMind Overnight Guardrail ===" -ForegroundColor Cyan
Write-Host "Repo: $repoRoot"
Write-Host "Plan: docs/OVERNIGHT_IMPLEMENTATION_PLAN.md"
Write-Host ""

Write-Host "Four anchors reminder:" -ForegroundColor Magenta
Write-Host "1. PLAN     -> docs/OVERNIGHT_IMPLEMENTATION_PLAN.md"
Write-Host "2. STATE    -> docs/LONG_TASK_STATE.md"
Write-Host "3. BLOCKERS -> docs/LONG_TASK_BLOCKERS.md"
Write-Host "4. GIT      -> branch, HEAD, dirty files, checkpoint policy"
Write-Host "Optional: SUB-AGENTS -> only if explicitly authorized; track in docs/LONG_TASK_STATE.md"
Write-Host ""

Write-Host "Required behavior:" -ForegroundColor Yellow
Write-Host "- Keep AlphaMind React UI."
Write-Host "- Use QuantDinger as an optional backend provider, not as a frontend replacement."
Write-Host "- Preserve mock fallback."
Write-Host "- Do not enable live trading."
Write-Host "- Do not commit secrets."
Write-Host "- Update docs/LONG_TASK_STATE.md as the task PCB after meaningful progress."
Write-Host "- Record user-only blockers in docs/LONG_TASK_BLOCKERS.md, then continue unblocked work."
Write-Host "- Record branch, HEAD, and git status in docs/LONG_TASK_STATE.md."
Write-Host "- Do not create checkpoint commits unless explicitly authorized."
Write-Host "- Use sub-agents only if explicitly authorized; track scopes/status/integration in docs/LONG_TASK_STATE.md."
Write-Host "- Run npm run build after meaningful implementation stages."
Write-Host ""

Write-Host "Final acceptance checklist:" -ForegroundColor Yellow
Write-Host "- npm run build passes."
Write-Host "- App works locally without QuantDinger."
Write-Host "- Asset X-Ray works in mock mode."
Write-Host "- QuantDinger mode is behind config/provider switch."
Write-Host "- Failed backend calls show a friendly UI state."
Write-Host "- Live trading remains disabled."
Write-Host "- No secrets are committed."
Write-Host "- New threads can resume from docs/LONG_TASK_STATE.md."
Write-Host "- User-only blockers are queued instead of causing idle waiting."
Write-Host "- Git branch/HEAD/checkpoint policy are recorded in docs/LONG_TASK_STATE.md."
Write-Host "- Sub-agent ledger is recorded if parallel agents are authorized."
Write-Host "- Final report includes changed files and verification results."

Write-Host ""
Write-Host "Resume and blocker policy:" -ForegroundColor Yellow
Write-Host "- On resume: read plan, state PCB, blocker queue, then continue from Next Unblocked Action."
Write-Host "- If a step requires QR scan, verification code, real-name check, payment, legal acceptance, or secret/API key creation, append it to docs/LONG_TASK_BLOCKERS.md."
Write-Host "- Continue with independent implementation, docs, tests, mocks, adapter work, and fallback preparation."
Write-Host "- Stop only if every remaining meaningful task depends on unresolved blockers or continuing would be unsafe."

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
Write-Host "Guardrail check complete. Re-read the plan before choosing the next edit." -ForegroundColor Green
