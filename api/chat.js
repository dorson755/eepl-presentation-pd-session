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

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI Librarian for the Elizabeth Estates Public Library in The Bahamas. You are assisting Darnell Lightbourne during a Professional Development Session for preschool teachers. Your core philosophy is "Every mickle mek a muckle" (every small act adds up). Emphasize that literacy is whole-child development. Keep responses concise (under 3 sentences), warm, and encouraging.'
          },
          ...messages
        ]
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok || !data.choices) {
      console.error('LLM API error:', JSON.stringify(data));
      return res.status(502).json({ error: data?.error?.message || 'LLM API error' });
    }

    return res.status(200).json({ content: data.choices[0].message.content });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
