import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Local dev plugin that mimics the /api/chat serverless function
const localApiPlugin = (kimiApiKey) => ({
  name: 'local-api',
  configureServer(server) {
    server.middlewares.use('/api/chat', async (req, res) => {
      if (req.method !== 'POST') {
        res.writeHead(405); res.end('Method not allowed'); return;
      }
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        let responseSent = false;
        const send = (status, body) => {
          if (responseSent) return;
          responseSent = true;
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(body));
        };

        try {
          const { messages } = JSON.parse(body);
          if (!kimiApiKey) {
            return send(500, { error: 'KIMI_API_KEY not set in .env' });
          }
          const upstream = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${kimiApiKey}` },
            body: JSON.stringify({
              model: 'moonshot-v1-8k',
              messages: [
                { role: 'system', content: 'You are an AI Librarian for the Elizabeth Estates Public Library in The Bahamas. Your core philosophy is "Every mickle mek a muckle". Keep responses concise (under 3 sentences), warm, and encouraging.' },
                ...messages
              ]
            })
          });
          const data = await upstream.json();
          if (!upstream.ok || !data.choices) {
            console.error('[local-api] Kimi error:', JSON.stringify(data));
            return send(502, { error: data?.error?.message || 'Kimi API error' });
          }
          send(200, { content: data.choices[0].message.content });
        } catch (err) {
          console.error('[local-api] error:', err);
          send(500, { error: err.message });
        }
      });
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars from .env (empty string prefix = no filter)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), localApiPlugin(env.KIMI_API_KEY)],
  };
});
