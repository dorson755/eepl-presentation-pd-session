export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Build the audience URL from the request host
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const audienceUrl = `${protocol}://${host}/audience`;

  try {
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(audienceUrl)}`
    );

    if (!response.ok) {
      throw new Error('TinyURL API error');
    }

    const shortUrl = (await response.text()).trim();
    return res.status(200).json({ shortUrl });
  } catch (err) {
    console.error('Short link error:', err);
    // Fall back to the full URL if the shortener fails
    return res.status(200).json({ shortUrl: audienceUrl });
  }
}
