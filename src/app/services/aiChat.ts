export interface AlphaMindChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export type AlphaMindChatMode = 'fast' | 'deep';

export interface AlphaMindChatResponse {
  content: string;
  source: 'siliconflow' | 'fallback';
  model?: string;
  mode?: AlphaMindChatMode;
  hasImage?: boolean;
  thinkingEnabled?: boolean;
  reasoningContent?: string;
  error?: string;
}

export interface AlphaMindChatStreamHandlers {
  onMeta?: (payload: Partial<AlphaMindChatResponse>) => void;
  onReasoningDelta?: (delta: string) => void;
  onContentDelta?: (delta: string) => void;
}

const mapChatError = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'AI response timed out';
  }

  if (error instanceof Error) {
    return error.message === 'Failed to fetch'
      ? '网络请求失败，可能是图片过大、网络连接中断或服务暂时不可达。'
      : error.message;
  }

  return 'AI chat unavailable';
};

const parseSseBlock = (block: string) => {
  const lines = block.split(/\r?\n/);
  let event = 'message';
  const dataLines: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  });

  if (dataLines.length === 0) return null;

  return {
    event,
    payload: JSON.parse(dataLines.join('\n')),
  };
};

export async function askAlphaMindChat(
  messages: AlphaMindChatMessage[],
  mode: AlphaMindChatMode = 'fast',
): Promise<AlphaMindChatResponse> {
  const controller = new AbortController();
  const hasImage = messages.some((message) => Boolean(message.imageUrl));
  const timeoutMs = hasImage ? (mode === 'deep' ? 90000 : 60000) : mode === 'deep' ? 60000 : 30000;
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
      hasImage: payload?.hasImage === true,
      thinkingEnabled: payload?.thinkingEnabled === true,
      reasoningContent: typeof payload?.reasoningContent === 'string' ? payload.reasoningContent.trim() : undefined,
    };
  } catch (error) {
    return {
      content: '',
      source: 'fallback',
      error: mapChatError(error),
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function askAlphaMindChatStream(
  messages: AlphaMindChatMessage[],
  mode: AlphaMindChatMode = 'deep',
  handlers: AlphaMindChatStreamHandlers = {},
): Promise<AlphaMindChatResponse> {
  const controller = new AbortController();
  const hasImage = messages.some((message) => Boolean(message.imageUrl));
  const timeoutMs = hasImage ? 150000 : 120000;
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  let content = '';
  let reasoningContent = '';
  let model: string | undefined;
  let thinkingEnabled = mode === 'deep';
  let responseMode: AlphaMindChatMode = mode;
  let responseHasImage = hasImage;

  try {
    const response = await fetch('/api/alphamind/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, mode, stream: true }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const message = typeof payload?.error === 'string' ? payload.error : `HTTP ${response.status}`;
      throw new Error(message);
    }

    if (!response.body) {
      throw new Error('AI stream unavailable');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let donePayload: any = null;

    const consumeBlock = (block: string) => {
      const parsed = parseSseBlock(block);
      if (!parsed) return;

      const { event, payload } = parsed;
      if (event === 'meta') {
        model = typeof payload.model === 'string' ? payload.model : model;
        responseMode = payload.mode === 'deep' ? 'deep' : 'fast';
        responseHasImage = payload.hasImage === true;
        thinkingEnabled = payload.thinkingEnabled === true;
        handlers.onMeta?.({
          source: payload.source === 'siliconflow' ? 'siliconflow' : 'fallback',
          model,
          mode: responseMode,
          hasImage: responseHasImage,
          thinkingEnabled,
        });
        return;
      }

      if (event === 'reasoning') {
        const delta = typeof payload.delta === 'string' ? payload.delta : '';
        if (!delta) return;
        reasoningContent += delta;
        handlers.onReasoningDelta?.(delta);
        return;
      }

      if (event === 'content') {
        const delta = typeof payload.delta === 'string' ? payload.delta : '';
        if (!delta) return;
        content += delta;
        handlers.onContentDelta?.(delta);
        return;
      }

      if (event === 'done') {
        donePayload = payload;
        if (typeof payload.content === 'string' && payload.content.trim()) {
          content = payload.content;
        }
        if (typeof payload.reasoningContent === 'string' && payload.reasoningContent.trim()) {
          reasoningContent = payload.reasoningContent;
        }
        model = typeof payload.model === 'string' ? payload.model : model;
        responseMode = payload.mode === 'deep' ? 'deep' : responseMode;
        responseHasImage = payload.hasImage === true;
        thinkingEnabled = payload.thinkingEnabled === true;
        return;
      }

      if (event === 'error') {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'AI stream failed');
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      while (true) {
        const boundaryMatch = buffer.match(/\r?\n\r?\n/);
        if (!boundaryMatch || boundaryMatch.index === undefined) break;

        const block = buffer.slice(0, boundaryMatch.index);
        buffer = buffer.slice(boundaryMatch.index + boundaryMatch[0].length);
        consumeBlock(block);
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      consumeBlock(buffer);
    }

    const finalContent = content.trim();
    if (!finalContent) {
      throw new Error('AI returned empty content');
    }

    return {
      content: finalContent,
      source: 'siliconflow',
      model: typeof donePayload?.model === 'string' ? donePayload.model : model,
      mode: responseMode,
      hasImage: responseHasImage,
      thinkingEnabled,
      reasoningContent: reasoningContent.trim(),
    };
  } catch (error) {
    return {
      content: '',
      source: 'fallback',
      error: mapChatError(error),
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
