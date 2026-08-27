const SYSTEM_PROMPT = `You are a practical classroom teaching assistant. You write concise, useful lesson plans for busy teachers. Always respond with a warm, encouraging tone. Keep outputs structured and ready to use. Avoid jargon and pseudo-profound language.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, mode = 'lesson' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY environment variable not set' });
  }

  let userPrompt = prompt;
  if (mode === 'gamify') {
    userPrompt = `${prompt}\n\nTurn this lesson into a short, engaging classroom game or quest. Include team roles, a simple point system, clues or challenges, and a reflection question. Keep it practical and easy to run.`;
  } else if (mode === 'simplify') {
    userPrompt = `${prompt}\n\nRewrite this lesson plan so it is accessible to students reading below grade level. Use simpler vocabulary, shorter sentences, and clear step-by-step instructions.`;
  } else if (mode === 'ell') {
    userPrompt = `${prompt}\n\nAdapt this lesson plan for English language learners. Add visual supports, vocabulary previews, sentence frames, and opportunities for speaking and listening.`;
  } else if (mode === 'extend') {
    userPrompt = `${prompt}\n\nCreate an extension activity for students who finish early or need enrichment. Make it challenging but connected to the same learning goal.`;
  }

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ]
      }),
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
      buffer = lines.pop();

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
  } catch (err) {
    console.error('Prompt builder proxy error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
