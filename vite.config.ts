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

function readJsonBody(req): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 80_000) {
        reject(new Error('Request body too large'))
        req.destroy()
      }
    })

    req.on('end', () => {
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
      return (role === 'user' || role === 'assistant') && typeof content === 'string' && content.trim()
    })
    .slice(-8)
    .map((message) => {
      const item = message as { role: 'user' | 'assistant'; content: string }
      return {
        role: item.role,
        content: item.content.slice(0, 1600),
      }
    })
}

function alphaMindChatProxy(env: Record<string, string>): Plugin {
  const endpoint = env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1/chat/completions'
  const model = env.SILICONFLOW_MODEL || 'Pro/zai-org/GLM-4.7'

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

          if (!latestUserText.trim()) {
            sendJson(res, 400, { error: 'Message is required' })
            return
          }

          const systemPrompt = [
            '你是 AlphaMind 的 AI 投资顾问，面向医学创新竞赛项目演示。',
            '你可以解释投资概念、风险、资产配置、个股研究思路和 AlphaMind 页面功能。',
            '回答要专业、清晰、中文为主，避免承诺收益，避免给出确定性买卖指令。',
            '如果问题涉及个股，提醒用户进入“资产透视”查看 QuantDinger 行情/K线与结构化评分。',
            '每次回答都要说明这不是投资建议，真实决策需结合个人风险承受能力。',
          ].join('\n')

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
              ],
              temperature: 0.55,
              max_tokens: 900,
              stream: false,
            }),
          })

          const payload = await response.json().catch(() => ({}))
          if (!response.ok) {
            const upstreamMessage = typeof payload?.message === 'string'
              ? payload.message
              : typeof payload?.error?.message === 'string'
                ? payload.error.message
                : `SiliconFlow HTTP ${response.status}`
            sendJson(res, 502, {
              error: upstreamMessage,
              source: 'siliconflow',
            })
            return
          }

          const content = payload?.choices?.[0]?.message?.content
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
            source: 'siliconflow',
            usage: payload.usage,
          })
        } catch (error) {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : 'AlphaMind chat proxy failed',
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
