export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'KIMI_API_KEY environment variable not set' });
  }

  try {
    const upstream = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
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
      console.error('Kimi API error:', JSON.stringify(data));
      return res.status(502).json({ error: data?.error?.message || 'Kimi API error' });
    }

    return res.status(200).json({ content: data.choices[0].message.content });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
