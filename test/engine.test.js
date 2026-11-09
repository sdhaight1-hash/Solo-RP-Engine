import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCampaign, parseCampaign, rollDice, drawOracle } from '../src/engine.js';
test('campaign round trip preserves journal and characters', () => {
  const c = createCampaign(' Haunted shore '); c.journal.push('Arrival'); c.characters.push('Mara');
  assert.deepEqual(parseCampaign(JSON.stringify(c)), c);
});
test('invalid saves are rejected', () => {
  for (const value of ['null', '{}', '{"version":2}', '{"version":1,"name":"X","journal":[1],"characters":[]}']) assert.throws(() => parseCampaign(value));
  assert.throws(() => createCampaign(' '));
});
test('dice boundaries and modifiers', () => {
  assert.deepEqual(rollDice('2d6+3', () => 0), { rolls: [1, 1], modifier: 3, total: 5 });
  assert.equal(rollDice('1d10-2', () => 0.999999).total, 8);
  for (const value of ['0d6', '101d6', '1d1', '1d1001', 'eval(1)', '2d6junk']) assert.throws(() => rollDice(value));
});
test('oracle endpoints and empty table rejection', () => {
  assert.equal(drawOracle(['A', 'B'], () => 0), 'A');
  assert.equal(drawOracle(['A', 'B'], () => 0.999999), 'B');
  assert.throws(() => drawOracle([])); assert.throws(() => drawOracle(['']));
});
