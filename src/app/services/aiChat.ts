export interface AlphaMindChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AlphaMindChatMode = 'fast' | 'deep';

export interface AlphaMindChatResponse {
  content: string;
  source: 'siliconflow' | 'fallback';
  model?: string;
  mode?: AlphaMindChatMode;
  thinkingEnabled?: boolean;
  error?: string;
}

export async function askAlphaMindChat(
  messages: AlphaMindChatMessage[],
  mode: AlphaMindChatMode = 'fast',
): Promise<AlphaMindChatResponse> {
  const controller = new AbortController();
  const timeoutMs = mode === 'deep' ? 60000 : 30000;
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('/api/alphamind/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, mode }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof payload?.error === 'string' ? payload.error : `HTTP ${response.status}`;
      throw new Error(message);
    }

    const content = typeof payload?.content === 'string' ? payload.content.trim() : '';
    if (!content) {
      throw new Error('AI returned empty content');
    }

    return {
      content,
      source: payload?.source === 'siliconflow' ? 'siliconflow' : 'fallback',
      model: typeof payload?.model === 'string' ? payload.model : undefined,
      mode: payload?.mode === 'deep' ? 'deep' : 'fast',
      thinkingEnabled: payload?.thinkingEnabled === true,
    };
  } catch (error) {
    const message = error instanceof DOMException && error.name === 'AbortError'
      ? 'AI response timed out'
      : error instanceof Error
        ? error.message
        : 'AI chat unavailable';

    return {
      content: '',
      source: 'fallback',
      error: message,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
