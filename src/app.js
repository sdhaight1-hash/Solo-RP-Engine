import { createCampaign, parseCampaign, rollDice, drawOracle, addJournal, addLog, newRecord, proposeBeat, resolveBeat, confirmedBeats, setTrackLength, NODE_TYPES } from './engine.js';
const $ = id => document.getElementById(id);
const key = 'solo-rp-engine-v1'; // Preserve the original storage location while migrating each save.
let campaigns = [], active = 0, tab = 'journal', rawStorage = null, blocked = false;
let journalEdit = null, characterEdit = null, tableEdit = null, sceneEdit = null, nodeEdit = null;
let toastTimer;
const campaign = () => campaigns[active];
function status(body) { $('status').textContent = body; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('status').textContent = ''; }, 10000); }
function download(body, filename) {
  const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
try {
  rawStorage = localStorage.getItem(key);
  if (rawStorage !== null) {
    const data = JSON.parse(rawStorage);
    if (!Array.isArray(data) || data.length > 1000) throw new Error('Invalid saved campaign collection');
    campaigns = data.map(c => parseCampaign(JSON.stringify(c)));
  }
} catch (error) {
  blocked = true; $('recovery').hidden = false;
  $('recovery-message').textContent = 'Stored campaigns could not be read. Saving is paused so the stored data is preserved. Download it before starting fresh. ' + error.message;
}
if (!campaigns.length) campaigns.push(createCampaign('My first adventure'));
try { const selected = localStorage.getItem(key + '-active'); const i = campaigns.findIndex(c => c.id === selected); if (i >= 0) active = i; } catch { /* Saving will report unavailable storage. */ }
function save() {
  if (blocked) { $('save-state').textContent = 'Saving paused'; status('Saving is paused. Export your changes before reloading or recovering stored data.'); return; }
  try {
    if (localStorage.getItem(key) !== rawStorage) {
      blocked = true; $('conflict').hidden = false; throw new Error('Another tab changed the save. Export this campaign, then reload.');
    }
    const data = JSON.stringify(campaigns); localStorage.setItem(key, data); rawStorage = data;
    $('save-state').textContent = 'Saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return true;
  } catch (error) { $('save-state').textContent = 'Not saved — export a backup'; status(error.message + ' Changes are in memory; export a backup.'); return false; }
}
window.addEventListener('storage', e => { if (e.key === key || e.key === null) { blocked = true; $('conflict').hidden = false; $('save-state').textContent = 'Saving paused: another tab changed storage'; } });
$('recovery-export').onclick = () => download(rawStorage ?? 'null', 'solo-rp-stored-data.json');
$('recovery-reset').onclick = () => { if (!confirm('Have you downloaded the stored data? This replaces it with the campaigns currently shown.')) return; blocked = false; $('recovery').hidden = true; save(); };
function action(label, fn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.onclick = () => run(fn); return b; }
function run(fn) { try { fn(); } catch (error) { status(error.message); } }
function bind(form, fn) { $(form).onsubmit = event => { event.preventDefault(); run(fn); }; }
function card(title, body, meta, actions = []) {
  const el = document.createElement('article'); el.className = 'entry-card';
  if (meta) { const m = document.createElement('div'); m.className = 'entry-meta'; m.textContent = meta; el.append(m); }
  if (title) { const h = document.createElement('h3'); h.textContent = title; el.append(h); }
  const p = document.createElement('p'); p.textContent = body; el.append(p);
  if (actions.length) { const bar = document.createElement('div'); bar.className = 'entry-actions'; bar.append(...actions); el.append(bar); }
  return el;
}
function rememberSelection() { try { localStorage.setItem(key + '-active', campaign().id); } catch { /* Campaign data save reports errors separately. */ } }
function showTab(next) {
  tab = next;
  document.querySelectorAll('[data-panel]').forEach(el => { el.hidden = el.dataset.panel !== tab; });
  document.querySelectorAll('[data-tab]').forEach(el => { if (el.dataset.tab === tab) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
}
document.querySelectorAll('[data-tab]').forEach(el => { el.onclick = () => { showTab(el.dataset.tab); }; });
function cancelEditors() {
  journalEdit = characterEdit = tableEdit = sceneEdit = nodeEdit = null;
  for (const f of ['journal-form', 'character-form', 'table-form', 'scene-form', 'node-form']) $(f).reset();
  for (const x of ['entry', 'character', 'table', 'scene', 'node']) $(x + '-cancel').hidden = true;
  $('entry-submit').textContent = 'Add entry'; $('character-submit').textContent = 'Add character'; $('table-submit').textContent = 'Save table'; $('scene-submit').textContent = 'Add scene'; $('node-submit').textContent = 'Add node';
}
function renderJournal() {
  const c = campaign(), query = $('journal-search').value.toLowerCase();
  const entries = c.journal.filter(x => x.body.toLowerCase().includes(query));
  $('entry-count').textContent = `${c.journal.length} entries`;
  $('journal-empty').hidden = entries.length > 0;
  $('journal-empty').textContent = query ? 'No entries match your search.' : 'Your first page is waiting. Write the opening moment above.';
  $('journal').replaceChildren(...entries.slice().reverse().map(entry => {
    const scene = c.scenes.find(s => s.id === entry.sceneId);
    return card('', entry.body, [new Date(entry.at).toLocaleString(), scene?.name].filter(Boolean).join(' · '), [action('Edit entry', () => {
      journalEdit = entry.id; $('entry').value = entry.body; $('entry-scene').value = entry.sceneId ?? ''; $('entry-submit').textContent = 'Save entry'; $('entry-cancel').hidden = false; $('entry').focus();
    }), action('Delete entry', () => {
      if (!confirm('Delete this journal entry?')) return;
      c.journal = c.journal.filter(x => x.id !== entry.id); if (journalEdit === entry.id) cancelEditors(); save(); render();
    })]);
  }));
}
function render() {
  const c = campaign();
  $('campaigns').replaceChildren(...campaigns.map((c, i) => new Option(c.name, i, false, i === active)));
  $('title').textContent = c.name; $('scope-preview').textContent = c.scope || 'A new story begins with a single moment.';
  const progress = confirmedBeats(c); $('progress-summary').textContent = `${progress} / ${c.plot.length}`;
  $('track-label').textContent = progress === c.plot.length ? 'Track complete' : `${progress} of ${c.plot.length}`;
  $('track-progress').max = c.plot.length; $('track-progress').value = progress; $('track-length').value = c.plot.length;
  $('settings-name').value = c.name; $('setting').value = c.setting; $('scope').value = c.scope;
  const selectedScene = $('entry-scene').value;
  $('entry-scene').replaceChildren(new Option('No scene', ''), ...c.scenes.map(s => new Option(s.name + (s.status === 'closed' ? ' (closed)' : ''), s.id)));
  if (c.scenes.some(s => s.id === selectedScene)) $('entry-scene').value = selectedScene;
  renderJournal();
  $('characters').replaceChildren(...c.characters.map(ch => card(ch.name, ch.notes, '', [action('Edit character', () => {
    characterEdit = ch.id; $('character-name').value = ch.name; $('character-notes').value = ch.notes; $('character-submit').textContent = 'Save character'; $('character-cancel').hidden = false; $('character-name').focus();
  }), action('Delete character', () => { if (!confirm('Delete this character?')) return; c.characters = c.characters.filter(x => x.id !== ch.id); if (characterEdit === ch.id) cancelEditors(); save(); render(); })])));
  $('beats').replaceChildren(...c.plot.beats.slice().reverse().map(b => card('', b.body, b.status.toUpperCase(), b.status !== 'pending' ? [] : [action('Confirm relevance', () => { resolveBeat(c, b.id, 'confirmed'); save(); render(); }), action('Dismiss beat', () => { resolveBeat(c, b.id, 'dismissed'); save(); render(); })])));
  $('scenes').replaceChildren(...c.scenes.map(s => card(s.name, s.notes, s.status.toUpperCase(), [action('Edit scene', () => { sceneEdit = s.id; $('scene-name').value = s.name; $('scene-notes').value = s.notes; $('scene-submit').textContent = 'Save scene'; $('scene-cancel').hidden = false; $('scene-name').focus(); }), action(s.status === 'open' ? 'Close scene' : 'Reopen scene', () => { s.status = s.status === 'open' ? 'closed' : 'open'; save(); render(); }), action('Write in scene', () => { showTab('journal'); $('entry-scene').value = s.id; $('entry').focus(); })])));
  $('nodes').replaceChildren(...c.nodes.map(n => {
    const el = card(n.name, n.notes, n.type, [action('Edit node', () => { nodeEdit = n.id; $('node-type').value = n.type; $('node-name').value = n.name; $('node-notes').value = n.notes; $('node-submit').textContent = 'Save node'; $('node-cancel').hidden = false; $('node-name').focus(); }), action(n.resolved ? 'Reopen node' : 'Resolve node', () => { n.resolved = !n.resolved; save(); render(); }), action('Invoke node as beat', () => { proposeBeat(c, n.type + ': ' + n.name); save(); render(); })]);
    el.classList.toggle('resolved', n.resolved); return el;
  }));
  const selectedTable = $('table-select').value;
  $('table-select').replaceChildren(...c.tables.map(t => new Option(t.name, t.id)));
  if (c.tables.some(t => t.id === selectedTable)) $('table-select').value = selectedTable;
  $('draw-button').disabled = !c.tables.length;
  $('tables').replaceChildren(...c.tables.map(t => card(t.name, t.entries.join('\n'), `${t.entries.length} entries`, [action('Edit table', () => {
    tableEdit = t.id; $('table-name').value = t.name; $('table-entries').value = t.entries.join('\n'); $('table-submit').textContent = 'Update table'; $('table-cancel').hidden = false; $('table-name').focus();
  }), action('Delete table', () => { if (!confirm('Delete this oracle table?')) return; c.tables = c.tables.filter(x => x.id !== t.id); if (tableEdit === t.id) cancelEditors(); save(); render(); })])));
  $('log').replaceChildren(...c.log.slice().reverse().map(x => card('', x.body, new Date(x.at).toLocaleString())));
}
$('campaigns').onchange = e => { active = +e.target.value; cancelEditors(); $('roll-result').hidden = true; $('journal-search').value = ''; rememberSelection(); render(); };
$('new-open').onclick = () => $('new-dialog').showModal();
$('new-cancel').onclick = () => $('new-dialog').close();
bind('new', () => { const c = createCampaign($('name').value); c.setting = $('new-setting').value.trim(); c.scope = $('new-scope').value.trim(); campaigns.push(c); active = campaigns.length - 1; cancelEditors(); $('new').reset(); $('new-dialog').close(); $('journal-search').value = ''; showTab('journal'); save(); rememberSelection(); render(); });
bind('journal-form', () => {
  const body = $('entry').value.trim(); if (!body) throw new Error('Write a journal entry');
  if (journalEdit) { const entry = campaign().journal.find(x => x.id === journalEdit); entry.body = body; entry.sceneId = $('entry-scene').value || null; }
  else addJournal(campaign(), body, $('entry-scene').value || null);
  journalEdit = null; $('entry').value = ''; $('entry-submit').textContent = 'Add entry'; $('entry-cancel').hidden = true; save(); render();
});
$('entry-cancel').onclick = () => { journalEdit = null; $('entry').value = ''; $('entry-submit').textContent = 'Add entry'; $('entry-cancel').hidden = true; };
$('journal-search').oninput = renderJournal;
bind('character-form', () => {
  const name = $('character-name').value.trim(); if (!name) throw new Error('Enter a character name');
  const fields = { name, notes: $('character-notes').value.trim() };
  if (characterEdit) Object.assign(campaign().characters.find(x => x.id === characterEdit), fields); else campaign().characters.push(newRecord(fields));
  characterEdit = null; $('character-form').reset(); $('character-submit').textContent = 'Add character'; $('character-cancel').hidden = true; save(); render();
});
$('character-cancel').onclick = () => { characterEdit = null; $('character-form').reset(); $('character-submit').textContent = 'Add character'; $('character-cancel').hidden = true; };
bind('settings-form', () => { const c = campaign(), name = $('settings-name').value.trim(); if (!name) throw new Error('Enter a campaign name'); c.name = name; c.setting = $('setting').value.trim(); c.scope = $('scope').value.trim(); const saved = save(); render(); if (saved) status('Campaign setup updated.'); });
bind('scene-form', () => {
  const name = $('scene-name').value.trim(); if (!name) throw new Error('Enter a scene title');
  const fields = { name, notes: $('scene-notes').value.trim() };
  if (sceneEdit) Object.assign(campaign().scenes.find(s => s.id === sceneEdit), fields); else campaign().scenes.push(newRecord({ ...fields, status: 'open' }));
  sceneEdit = null; $('scene-form').reset(); $('scene-submit').textContent = 'Add scene'; $('scene-cancel').hidden = true; save(); render();
});
$('scene-cancel').onclick = () => { sceneEdit = null; $('scene-form').reset(); $('scene-submit').textContent = 'Add scene'; $('scene-cancel').hidden = true; };
$('node-type').replaceChildren(...NODE_TYPES.map(t => new Option(t, t)));
bind('node-form', () => {
  const name = $('node-name').value.trim(); if (!name) throw new Error('Enter a node name');
  const fields = { type: $('node-type').value, name, notes: $('node-notes').value.trim() };
  if (nodeEdit) Object.assign(campaign().nodes.find(n => n.id === nodeEdit), fields); else campaign().nodes.push(newRecord({ ...fields, resolved: false }));
  nodeEdit = null; $('node-form').reset(); $('node-submit').textContent = 'Add node'; $('node-cancel').hidden = true; save(); render();
});
$('node-cancel').onclick = () => { nodeEdit = null; $('node-form').reset(); $('node-submit').textContent = 'Add node'; $('node-cancel').hidden = true; };
bind('track-form', () => { setTrackLength(campaign(), +$('track-length').value); save(); render(); });
bind('beat-form', () => { proposeBeat(campaign(), $('beat-body').value); $('beat-form').reset(); save(); render(); });
bind('table-form', () => {
  const name = $('table-name').value.trim(); if (!name) throw new Error('Enter a table name');
  const entries = $('table-entries').value.split('\n').map(x => x.trim()).filter(Boolean); drawOracle(entries, () => 0);
  const fields = { name, entries };
  if (tableEdit) Object.assign(campaign().tables.find(t => t.id === tableEdit), fields); else campaign().tables.push(newRecord(fields));
  tableEdit = null; $('table-form').reset(); $('table-submit').textContent = 'Save table'; $('table-cancel').hidden = true; save(); render();
});
$('table-cancel').onclick = () => { tableEdit = null; $('table-form').reset(); $('table-submit').textContent = 'Save table'; $('table-cancel').hidden = true; };
function result(body) { addLog(campaign(), body); save(); render(); $('roll-result').textContent = body; $('roll-result').hidden = false; }
bind('dice-form', () => { const expression = $('dice').value; const r = rollDice(expression); result(`${expression}: ${r.rolls.join(', ')}; modifier ${r.modifier}; total ${r.total}`); });
bind('draw-form', () => { const t = campaign().tables.find(t => t.id === $('table-select').value); if (!t) throw new Error('Save an oracle table first'); const q = $('question').value.trim(); result(`${t.name}${q ? '\nQuestion: ' + q : ''}\nAnswer: ${drawOracle(t.entries)}`); });
$('export').onclick = () => { download(JSON.stringify(campaign(), null, 2), 'solo-rp-campaign.json'); status('Backup exported. Keep the file somewhere safe.'); };
$('import').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    if (file.size > 5_000_000) throw new Error('Maximum import size is 5 MB');
    const c = parseCampaign(await file.text()); c.id = crypto.randomUUID(); // Imports are copies, never destructive replacements.
    campaigns.push(c); active = campaigns.length - 1; cancelEditors(); $('journal-search').value = ''; $('roll-result').hidden = true; const saved = save(); rememberSelection(); render(); if (saved) status('Campaign imported as a new copy.');
  } catch (error) { status('Import failed: ' + error.message); }
  finally { e.target.value = ''; }
};
if (blocked) $('save-state').textContent = 'Saving paused';
render(); showTab(tab);
