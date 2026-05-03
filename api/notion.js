module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-notion-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers['x-notion-token'];
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const notionPath = req.body?._path;
  const bodyClean = { ...req.body };
  delete bodyClean._path;

  if (!notionPath) return res.status(400).json({ error: 'Missing _path in body' });

  try {
    const response = await fetch(`https://api.notion.com/v1/${notionPath}`, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: req.method !== 'GET' ? JSON.stringify(bodyClean) : undefined,
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
