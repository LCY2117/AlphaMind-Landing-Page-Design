import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function sendJson(res, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function startSse(res) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()
}

function sendSse(res, event: string, payload: unknown) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function readJsonBody(req): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = ''
    let tooLarge = false

    req.on('data', (chunk) => {
      if (tooLarge) return
      body += chunk
      if (body.length > 6_000_000) {
        tooLarge = true
        reject(new Error('Request body too large'))
      }
    })

    req.on('end', () => {
      if (tooLarge) return
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })

    req.on('error', reject)
  })
}

function normalizeChatMessages(input: unknown) {
  if (!Array.isArray(input)) return []

  return input
    .filter((message) => {
      if (!message || typeof message !== 'object') return false
      const role = (message as Record<string, unknown>).role
      const content = (message as Record<string, unknown>).content
      const imageUrl = (message as Record<string, unknown>).imageUrl
      return (
        (role === 'user' || role === 'assistant') &&
        ((typeof content === 'string' && content.trim()) || (role === 'user' && typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')))
      )
    })
    .slice(-8)
    .map((message) => {
      const item = message as { role: 'user' | 'assistant'; content?: string; imageUrl?: string }
      return {
        role: item.role,
        content: (item.content ?? '').slice(0, 1600),
        imageUrl: item.role === 'user' && item.imageUrl?.startsWith('data:image/') ? item.imageUrl.slice(0, 5_500_000) : undefined,
      }
    })
}

function toProviderMessages(messages: ReturnType<typeof normalizeChatMessages>) {
  return messages.map((message) => {
    if (message.role === 'user' && message.imageUrl) {
      return {
        role: message.role,
        content: [
          { type: 'text', text: message.content || '请分析这张图片，并提取与投资、财务或页面信息相关的要点。' },
          { type: 'image_url', image_url: { url: message.imageUrl } },
        ],
      }
    }

    return {
      role: message.role,
      content: message.content,
    }
  })
}

function extractSiliconFlowError(payload: any, status: number) {
  return typeof payload?.message === 'string'
    ? payload.message
    : typeof payload?.error?.message === 'string'
      ? payload.error.message
      : typeof payload?.error === 'string'
        ? payload.error
        : `SiliconFlow HTTP ${status}`
}

function isUnsupportedThinkingError(message: string) {
  const normalized = message.toLowerCase()
  return normalized.includes('enable_thinking') && (
    normalized.includes('not support') ||
    normalized.includes('does not support') ||
    normalized.includes('unsupported') ||
    normalized.includes('value error')
  )
}

function toPublicReasoningSummary(input: string) {
  const text = input.trim()
  if (!text) return ''

  const blockedPatterns = [
    /system prompt/gi,
    /developer message/gi,
    /chain[- ]?of[- ]?thought/gi,
    /你是.{0,24}(?:助手|顾问|模型)/g,
    /不要提及.{0,80}/g,
    /比赛|医创赛|演示项目/g,
    /内部(?:开发|实现|提示|指令)/g,
  ]

  const sanitized = text
    .split(/\r?\n+/)
    .map((line) => blockedPatterns.reduce((acc, pattern) => acc.replace(pattern, '公开分析边界'), line).trim())
    .filter(Boolean)
    .slice(0, 4)

  if (!sanitized.length) {
    return [
      '1. 问题拆解：先界定资产、期限与风险边界。',
      '2. 关键假设：以用户已提供信息为主，不补造未给出的个人约束。',
      '3. 风险因素：重点检查市场波动、流动性和集中度。',
      '4. 结论边界：仅输出研究辅助，不替代独立决策。',
    ].join('\n')
  }

  return sanitized
    .map((line, index) => `${index + 1}. ${line.replace(/^\d+[.)、]\s*/, '')}`)
    .join('\n')
}

async function readSiliconFlowError(response: Response) {
  const payload = await response.json().catch(() => ({}))
  return {
    payload,
    message: extractSiliconFlowError(payload, response.status),
  }
}

function readServerEnv(env: Record<string, string>, name: string) {
  return (process.env[name] || env[name] || '').trim()
}

function normalizeProviderBaseUrl(value: string | undefined, fallback: string) {
  return (value?.trim() || fallback).replace(/\/+$/, '')
}

function buildProviderUrl(baseUrl: string, pathName: string, params: Record<string, string | number | undefined>) {
  const cleanPath = pathName.trim().replace(/^\/+/, '')
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const url = cleanPath ? new URL(cleanPath, base) : new URL(baseUrl)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim()) {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

function normalizeProviderSymbol(input: unknown) {
  const symbol = typeof input === 'string' ? input.trim().toUpperCase() : ''
  return symbol.replace(/[^A-Z0-9./-]/g, '').slice(0, 12) || 'TSLA'
}

function sanitizeProviderError(error: unknown) {
  if (error instanceof Error && error.message) return error.message.replace(/token=[^&\s]+/gi, 'token=***').replace(/apiKey=[^&\s]+/gi, 'apiKey=***')
  return 'provider unavailable'
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 9000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = typeof payload?.error === 'string'
        ? payload.error
        : typeof payload?.message === 'string'
          ? payload.message
          : `HTTP ${response.status}`
      throw new Error(message)
    }
    return payload
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('provider request timed out')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

function alphaMindAssetXRayProxy(env: Record<string, string>): Plugin {
  const finnhubKey = readServerEnv(env, 'FINNHUB_API_KEY')
  const finnhubBaseUrl = normalizeProviderBaseUrl(readServerEnv(env, 'FINNHUB_BASE_URL'), 'https://finnhub.io/api/v1')
  const twelveDataKey = readServerEnv(env, 'TWELVE_DATA_API_KEY')
  const twelveDataBaseUrl = normalizeProviderBaseUrl(readServerEnv(env, 'TWELVE_DATA_BASE_URL'), 'https://api.twelvedata.com')
  const newsApiKey = readServerEnv(env, 'NEWSAPI_KEY')
  const newsApiBaseUrl = normalizeProviderBaseUrl(readServerEnv(env, 'NEWSAPI_BASE_URL'), 'https://newsapi.org')

  return {
    name: 'alphamind-asset-xray-proxy',
    configureServer(server) {
      server.middlewares.use('/api/alphamind/asset-xray', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }

        const requestUrl = new URL(req.url || '/', 'http://localhost')
        const symbol = normalizeProviderSymbol(requestUrl.searchParams.get('symbol'))

        if (!finnhubKey && !twelveDataKey && !newsApiKey) {
          sendJson(res, 503, {
            error: 'Market data providers are not configured',
            source: 'not_configured',
          })
          return
        }

        const providerErrors: Record<string, string> = {}
        const requests: Array<Promise<void>> = []
        const payload: Record<string, unknown> = {
          symbol,
          providers: {
            finnhub: Boolean(finnhubKey),
            twelveData: Boolean(twelveDataKey),
            newsapi: Boolean(newsApiKey),
          },
        }

        if (finnhubKey) {
          requests.push(
            fetchJsonWithTimeout(buildProviderUrl(finnhubBaseUrl, 'quote', { symbol, token: finnhubKey }))
              .then((quote) => {
                payload.quote = quote
              })
              .catch((error) => {
                providerErrors.finnhubQuote = sanitizeProviderError(error)
              }),
          )
          requests.push(
            fetchJsonWithTimeout(buildProviderUrl(finnhubBaseUrl, 'stock/profile2', { symbol, token: finnhubKey }))
              .then((profile) => {
                payload.profile = profile
              })
              .catch((error) => {
                providerErrors.finnhubProfile = sanitizeProviderError(error)
              }),
          )
        }

        if (twelveDataKey) {
          requests.push(
            fetchJsonWithTimeout(buildProviderUrl(twelveDataBaseUrl, 'time_series', {
              symbol,
              interval: '1day',
              outputsize: 90,
              apikey: twelveDataKey,
            }))
              .then((series) => {
                payload.timeSeries = series
              })
              .catch((error) => {
                providerErrors.twelveData = sanitizeProviderError(error)
              }),
          )
        }

        if (newsApiKey) {
          const lowerBase = newsApiBaseUrl.toLowerCase()
          const newsUrl = lowerBase.endsWith('/everything')
            ? buildProviderUrl(newsApiBaseUrl, '', { q: symbol, language: 'en', pageSize: 8, sortBy: 'publishedAt', apiKey: newsApiKey })
            : buildProviderUrl(newsApiBaseUrl, lowerBase.endsWith('/v2') ? 'everything' : 'v2/everything', {
                q: symbol,
                language: 'en',
                pageSize: 8,
                sortBy: 'publishedAt',
                apiKey: newsApiKey,
              })
          requests.push(
            fetchJsonWithTimeout(newsUrl, 4500)
              .then((news) => {
                payload.news = news
              })
              .catch((error) => {
                providerErrors.newsapi = sanitizeProviderError(error)
              }),
          )
        }

        await Promise.all(requests)

        const hasAnyData = Boolean(payload.quote || payload.profile || payload.timeSeries || payload.news)
        if (!hasAnyData) {
          sendJson(res, 502, {
            error: 'All market data providers failed',
            source: 'marketdata',
            providerErrors,
          })
          return
        }

        sendJson(res, 200, {
          ...payload,
          source: 'marketdata',
          providerErrors,
          fetchedAt: new Date().toISOString(),
        })
      })
    },
  }
}

function safeStringList(value: unknown, limit = 3) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, limit)
}

function extractJsonObject(text: string) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim()
  const source = fenced || trimmed
  const start = source.indexOf('{')
  const end = source.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI sentiment response is not JSON')
  }
  return JSON.parse(source.slice(start, end + 1))
}

function normalizeSentimentJson(input: any, model: string) {
  const score = Math.max(5, Math.min(95, Math.round(Number(input?.score) || 50)))
  const label = typeof input?.label === 'string' && input.label.trim()
    ? input.label.trim().slice(0, 12)
    : score >= 78 ? '贪婪' : score >= 62 ? '偏贪婪' : score >= 45 ? '中性' : score >= 30 ? '谨慎' : '恐慌'

  return {
    score,
    label,
    summary: typeof input?.summary === 'string' && input.summary.trim()
      ? input.summary.trim().slice(0, 180)
      : 'AI 已完成多空情绪校准，但摘要不足。',
    reasons: safeStringList(input?.reasons, 4),
    bullish: safeStringList(input?.bullish, 3),
    bearish: safeStringList(input?.bearish, 3),
    confidence: Math.max(0, Math.min(95, Math.round(Number(input?.confidence) || 55))),
    source: 'siliconflow',
    model,
    updatedAt: new Date().toISOString(),
  }
}

function alphaMindAssetSentimentProxy(env: Record<string, string>): Plugin {
  const endpoint = env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions'
  const fastModel = env.SILICONFLOW_SENTIMENT_MODEL || env.SILICONFLOW_FAST_MODEL || env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct'

  return {
    name: 'alphamind-asset-sentiment-proxy',
    configureServer(server) {
      server.middlewares.use('/api/alphamind/asset-sentiment', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }

        const apiKey = process.env.SILICONFLOW_API_KEY || env.SILICONFLOW_API_KEY
        if (!apiKey) {
          sendJson(res, 503, { error: 'SiliconFlow is not configured', source: 'not_configured' })
          return
        }

        try {
          const body = await readJsonBody(req)
          const symbol = normalizeProviderSymbol(body.symbol)
          const news = Array.isArray(body.news) ? body.news.slice(0, 6) : []
          const compactNews = news
            .map((item: any, index: number) => `${index + 1}. ${String(item?.title || '').slice(0, 160)} ${String(item?.description || '').slice(0, 180)}`.trim())
            .filter((line: string) => line.length > 4)

          const systemPrompt = [
            '你是 AlphaMind 的金融市场情绪分析器，只输出严格 JSON。',
            '任务：根据股票行情、动量、波动率和新闻标题，生成专业的多空情绪评分与理由。',
            '不要输出 Markdown，不要输出投资建议，不要承诺涨跌，不要暴露思考过程。',
            'score 为 0-100，0 极度恐慌，50 中性，100 极度贪婪。',
            'JSON schema: {"score":number,"label":"恐慌|谨慎|中性|偏贪婪|贪婪","summary":string,"reasons":string[],"bullish":string[],"bearish":string[],"confidence":number}',
          ].join('\n')

          const userPrompt = [
            `标的：${symbol} ${String(body.name || '')}`,
            `价格：${String(body.price || '未知')}，涨跌：${String(body.change || '未知')}`,
            `动量分：${String(body.momentumScore ?? '未知')}/100`,
            `波动分：${String(body.volatilityScore ?? '未知')}/100`,
            `规则情绪分：${String(body.ruleSentimentScore ?? '未知')}/100`,
            `新闻样本：\n${compactNews.length ? compactNews.join('\n') : '暂无新闻样本，请降低置信度并说明原因。'}`,
            '请输出中文，理由短而具体，每个数组 2-3 条。',
          ].join('\n')

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 6500)

          try {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: fastModel,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt },
                ],
                temperature: 0.2,
                max_tokens: 520,
                stream: false,
              }),
              signal: controller.signal,
            })

            const payload = await response.json().catch(() => ({}))
            if (!response.ok) {
              sendJson(res, 502, { error: extractSiliconFlowError(payload, response.status), source: 'siliconflow' })
              return
            }

            const content = payload?.choices?.[0]?.message?.content
            if (typeof content !== 'string' || !content.trim()) {
              sendJson(res, 502, { error: 'Empty SiliconFlow sentiment response', source: 'siliconflow' })
              return
            }

            const parsed = extractJsonObject(content)
            sendJson(res, 200, normalizeSentimentJson(parsed, payload.model || fastModel))
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              sendJson(res, 504, { error: 'SiliconFlow sentiment request timed out', source: 'siliconflow' })
              return
            }
            throw error
          } finally {
            clearTimeout(timeoutId)
          }
        } catch (error) {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : 'AlphaMind sentiment proxy failed',
            source: 'server',
          })
        }
      })
    },
  }
}

function alphaMindChatProxy(env: Record<string, string>): Plugin {
  const endpoint = env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions'
  const fastModel = env.SILICONFLOW_FAST_MODEL || env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
  const deepModel = env.SILICONFLOW_DEEP_MODEL || 'Pro/zai-org/GLM-4.7'
  const visionModel = env.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct'
  const visionDeepModel = env.SILICONFLOW_VISION_DEEP_MODEL || 'Qwen/Qwen3-VL-8B-Thinking'

  return {
    name: 'alphamind-chat-proxy',
    configureServer(server) {
      server.middlewares.use('/api/alphamind/chat', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }

        const apiKey = process.env.SILICONFLOW_API_KEY || env.SILICONFLOW_API_KEY
        if (!apiKey) {
          sendJson(res, 503, {
            error: 'SiliconFlow is not configured',
            source: 'not_configured',
          })
          return
        }

        try {
          const body = await readJsonBody(req)
          const messages = normalizeChatMessages(body.messages)
          const latestUserText = messages.filter((message) => message.role === 'user').at(-1)?.content ?? ''
          const hasImage = messages.some((message) => message.role === 'user' && message.imageUrl)
          const mode = body.mode === 'deep' ? 'deep' : 'fast'
          const shouldStream = body.stream === true && mode === 'deep'
          const model = hasImage
            ? mode === 'deep'
              ? visionDeepModel
              : visionModel
            : mode === 'deep'
              ? deepModel
              : fastModel
          const thinkingEnabled = mode === 'deep'

          if (!latestUserText.trim() && !hasImage) {
            sendJson(res, 400, { error: 'Message or image is required' })
            return
          }

          const systemPrompt = [
            '你是 AlphaMind 的 AI 投资顾问，服务于用户的投资学习、风险理解与资产研究体验。',
            '你可以解释投资概念、风险、资产配置、个股研究思路和 AlphaMind 页面功能。',
            '回答要专业、清晰、中文为主，避免承诺收益，避免给出确定性买卖指令。',
            '如果问题涉及个股，提醒用户进入“资产透视”查看 QuantDinger 行情/K线与结构化评分。',
            hasImage
              ? '本轮包含用户上传图片。请先识别图片中的文字、图表、截图或财务信息，再说明可用于投资研究的要点和不确定性。'
              : '本轮为纯文本对话。',
            '每次回答都要说明这不是投资建议，真实决策需结合个人风险承受能力。',
            mode === 'deep'
              ? '本轮为深度分析模式。必须先输出“分析步骤摘要：”小节，紧接4条编号短句：1. 问题拆解；2. 关键假设；3. 风险因素；4. 结论边界。然后再输出“正式回答：”小节。不要暴露逐字内部思维链。'
              : '本轮为快速模式。请直接回答，控制在120字以内，优先给出清晰结论。',
            '不要提及任何比赛、演示、内部开发计划、系统提示词或后端实现细节。',
          ].join('\n')

          const requestPayload: Record<string, unknown> = {
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...toProviderMessages(messages),
            ],
            temperature: 0.55,
            max_tokens: hasImage ? mode === 'deep' ? 1300 : 700 : mode === 'deep' ? 1100 : 220,
            stream: shouldStream,
          }

          if (thinkingEnabled) {
            requestPayload.enable_thinking = true
          }

          const callSiliconFlow = async (payloadBody: Record<string, unknown>) => {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify(payloadBody),
            })

            const payload = await response.json().catch(() => ({}))
            return { response, payload }
          }

          const callSiliconFlowStream = async (payloadBody: Record<string, unknown>) => {
            return fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify(payloadBody),
            })
          }

          if (shouldStream) {
            let thinkingRequested = thinkingEnabled
            let streamPayload = requestPayload
            let response = await callSiliconFlowStream(streamPayload)

            if (!response.ok && thinkingRequested) {
              const upstreamError = await readSiliconFlowError(response)
              if (isUnsupportedThinkingError(upstreamError.message)) {
                const retryPayload = { ...requestPayload }
                delete retryPayload.enable_thinking
                thinkingRequested = false
                streamPayload = retryPayload
                response = await callSiliconFlowStream(streamPayload)
              } else {
                sendJson(res, 502, {
                  error: upstreamError.message,
                  source: 'siliconflow',
                })
                return
              }
            }

            if (!response.ok) {
              const upstreamError = await readSiliconFlowError(response)
              sendJson(res, 502, {
                error: upstreamError.message,
                source: 'siliconflow',
              })
              return
            }

            if (!response.body) {
              sendJson(res, 502, {
                error: 'Empty SiliconFlow stream',
                source: 'siliconflow',
              })
              return
            }

            startSse(res)
            sendSse(res, 'meta', {
              model,
              mode,
              hasImage,
              thinkingEnabled: thinkingRequested,
              source: 'siliconflow',
            })

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let content = ''
            let reasoningContent = ''
            let providerModel = model
            let usage

            const handleSseBlock = (block: string) => {
              const data = block
                .split(/\r?\n/)
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.slice(5).trimStart())
                .join('\n')

              if (!data || data === '[DONE]') return

              let chunk
              try {
                chunk = JSON.parse(data)
              } catch {
                return
              }

              if (typeof chunk?.model === 'string') providerModel = chunk.model
              if (chunk?.usage) usage = chunk.usage

              const delta = chunk?.choices?.[0]?.delta ?? {}
              const reasoningDelta = typeof delta.reasoning_content === 'string' ? delta.reasoning_content : ''
              const contentDelta = typeof delta.content === 'string' ? delta.content : ''

              if (reasoningDelta) {
                reasoningContent += reasoningDelta
              }

              if (contentDelta) {
                content += contentDelta
                sendSse(res, 'content', { delta: contentDelta })
              }
            }

            try {
              while (true) {
                const { value, done } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })

                while (true) {
                  const boundaryMatch = buffer.match(/\r?\n\r?\n/)
                  if (!boundaryMatch || boundaryMatch.index === undefined) break

                  const block = buffer.slice(0, boundaryMatch.index)
                  buffer = buffer.slice(boundaryMatch.index + boundaryMatch[0].length)
                  handleSseBlock(block)
                }
              }

              buffer += decoder.decode()
              if (buffer.trim()) handleSseBlock(buffer)

              if (!content.trim()) {
                sendSse(res, 'error', {
                  error: 'Empty SiliconFlow response',
                  source: 'siliconflow',
                })
              } else {
                sendSse(res, 'done', {
                  content: content.trim(),
                  model: providerModel,
                  mode,
                  hasImage,
                  thinkingEnabled: thinkingRequested,
                  reasoningContent: toPublicReasoningSummary(reasoningContent),
                  source: 'siliconflow',
                  usage,
                })
              }
            } catch (streamError) {
              sendSse(res, 'error', {
                error: streamError instanceof Error ? streamError.message : 'AlphaMind chat stream failed',
                source: 'server',
              })
            } finally {
              res.end()
            }
            return
          }

          let thinkingRequested = thinkingEnabled
          let { response, payload } = await callSiliconFlow(requestPayload)
          if (!response.ok && thinkingRequested) {
            const upstreamMessage = extractSiliconFlowError(payload, response.status)
            if (isUnsupportedThinkingError(upstreamMessage)) {
              const retryPayload = { ...requestPayload }
              delete retryPayload.enable_thinking
              thinkingRequested = false
              ;({ response, payload } = await callSiliconFlow(retryPayload))
            }
          }

          if (!response.ok) {
            const upstreamMessage = extractSiliconFlowError(payload, response.status)
            sendJson(res, 502, {
              error: upstreamMessage,
              source: 'siliconflow',
            })
            return
          }

          const message = payload?.choices?.[0]?.message
          const content = message?.content
          const reasoningContent = typeof message?.reasoning_content === 'string'
            ? message.reasoning_content.trim()
            : ''
          if (typeof content !== 'string' || !content.trim()) {
            sendJson(res, 502, {
              error: 'Empty SiliconFlow response',
              source: 'siliconflow',
            })
            return
          }

          sendJson(res, 200, {
            content: content.trim(),
            model: payload.model || model,
            mode,
            hasImage,
            thinkingEnabled: thinkingRequested,
            reasoningContent: toPublicReasoningSummary(reasoningContent),
            source: 'siliconflow',
            usage: payload.usage,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'AlphaMind chat proxy failed'
          if (message === 'Request body too large') {
            sendJson(res, 413, {
              error: '图片或对话内容过大，请裁剪图片或降低图片清晰度后重试。',
              source: 'server',
            })
            return
          }

          sendJson(res, 500, {
            error: message,
            source: 'server',
          })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      figmaAssetResolver(),
      alphaMindAssetXRayProxy(env),
      alphaMindAssetSentimentProxy(env),
      alphaMindChatProxy(env),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      allowedHosts: ['alphamind.mddcommunity.top']
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
