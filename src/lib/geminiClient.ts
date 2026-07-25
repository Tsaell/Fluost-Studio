export async function fetchMusicAI(query: string, customApiKey?: string): Promise<string> {
  const res = await fetch('/api/gemini/music', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server error');
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, style, base64Data, mimeType, fileName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server error');
  return data.result;
}

export async function fetchVisualAI(
  base64Data: string,
  mimeType: string,
  customApiKey?: string
): Promise<string> {
  const res = await fetch('/api/gemini/analyze-media', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64Data, mimeType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server error');
  return data.result;
}
