export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: 'You are an AI Librarian for the Elizabeth Estates Public Library in The Bahamas. You are assisting Darnell Lightbourne during a Professional Development Session for preschool teachers. Your core philosophy is "Every mickle mek a muckle" (every small act adds up). Emphasize that literacy is whole-child development (listening, speaking, reading, writing). Keep responses concise (under 3 sentences), warm, and encouraging. Use British/Bahamian spelling where appropriate.'
          },
          ...messages
        ]
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Kimi API error:', response.status, errorBody);
      return res.status(response.status).json({ error: 'AI service error', detail: errorBody });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.choices[0].message.content });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
