const SYSTEM_PROMPT = 'You are an AI Librarian for the Elizabeth Estates Public Library in The Bahamas. You are assisting Darnell Lightbourne during a Professional Development Session for preschool teachers. Your core philosophy is "Every mickle mek a muckle" (every small act adds up). Emphasize that literacy is whole-child development. Keep responses concise (under 3 sentences), warm, and encouraging.';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Prefer Groq (fast, free, US-based); fall back to Kimi if Groq key is absent.
  const useGroq = Boolean(process.env.GROQ_API_KEY);
  const apiKey = useGroq ? process.env.GROQ_API_KEY : process.env.KIMI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY or KIMI_API_KEY environment variable not set' });
  }

  const endpoint = useGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.moonshot.cn/v1/chat/completions';
  const model = useGroq ? 'llama-3.3-70b-versatile' : 'kimi-k2.6';

  const payload = {
    model,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
  };

  try {
    if (useGroq) {
      // --- Streaming via Groq ---
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...payload, stream: true }),
      });

      if (!upstream.ok) {
        const errData = await upstream.json().catch(() => ({}));
        return res.status(502).json({ error: errData?.error?.message || 'Groq API error' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep the last (possibly incomplete) line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
            }
          } catch {
            // ignore incomplete JSON in split chunks
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // --- Non-streaming Kimi fallback (wrapped as a single SSE event) ---
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await upstream.json();

      if (!upstream.ok || !data.choices) {
        console.error('Kimi API error:', JSON.stringify(data));
        return res.status(502).json({ error: data?.error?.message || 'Kimi API error' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ content: data.choices[0].message.content })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    console.error('Proxy error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
