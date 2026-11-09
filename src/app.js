import { createCampaign, parseCampaign, rollDice, drawOracle } from './engine.js';
const $ = id => document.getElementById(id);
const key = 'solo-rp-engine-v1';
let campaigns = [], active = 0;
const status = text => { $('status').textContent = text; };
try {
  const stored = localStorage.getItem(key);
  if (stored) {
    const data = JSON.parse(stored);
    if (!Array.isArray(data)) throw new Error('Invalid saved campaigns');
    campaigns = data.map(c => parseCampaign(JSON.stringify(c)));
  }
} catch (e) { status('Could not load saved campaigns: ' + e.message); }
if (!campaigns.length) campaigns.push(createCampaign('My first adventure'));
function save() {
  try { localStorage.setItem(key, JSON.stringify(campaigns)); status('Saved in this browser. Export JSON for a backup.'); }
  catch { status('Browser storage unavailable or full. Export JSON now to keep your changes.'); }
}
function render() {
  $('campaigns').replaceChildren(...campaigns.map((c, i) => new Option(c.name, i, false, i === active)));
  const c = campaigns[active]; $('title').textContent = c.name;
  for (const field of ['journal', 'characters']) {
    $(field).replaceChildren(...c[field].map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  }
}
$('campaigns').onchange = e => { active = +e.target.value; render(); };
$('new').onsubmit = e => { e.preventDefault(); try { campaigns.push(createCampaign($('name').value)); active = campaigns.length - 1; e.target.reset(); save(); render(); } catch (error) { status(error.message); } };
for (const [form, input, field] of [['journal-form', 'entry', 'journal'], ['character-form', 'character', 'characters']]) {
  $(form).onsubmit = e => { e.preventDefault(); const text = $(input).value.trim(); if (!text) return; campaigns[active][field].push(text); e.target.reset(); save(); render(); };
}
$('dice-form').onsubmit = e => { e.preventDefault(); try { const r = rollDice($('dice').value); status(`Dice: ${r.rolls.join(', ')}; modifier ${r.modifier}; total ${r.total}`); } catch (error) { status(error.message); } };
$('oracle-form').onsubmit = e => { e.preventDefault(); try { status('Oracle: ' + drawOracle($('oracle').value.split('\n').map(x => x.trim()).filter(Boolean))); } catch (error) { status(error.message); } };
$('export').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(campaigns[active], null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'solo-rp-campaign.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$('import').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  try { if (file.size > 5_000_000) throw new Error('Maximum import size is 5 MB'); const c = parseCampaign(await file.text()); campaigns.push(c); active = campaigns.length - 1; save(); render(); }
  catch (error) { status('Import failed: ' + error.message); }
  finally { e.target.value = ''; }
};
render();
