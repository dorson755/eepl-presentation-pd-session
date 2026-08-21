const GITHUB_OWNER = 'dorson755';
const GITHUB_REPO = 'eepl-presentation-pd-session';
const GITHUB_BRANCH = 'main';
const SCRIPTS_PATH = 'public/scripts';
const CONFIG_PATH = 'public/presentations.json';

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

// Get a file from the repo — returns { sha, content (decoded) } or null
async function getFile(path) {
  const r = await ghApi(path);
  if (!r.ok) return null;
  const data = await r.json();
  return {
    sha: data.sha,
    content: Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8'),
  };
}

// Put a file to the repo (create or replace)
async function putFile(path, content, sha, message) {
  const encoded = Buffer.from(content, 'utf8').toString('base64');
  const r = await ghApi(path, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: encoded,
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!r.ok) {
    const err = await r.json();
    throw new Error(err.message || `Failed to update ${path}`);
  }
  return r.json();
}

// Delete a file from the repo
async function deleteFile(path, sha, message) {
  const r = await ghApi(path, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: GITHUB_BRANCH }),
  });
  if (!r.ok) {
    const err = await r.json();
    throw new Error(err.message || `Failed to delete ${path}`);
  }
}

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

  const { action } = req.body || {};

  try {
    switch (action) {
      case 'list': {
        // List scripts + presentations config
        const scriptsR = await ghApi(SCRIPTS_PATH);
        const scriptsData = scriptsR.ok ? await scriptsR.json() : [];
        const scripts = (Array.isArray(scriptsData) ? scriptsData : [])
          .filter(f => f.type === 'file')
          .map(f => ({ name: f.name, size: f.size, sha: f.sha }));

        const configFile = await getFile(CONFIG_PATH);
        let presentations = [];
        if (configFile) {
          try {
            presentations = JSON.parse(configFile.content).presentations || [];
          } catch { /* invalid JSON, return empty */ }
        }

        return res.status(200).json({ scripts, presentations });
      }

      case 'set-script': {
        // Upload a script file AND wire it to a presentation in the config
        const { presentationId, filename, content } = req.body || {};
        if (!presentationId || !filename || !content) {
          return res.status(400).json({ error: 'presentationId, filename, and content required' });
        }

        // 1. Upload/replace the script file
        const existingFile = await getFile(`${SCRIPTS_PATH}/${filename}`);
        await putFile(
          `${SCRIPTS_PATH}/${filename}`,
          Buffer.from(content, 'base64').toString('binary'),
          existingFile?.sha,
          existingFile ? `chore: replace script ${filename}` : `chore: upload script ${filename}`
        );

        // 2. Update presentations.json
        const configFile = await getFile(CONFIG_PATH);
        let config;
        if (configFile) {
          config = JSON.parse(configFile.content);
        } else {
          config = { presentations: [] };
        }
        const pres = config.presentations.find(p => p.id === presentationId);
        if (pres) {
          pres.scriptUrl = `/scripts/${filename}`;
          pres.scriptName = filename;
        }
        await putFile(
          CONFIG_PATH,
          JSON.stringify(config, null, 2) + '\n',
          configFile?.sha,
          `chore: wire script ${filename} to ${presentationId}`
        );

        return res.status(200).json({
          success: true,
          message: `Script "${filename}" attached to "${presentationId}"`,
        });
      }

      case 'remove-script': {
        // Delete a script file AND unwire it from the presentation config
        const { presentationId, filename } = req.body || {};
        if (!presentationId || !filename) {
          return res.status(400).json({ error: 'presentationId and filename required' });
        }

        // 1. Delete the script file
        const file = await getFile(`${SCRIPTS_PATH}/${filename}`);
        if (file) {
          await deleteFile(`${SCRIPTS_PATH}/${filename}`, file.sha, `chore: delete script ${filename}`);
        }

        // 2. Update presentations.json
        const configFile = await getFile(CONFIG_PATH);
        if (configFile) {
          const config = JSON.parse(configFile.content);
          const pres = config.presentations.find(p => p.id === presentationId);
          if (pres) {
            delete pres.scriptUrl;
            delete pres.scriptName;
          }
          await putFile(
            CONFIG_PATH,
            JSON.stringify(config, null, 2) + '\n',
            configFile.sha,
            `chore: unwire script from ${presentationId}`
          );
        }

        return res.status(200).json({
          success: true,
          message: `Script removed from "${presentationId}"`,
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action. Use list, set-script, or remove-script.' });
    }
  } catch (err) {
    console.error('manage-script error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
