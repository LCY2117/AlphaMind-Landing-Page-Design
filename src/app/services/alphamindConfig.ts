export type AlphaMindDataMode = 'mock' | 'quantdinger';

export interface AlphaMindIntegrationConfig {
  dataMode: AlphaMindDataMode;
  quantDingerBaseUrl: string;
  quantDingerAgentToken?: string;
  quantDingerAuthToken?: string;
}

function readEnv(name: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[name]?.trim();
  return value || undefined;
}

function normalizeDataMode(value: string | undefined): AlphaMindDataMode {
  return value === 'quantdinger' ? 'quantdinger' : 'mock';
}

export function getAlphaMindConfig(): AlphaMindIntegrationConfig {
  return {
    dataMode: normalizeDataMode(readEnv('VITE_ALPHAMIND_DATA_MODE')),
    quantDingerBaseUrl: readEnv('VITE_QUANTDINGER_BASE_URL') ?? 'http://localhost:8888',
    quantDingerAgentToken: readEnv('VITE_QUANTDINGER_AGENT_TOKEN'),
    quantDingerAuthToken: readEnv('VITE_QUANTDINGER_AUTH_TOKEN'),
  };
}

export function isQuantDingerMode() {
  return getAlphaMindConfig().dataMode === 'quantdinger';
}
