const PUBLIC_URL = /^https?:\/\/(?!(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.))/i;
const tag = (b, t) => (b.match(new RegExp(`<${t}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`)) || [])[1]?.trim();

const episodes = (xml) =>
  [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 30)
    .map((m) => ({ title: tag(m[1], 'title') || 'Episode', url: (m[1].match(/<enclosure[^>]*url="([^"]+)"/) || [])[1] }))
    .filter((e) => e.url);

export default {
  id: 'podcast',
  check: async () => true,
  async run(req, res) {
    let feed = (req.body.query || '').trim();
    if (!feed) throw new Error('Enter a podcast name or RSS URL');
    if (/spotify\.com/i.test(feed)) throw new Error('Spotify links cannot be downloaded. Search by podcast name instead.');
    if (!/^https?:\/\//i.test(feed)) {
      const j = await (await fetch('https://itunes.apple.com/search?media=podcast&limit=1&term=' + encodeURIComponent(feed))).json();
      feed = j.results?.[0]?.feedUrl;
      if (!feed) throw new Error('Podcast not found');
    }
    if (!PUBLIC_URL.test(feed)) throw new Error('Invalid feed URL');
    const links = episodes(await (await fetch(feed)).text());
    if (!links.length) throw new Error('No downloadable episodes found (may be an exclusive show)');
    res.json({ links });
  },
};
