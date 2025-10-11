import { Router } from 'express';
import Words from '../libs/Words';

const router = Router();

// In-memory cache of generated guilds for examples (persist for process lifetime)
let guildCache: Array<{ id: string; name: string; icon: string }> | null = null;

// Utility to build SVG data URI avatar
function svgData(letter: string, bg: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>` +
    `<rect width='24' height='24' rx='4' ry='4' fill='${bg}'/>` +
    `<text x='12' y='16' font-family='Arial,Helvetica,sans-serif' font-size='12' text-anchor='middle' fill='white'>${letter}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;utf8,' + svg.replace(/#/g, '%23').replace(/ /g, '%20');
}

async function ensureGuildCache() {
  if (guildCache) return guildCache;
  const items: Array<{ id: string; name: string; icon: string }> = [];
  for (let i = 1; i <= 80; i++) { // a few more items for richer remote filtering
    const words = (await Words.get(['adjectives', 'nouns'], 1)).join(' ');
    const firstChar = words.charAt(0).toUpperCase();
    items.push({
      id: String(i),
      name: words,
      icon: svgData(firstChar, `#${Math.floor(Math.random() * 16777215).toString(16)}`)
    });
  }
  guildCache = items;
  return guildCache;
}

// Remote filtering endpoint for async dropdown example
// GET /examples/api/guilds?q=term&limit=20
router.get('/examples/api/guilds', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    const limit = Math.min(parseInt((req.query.limit || '25') as string, 10) || 25, 100);
    const data = await ensureGuildCache();
    let filtered = data;
    if (q) {
      filtered = data.filter(g => g.name.toLowerCase().includes(q));
    }
    // Basic relevance sort: shorter names first then lexical (could expand with score later)
    filtered = filtered.sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
    res.json(filtered.slice(0, limit));
  } catch (err) {
    console.error('Guild API error', err);
    res.status(500).json({ error: 'Failed to load guilds' });
  }
});

router.get('/examples/dropdown', async (req, res) => {
  // Sample data for demonstrations
  const regions = [
    { id: 'na', name: 'North America' },
    { id: 'eu', name: 'Europe' },
    { id: 'ap', name: 'Asia Pacific' },
    { id: 'sa', name: 'South America' },
    { id: 'af', name: 'Africa' },
    { id: 'oc', name: 'Oceania' }
  ];

  const guilds = await ensureGuildCache();

  // Normalize arrays into generic items arrays for dropdown without relying on block/partial
  const guildItems = guilds.map(g => ({ value: g.id, text: g.name, icon: g.icon }));
  const regionItems = regions.map(r => ({ value: r.id, text: r.name }));

  res.render('dropdown/examples', {
    layout: 'main',
    title: 'Dropdown Control Examples',
    regions,
    guilds,
    guildItems,
    regionItems,
    preselectedGuildIds: ['4', '15', '23'],
  });
});

export default router;
