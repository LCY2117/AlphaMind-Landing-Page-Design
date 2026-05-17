# SiliconFlow Chat Integration

AlphaMind AI Advisor can call SiliconFlow through a server-side proxy. The browser never receives the provider API key.

## Runtime Variables

Set these only in server/runtime `.env.local` or an equivalent secret manager:

```env
SILICONFLOW_API_KEY=
SILICONFLOW_FAST_MODEL=zai-org/GLM-4.5-Air
SILICONFLOW_DEEP_MODEL=Pro/zai-org/GLM-4.7
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1/chat/completions
```

Do not use `VITE_` for the API key. `VITE_*` values are bundled into browser JavaScript.

## Request Flow

```text
AI Advisor UI
  -> POST /api/alphamind/chat
  -> Vite server middleware
  -> POST https://api.siliconflow.cn/v1/chat/completions
```

The proxy:

- reads `SILICONFLOW_API_KEY` from the server environment
- sends `Authorization: Bearer <key>` to SiliconFlow
- forwards only the latest compact chat history
- routes normal questions to the fast model with thinking disabled
- routes deep-analysis questions to the deep model with thinking enabled
- returns normalized `{ content, model, mode, thinkingEnabled, source }`
- returns a safe error when the provider is not configured or unavailable

The frontend:

- uses SiliconFlow responses when available
- clearly labels the message source as `硅基流动 AI`
- falls back to local demo analysis when the proxy is not configured or the provider fails
- keeps Asset X-Ray stock-intent messages routed to the QuantDinger-backed asset page

## Security Notes

If an API key was pasted into chat, treat it as exposed. Rotate it in SiliconFlow before placing a new key on the server.

Never commit real keys to:

- `.env.example`
- source files
- docs
- Git history
- frontend `VITE_*` variables

## Validation

Without a server key:

```powershell
npm run dev -- --host 127.0.0.1 --port 5180
```

```powershell
Invoke-WebRequest -Method Post `
  -Uri http://127.0.0.1:5180/api/alphamind/chat `
  -ContentType application/json `
  -Body '{"messages":[{"role":"user","content":"如何开始投资理财？"}]}'
```

Expected result: HTTP 503 from the proxy, and the frontend falls back to local demo analysis.

With a server key configured, the same request should return HTTP 200 with `source: "siliconflow"`.

## Latency Notes

The default fast model is `zai-org/GLM-4.5-Air` because AlphaMind's chat panel favors responsive product guidance. Deep analysis uses `Pro/zai-org/GLM-4.7` with thinking enabled, but the UI should frame the visible output as a public reasoning summary rather than raw hidden chain-of-thought.
