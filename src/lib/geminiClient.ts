function getApiKeyHeader(customApiKey?: string): Record<string, string> {
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('fluost_gemini_api_key') : null;
  const activeKey = customApiKey || storedKey || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (activeKey.trim()) {
    headers['x-custom-api-key'] = activeKey.trim();
  }
  return headers;
}

async function handleResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Server backend Fluost tidak merespons JSON (Status ' + res.status + '). Pastikan server Node/Express berjalan.');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server AI.');
  }
  return data;
}

export async function fetchMusicAI(query: string, customApiKey?: string): Promise<string> {
  const res = await fetch('/api/gemini/music', {
    method: 'POST',
    headers: getApiKeyHeader(customApiKey),
    body: JSON.stringify({ query }),
  });
  const data = await handleResponse(res);
  return data.result;
}

export async function fetchSparkAI(
  topic: string,
  style: string,
  base64Data?: string,
  mimeType?: string,
  fileName?: string,
  customApiKey?: string
): Promise<string> {
  const res = await fetch('/api/gemini/ai-studio', {
    method: 'POST',
    headers: getApiKeyHeader(customApiKey),
    body: JSON.stringify({ topic, style, base64Data, mimeType, fileName }),
  });
  const data = await handleResponse(res);
  return data.result;
}

export async function fetchVisualAI(
  base64Data: string,
  mimeType: string,
  customApiKey?: string
): Promise<string> {
  const res = await fetch('/api/gemini/analyze-media', {
    method: 'POST',
    headers: getApiKeyHeader(customApiKey),
    body: JSON.stringify({ base64Data, mimeType }),
  });
  const data = await handleResponse(res);
  return data.result;
}
