export function createCampaign(name) {
  if (typeof name !== 'string' || !name.trim()) throw new Error('Campaign name is required');
  return { version: 1, name: name.trim(), journal: [], characters: [] };
}
export function parseCampaign(text) {
  const c = JSON.parse(text);
  if (!c || c.version !== 1 || typeof c.name !== 'string' || !c.name.trim() ||
      !Array.isArray(c.journal) || !c.journal.every(x => typeof x === 'string') ||
      !Array.isArray(c.characters) || !c.characters.every(x => typeof x === 'string')) {
    throw new Error('Invalid campaign file or unsupported version');
  }
  return { version: 1, name: c.name, journal: c.journal, characters: c.characters };
}
export function rollDice(expression, random = Math.random) {
  const match = /^(\d{1,3})d(\d{1,4})([+-]\d{1,5})?$/.exec(expression.trim());
  if (!match) throw new Error('Use NdS or NdS+M, for example 2d6+1');
  const [, n, s, m = '0'] = match;
  if (+n < 1 || +n > 100 || +s < 2 || +s > 1000) throw new Error('Use 1–100 dice with 2–1000 sides');
  const rolls = Array.from({ length: +n }, () => Math.floor(random() * +s) + 1);
  return { rolls, modifier: +m, total: rolls.reduce((a, b) => a + b, +m) };
}
export function drawOracle(entries, random = Math.random) {
  if (!Array.isArray(entries) || !entries.length || !entries.every(x => typeof x === 'string' && x.trim())) {
    throw new Error('Enter at least one nonempty oracle entry');
  }
  return entries[Math.floor(random() * entries.length)];
}
