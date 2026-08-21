const GITHUB_OWNER = 'dorson755';
const GITHUB_REPO = 'eepl-presentation-pd-session';
const GITHUB_BRANCH = 'main';
const SCRIPTS_PATH = 'public/scripts';

const ghApi = (path, init = {}) =>
  fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      ...init.headers,
    },
  });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Auth ---
  const password = req.headers['x-admin-password'];
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD env var not set' });
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN env var not set' });
  }

  const { action, filename, content } = req.body || {};

  try {
    switch (action) {
      case 'list': {
        const r = await ghApi(SCRIPTS_PATH);
        const data = await r.json();
        if (!r.ok) {
          return res.status(502).json({ error: data.message || 'GitHub API error' });
        }
        const scripts = (Array.isArray(data) ? data : [])
          .filter(f => f.type === 'file')
          .map(f => ({ name: f.name, size: f.size, sha: f.sha }));
        return res.status(200).json({ scripts });
      }

      case 'delete': {
        if (!filename) return res.status(400).json({ error: 'filename required' });
        // Get SHA first
        const getR = await ghApi(`${SCRIPTS_PATH}/${filename}`);
        const getData = await getR.json();
        if (!getR.ok) {
          return res.status(502).json({ error: getData.message || 'File not found' });
        }
        // Delete
        const delR = await ghApi(`${SCRIPTS_PATH}/${filename}`, {
          method: 'DELETE',
          body: JSON.stringify({
            message: `chore: delete script ${filename}`,
            sha: getData.sha,
            branch: GITHUB_BRANCH,
          }),
        });
        if (!delR.ok) {
          const err = await delR.json();
          return res.status(502).json({ error: err.message || 'Delete failed' });
        }
        return res.status(200).json({ success: true, message: `Deleted ${filename}` });
      }

      case 'upload': {
        if (!filename || !content) {
          return res.status(400).json({ error: 'filename and content required' });
        }
        // Check if file exists (need SHA to replace)
        let sha = null;
        const checkR = await ghApi(`${SCRIPTS_PATH}/${filename}`);
        if (checkR.ok) {
          const existing = await checkR.json();
          sha = existing.sha;
        }
        // Upload / replace
        const upR = await ghApi(`${SCRIPTS_PATH}/${filename}`, {
          method: 'PUT',
          body: JSON.stringify({
            message: sha ? `chore: replace script ${filename}` : `chore: upload script ${filename}`,
            content, // base64-encoded
            branch: GITHUB_BRANCH,
            ...(sha ? { sha } : {}),
          }),
        });
        if (!upR.ok) {
          const err = await upR.json();
          return res.status(502).json({ error: err.message || 'Upload failed' });
        }
        return res.status(200).json({
          success: true,
          message: sha ? `Replaced ${filename}` : `Uploaded ${filename}`,
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action. Use list, delete, or upload.' });
    }
  } catch (err) {
    console.error('manage-script error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
