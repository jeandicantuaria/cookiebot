module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  let body = req.body;
  if (!body) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString());
  }

  const { name, data, apiKey } = body;
  if (!name || !data) return res.status(400).json({ error: 'Missing fields' });

  try {
    // Aceita key via body (client) ou env (servidor) — body tem prioridade
    const key = apiKey || process.env.IMGBB_API_KEY;
    if (!key) throw new Error('ImgBB API Key não configurada. Acesse ⚙️ > API Settings.');

    const form = new URLSearchParams();
    form.append('image', data);
    form.append('name', name);

    const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: 'POST',
      body: form,
    });

    const result = await uploadRes.json();
    if (!result.success) return res.status(500).json({ error: 'ImgBB upload failed', detail: result });

    res.status(200).json({ url: result.data.url, id: result.data.id });
  } catch (e) {
    console.error('UPLOAD_ERROR:', e.message);
    res.status(500).json({ error: e.message });
  }
};