import { WATCHLIST } from '../../src/upstream/watchlist';

describe('watchlist', () => {
  it('watches the plugin-dependencies page that was previously missed', () => {
    const ids = WATCHLIST.map((e) => e.id);
    expect(ids).toContain('plugin-dependencies');
  });

  it('uses the raw markdown endpoint for every entry', () => {
    expect(WATCHLIST.length).toBeGreaterThan(0);
    for (const entry of WATCHLIST) {
      expect(entry.url).toMatch(/^https:\/\/code\.claude\.com\/docs\/en\/.+\.md$/);
    }
  });

  it('declares a positive minFacts guard for every entry', () => {
    expect(WATCHLIST.length).toBeGreaterThan(0);
    for (const entry of WATCHLIST) {
      expect(entry.minFacts).toBeGreaterThan(0);
    }
  });

  it('has no duplicate page ids', () => {
    const ids = WATCHLIST.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
