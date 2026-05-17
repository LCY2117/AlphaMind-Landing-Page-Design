# QuantDinger Integration

AlphaMind keeps its React frontend and product experience. QuantDinger is treated as an optional backend capability provider for market data, asset analysis, and future backtests.

## Modes

Configure AlphaMind with `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

```env
VITE_ALPHAMIND_DATA_MODE=mock
VITE_QUANTDINGER_BASE_URL=http://localhost:8888
```

Modes:

- `mock`: default. Uses local AlphaMind demo reports.
- `quantdinger`: calls QuantDinger when available and falls back to mock reports on failure.

## Current AlphaMind Usage

`Asset X-Ray` now consumes an AlphaMind domain model from `src/app/services/assetXRay.ts`.

Provider behavior:

- If `VITE_ALPHAMIND_DATA_MODE=mock`, use local reports.
- If `VITE_ALPHAMIND_DATA_MODE=quantdinger` and `VITE_QUANTDINGER_AGENT_TOKEN` is set, call Agent Gateway:
  - `GET /api/agent/v1/price`
  - `GET /api/agent/v1/klines`
- If `VITE_ALPHAMIND_DATA_MODE=quantdinger` and no agent token is set, try the local web API:
  - `GET /api/indicator/price`
  - `GET /api/indicator/kline`
- If `VITE_QUANTDINGER_AUTH_TOKEN` is set, optionally enrich with:
  - `POST /api/fast-analysis/analyze`

All QuantDinger failures are non-fatal. AlphaMind shows a fallback badge and continues with mock data.

## Chat Handoff

`AI Advisor` recognizes stock-analysis requests such as:

- `分析 TSLA`
- `帮我分析一下特斯拉`
- `看看 MSFT 怎么样`

The chat response shows an `打开 {symbol} 资产透视` action. That action opens `Asset X-Ray` with the detected symbol and starts the scan flow on that symbol.

When QuantDinger is unavailable, unsupported symbols keep the requested ticker visible and use a clearly marked local template fallback instead of silently replacing the request with TSLA.

## Backtest Placeholder

`src/app/services/backtest.ts` reserves the future QuantDinger backtest integration surface.

Behavior:

- In `mock` mode, `submitAlphaMindBacktest()` returns a local simulated result.
- In `quantdinger` mode without `VITE_QUANTDINGER_AGENT_TOKEN`, it returns mock fallback with an explanatory message.
- In `quantdinger` mode with an Agent token, it calls:
  - `POST /api/agent/v1/backtests`
  - `GET /api/agent/v1/jobs/{job_id}`

The placeholder strategy is a research/demo SMA strategy and includes `live_trading_enabled: false`. It does not trigger live trading.

## Adapter Resilience

The frontend adapter is intentionally defensive:

- market-data and K-line requests have an 8 second timeout
- optional `fast-analysis` enrichment is allowed to fail without failing the whole scan
- both QuantDinger envelope responses and raw JSON payloads are accepted
- failed backend calls fall back to local reports with an inline provider message

## Recommended QuantDinger Token Policy

For AlphaMind, prefer an Agent Gateway token with only:

- `R`: market data/read
- `B`: backtest/simulation

Avoid:

- `T`: trading
- `C`: credentials

Keep live trading disabled:

```env
AGENT_LIVE_TRADING_ENABLED=false
QUANTDINGER_DEPLOYMENT_MODE=saas
```

Use `paper_only=true` when creating agent tokens.

## Known Blockers

- The Git clone of `brokermr810/QuantDinger` failed in this run because the connection was reset. Raw GitHub files were still accessible and used for API verification.
- `/api/fast-analysis/analyze` is a human-JWT API and may consume credits when billing is enabled.
- Agent Gateway currently exposes market data and backtest jobs, but not a first-class AI asset-analysis endpoint.
- Full live verification requires a running local QuantDinger service and a read/backtest-scoped token.

These blockers are also tracked in `docs/LONG_TASK_BLOCKERS.md` so long-running work can continue without waiting for secrets or human confirmations.

## Next Integration Step

Add a small server-side AlphaMind proxy if the project grows beyond local testing. That proxy should keep QuantDinger JWT/agent tokens out of browser source and normalize QuantDinger envelopes into AlphaMind domain objects.
