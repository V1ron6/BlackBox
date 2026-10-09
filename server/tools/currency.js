let cache = { at: 0, data: null };

export default {
  id: 'currency',
  check: async () => true,
  async run(req, res) {
    if (!cache.data || Date.now() - cache.at > 3_600_000) {
      let j;
      try {
        const r = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(10_000) });
        j = await r.json();
      } catch { throw new Error('Rates unavailable right now'); }
      if (!j.rates) throw new Error('Rates unavailable right now');
      cache = { at: Date.now(), data: { rates: j.rates, updated: j.time_last_update_utc } };
    }
    res.json(cache.data);
  },
};
