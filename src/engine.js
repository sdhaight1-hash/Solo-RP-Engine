const text = (v, max = 100000) => typeof v === 'string' && v.length <= max;
const named = v => text(v, 200) && !!v.trim();
const list = (v, check) => Array.isArray(v) && v.length <= 10000 && v.every(check);
const id = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();
const record = v => v && typeof v === 'object' && !Array.isArray(v);
export const NODE_TYPES = ['World element', 'Potential problem', 'Useful finding', 'Pending question', 'Character', 'Location'];
export function createCampaign(name) {
  if (!named(name)) throw new Error('Campaign name is required (maximum 200 characters)');
  return { version: 2, id: id(), name: name.trim(), setting: '', scope: '', journal: [], characters: [], tables: [], scenes: [], nodes: [], log: [], plot: { length: 8, beats: [] } };
}
export function parseCampaign(input) {
  let c = JSON.parse(input);
  if (!record(c)) throw new Error('Invalid campaign');
  if (c.version === 1) {
    if (!named(c.name) || !list(c.journal, x => text(x)) || !list(c.characters, x => text(x))) throw new Error('Invalid legacy campaign');
    c = { ...createCampaign(c.name), journal: c.journal.map(body => ({ id: id(), body, at: now(), sceneId: null })), characters: c.characters.map(body => ({ id: id(), name: body.trim().slice(0, 200) || 'Unnamed', notes: body })) };
  }
  const identified = v => record(v) && named(v.id);
  const valid = c.version === 2 && named(c.id) && named(c.name) && text(c.setting) && text(c.scope) &&
    list(c.characters, x => identified(x) && named(x.name) && text(x.notes)) &&
    list(c.scenes, x => identified(x) && named(x.name) && text(x.notes) && ['open', 'closed'].includes(x.status)) &&
    list(c.journal, x => identified(x) && text(x.body) && text(x.at, 100) && (x.sceneId === null || c.scenes.some(s => s.id === x.sceneId))) &&
    list(c.tables, x => identified(x) && named(x.name) && list(x.entries, named) && x.entries.length > 0) &&
    list(c.nodes, x => identified(x) && NODE_TYPES.includes(x.type) && named(x.name) && text(x.notes) && typeof x.resolved === 'boolean') &&
    list(c.log, x => identified(x) && text(x.at, 100) && text(x.body)) && record(c.plot) &&
    Number.isInteger(c.plot.length) && c.plot.length >= 1 && c.plot.length <= 100 &&
    list(c.plot.beats, x => identified(x) && text(x.body) && !!x.body.trim() && text(x.at, 100) && ['pending', 'confirmed', 'dismissed'].includes(x.status));
  if (!valid) throw new Error('Invalid campaign file or unsupported version');
  for (const field of ['journal', 'characters', 'tables', 'scenes', 'nodes', 'log']) {
    if (new Set(c[field].map(x => x.id)).size !== c[field].length) throw new Error('Duplicate record identifiers');
  }
  if (new Set(c.plot.beats.map(x => x.id)).size !== c.plot.beats.length || confirmedBeats(c) > c.plot.length) throw new Error('Invalid plot track');
  // Rebuild the root so unrelated imported properties never enter the application state.
  return Object.fromEntries(['version', 'id', 'name', 'setting', 'scope', 'journal', 'characters', 'tables', 'scenes', 'nodes', 'log', 'plot'].map(k => [k, c[k]]));
}
export function addLog(c, body) { c.log.push({ id: id(), body, at: now() }); }
export function addJournal(c, body, sceneId = null) {
  if (!text(body) || !body.trim()) throw new Error('Write a journal entry');
  if (sceneId !== null && !c.scenes.some(s => s.id === sceneId)) throw new Error('Scene not found');
  c.journal.push({ id: id(), body: body.trim(), sceneId, at: now() });
}
export function newRecord(fields) { return { id: id(), ...fields }; }
export function confirmedBeats(c) { return c.plot.beats.filter(b => b.status === 'confirmed').length; }
// PUM v9, PDF pages 4–5 and 7: invoking a beat does not advance the track.
export function proposeBeat(c, body) {
  if (!text(body) || !body.trim()) throw new Error('Describe the beat outcome first');
  if (confirmedBeats(c) >= c.plot.length) throw new Error('This plot track is complete; extend it to continue');
  const beat = { id: id(), body: body.trim(), at: now(), status: 'pending' };
  c.plot.beats.push(beat); addLog(c, 'Beat invoked: ' + beat.body); return beat;
}
export function resolveBeat(c, beatId, status) {
  const beat = c.plot.beats.find(b => b.id === beatId);
  if (!beat || beat.status !== 'pending' || !['confirmed', 'dismissed'].includes(status)) throw new Error('Only a pending beat can be resolved');
  if (status === 'confirmed' && confirmedBeats(c) >= c.plot.length) throw new Error('Plot track is full');
  beat.status = status; addLog(c, `Beat ${status}: ${beat.body}`);
}
export function setTrackLength(c, length) {
  if (!Number.isInteger(length) || length < 1 || length > 100 || length < confirmedBeats(c)) throw new Error('Track length must be 1–100 and cannot erase confirmed progress');
  c.plot.length = length;
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
  if (!list(entries, named) || !entries.length) throw new Error('Enter at least one nonempty oracle entry (maximum 200 characters each)');
  return entries[Math.floor(random() * entries.length)];
}
