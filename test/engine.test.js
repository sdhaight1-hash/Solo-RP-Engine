import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCampaign, parseCampaign, rollDice, drawOracle, newRecord, addJournal, proposeBeat, resolveBeat, confirmedBeats, setTrackLength } from '../src/engine.js';
test('v2 export round trip preserves the full adventure', () => {
  const c = createCampaign(' Haunted shore '); c.setting = 'Coast'; c.scope = 'Find the keeper';
  c.characters.push(newRecord({ name: 'Mara', notes: 'Investigator' }));
  c.scenes.push(newRecord({ name: 'Arrival', notes: 'Fog', status: 'open' }));
  addJournal(c, 'Arrival', c.scenes[0].id);
  c.tables.push(newRecord({ name: 'Weather', entries: ['Fog', 'Rain'] }));
  c.nodes.push(newRecord({ type: 'Pending question', name: 'Where is the keeper?', notes: '', resolved: false }));
  const b = proposeBeat(c, 'A light appears'); resolveBeat(c, b.id, 'confirmed');
  assert.deepEqual(parseCampaign(JSON.stringify(c)), c);
});
test('v1 migration keeps all legacy prose and generates editable records', () => {
  const c = parseCampaign(JSON.stringify({ version: 1, name: 'Old', journal: ['one', 'two'], characters: ['Mara: keeper'] }));
  assert.equal(c.version, 2); assert.deepEqual(c.journal.map(x => x.body), ['one', 'two']); assert.equal(c.characters[0].notes, 'Mara: keeper');
  assert.deepEqual(parseCampaign(JSON.stringify(c)), c);
});
test('malformed and unsupported saves fail before mutation', () => {
  for (const value of ['null', '[]', '{}', '{"version":3}', '{"version":1,"name":"X","journal":[1],"characters":[]}']) assert.throws(() => parseCampaign(value));
  assert.throws(() => createCampaign(' '));
  const c = createCampaign('A'); c.scenes = null; assert.throws(() => parseCampaign(JSON.stringify(c)));
});
test('import checks references, identifiers, table entries and track state', () => {
  for (const damage of [
    c => { c.journal.push({ id: 'j', body: 'x', at: '', sceneId: 'missing' }); },
    c => { const ch = newRecord({ name: 'A', notes: '' }); c.characters.push(ch, ch); },
    c => { c.tables.push(newRecord({ name: 'Empty', entries: [] })); },
    c => { c.plot.length = 0; },
    c => { c.nodes.push(newRecord({ name: 'X', notes: '', type: 'invented', resolved: false })); }
  ]) { const c = createCampaign('X'); damage(c); assert.throws(() => parseCampaign(JSON.stringify(c))); }
});
test('PUM v9 PDF pp4–5,7: invoking and dismissing do not advance; confirming advances once', () => {
  const c = createCampaign('Plot'); const b = proposeBeat(c, 'A stranger arrives'); assert.equal(confirmedBeats(c), 0);
  resolveBeat(c, b.id, 'dismissed'); assert.equal(confirmedBeats(c), 0);
  const b2 = proposeBeat(c, 'The keeper is missing'); resolveBeat(c, b2.id, 'confirmed'); assert.equal(confirmedBeats(c), 1);
  assert.throws(() => resolveBeat(c, b2.id, 'confirmed')); assert.equal(confirmedBeats(c), 1);
});
test('full tracks cannot overflow and shrinking cannot erase progress', () => {
  const c = createCampaign('Plot'); setTrackLength(c, 1);
  const b1 = proposeBeat(c, 'One'), b2 = proposeBeat(c, 'Two'); resolveBeat(c, b1.id, 'confirmed');
  assert.throws(() => resolveBeat(c, b2.id, 'confirmed')); assert.equal(b2.status, 'pending');
  assert.throws(() => proposeBeat(c, 'Three')); assert.throws(() => setTrackLength(c, 0));
  setTrackLength(c, 2); resolveBeat(c, b2.id, 'confirmed'); assert.throws(() => setTrackLength(c, 1));
});
test('dice endpoints and modifiers', () => {
  assert.deepEqual(rollDice('2d6+3', () => 0), { rolls: [1, 1], modifier: 3, total: 5 });
  assert.equal(rollDice('1d10-2', () => 0.999999).total, 8);
  for (const value of ['0d6', '101d6', '1d1', '1d1001', 'eval(1)', '2d6junk']) assert.throws(() => rollDice(value));
});
test('oracle endpoints, duplicate weighting, and empty rejection', () => {
  assert.equal(drawOracle(['A', 'A', 'B'], () => 0.5), 'A'); assert.equal(drawOracle(['A', 'B'], () => .999), 'B');
  assert.throws(() => drawOracle([])); assert.throws(() => drawOracle(['']));
});
test('speaker snapshots round trip while original v2 journals remain compatible', () => {
  const c = createCampaign('Voices'); addJournal(c, 'I will find them.', null, 'Mara');
  assert.equal(parseCampaign(JSON.stringify(c)).journal[0].speaker, 'Mara');
  delete c.journal[0].speaker;
  assert.equal(parseCampaign(JSON.stringify(c)).journal[0].body, 'I will find them.');
  c.journal[0].speaker = {};
  assert.throws(() => parseCampaign(JSON.stringify(c)));
});
