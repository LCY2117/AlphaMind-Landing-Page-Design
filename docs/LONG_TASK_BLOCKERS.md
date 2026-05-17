# Long Task Blockers

Use this file during unattended or overnight tasks. If Codex reaches something that requires the user personally, record the blocker here and continue with the next independent task instead of stopping the whole run.

## Active Blockers

| Time | Status | Priority / Task | User Action Needed | Service / URL | What Was Tried | Why Blocked | Work Continued |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-05-17 | active | QuantDinger Agent Gateway backtest verification | If real Agent Gateway backtest testing is desired, log into the self-hosted QuantDinger UI and create a read/backtest-scoped Agent token (`R,B`, `paper_only=true`, no `T`/`C` scopes), then place it in the server/runtime env outside source control | Self-hosted QuantDinger on server loopback `127.0.0.1:8888`, Agent UI `/#/agent-tokens` | QuantDinger runtime was started and indicator endpoints were verified without a token | Creating, viewing, or copying tokens is a user-only secret action; live trading remains disabled | Asset X-Ray now uses live QuantDinger indicator data; backtest stays on mock fallback until a scoped Agent token is supplied |
| 2026-05-17 | active | Optional fast analysis enrichment | Provide a local-only human JWT and confirm credit usage if `/api/fast-analysis/analyze` should be tested | QuantDinger `/api/fast-analysis/analyze` | Endpoint shape was inspected from raw source/docs | Human JWT may be sensitive and may consume credits, so it is queued instead of used unattended | Adapter makes this enrichment optional and falls back without it |
| 2026-05-17 | active | SiliconFlow AI chat activation | Rotate the SiliconFlow key that was pasted into chat, then place the new key only in server/runtime `.env.local` as `SILICONFLOW_API_KEY=...` | SiliconFlow `https://api.siliconflow.cn/v1/chat/completions` | Added a server-side AlphaMind chat proxy and frontend fallback path without storing the pasted key | The pasted key is exposed in chat history and should be treated as compromised; secrets must not be committed or put into frontend `VITE_*` variables | AI Advisor can call `/api/alphamind/chat`; without a server key it safely falls back to local demo analysis |

## Resolved Blockers

| Time | Priority / Task | Resolution |
| --- | --- | --- |
| 2026-05-17 | QuantDinger live runtime and indicator API verification | Resolved by cloning `brokermr810/QuantDinger` to `/opt/QuantDinger` on `104.248.151.6`, starting `docker-compose.ghcr.yml`, binding services to loopback, keeping `AGENT_LIVE_TRADING_ENABLED=false`, adding AlphaMind same-origin proxy `/api/quantdinger/`, and switching cloud AlphaMind to `VITE_ALPHAMIND_DATA_MODE=quantdinger`. Verified `GET /api/indicator/price` and `GET /api/indicator/kline` for TSLA through `https://alphamind.mddcommunity.top/api/quantdinger/api/...`. |
