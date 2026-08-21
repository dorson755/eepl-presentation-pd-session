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
        try {
          const { messages } = JSON.parse(body);
          if (!kimiApiKey) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'KIMI_API_KEY not set in .env' }));
            return;
          }
          const upstream = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${kimiApiKey}` },
            body: JSON.stringify({
              model: 'moonshot-v1-8k',
              messages: [
                { role: 'system', content: 'You are an AI Librarian for the Elizabeth Estates Public Library in The Bahamas. You are assisting Darnell Lightbourne during a Professional Development Session for preschool teachers. Your core philosophy is "Every mickle mek a muckle" (every small act adds up). Keep responses concise (under 3 sentences), warm, and encouraging.' },
                ...messages
              ]
            })
          });
          const data = await upstream.json();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ content: data.choices[0].message.content }));
        } catch (err) {
          console.error('[local-api] error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
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
