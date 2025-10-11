import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Proxy to avoid browser CORS when looking up Mojang profiles by username
router.get('/api/v1/minecraft/users/:username', async (req: Request, res: Response) => {
  const username = (req.params.username || '').trim();
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  try {
    const url = `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`;
    const response = await axios.get(url, {
      // Mojang returns 204/404 when not found; we want to handle it ourselves
      validateStatus: () => true,
      headers: { 'Accept': 'application/json' },
    });

    if (response.status === 200 && response.data) {
      return res.json(response.data);
    }
    if (response.status === 204 || response.status === 404) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(502).json({ error: 'Upstream error', status: response.status });
  } catch (err: any) {
    return res.status(502).json({ error: 'Upstream fetch failed' });
  }
});

export default router;
