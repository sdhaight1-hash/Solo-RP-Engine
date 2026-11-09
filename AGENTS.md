# Solo RP Engine

Goal: an independent local-first solo RPG companion inspired by the published workflows of PUM Companion, with a future PUM/SUM/GUM rules implementation.

- Read README.md and docs/ROADMAP.md before changes. State assumptions and give a verifiable acceptance target.
- Keep changes surgical. Use plain browser JavaScript and Node built-ins until a concrete requirement justifies dependencies.
- Run npm run check and npm test. For UI changes, also check the actual browser flow; report when browser verification was not possible.
- Never render imported or user-written text as HTML. Validate imports before changing active state.
- Preserve versioned save compatibility; add migrations before changing save format.
- Keep mechanics separate from UI. Inject random functions in mechanics tests.
- Do not silently invent PUM/SUM/GUM rules. Cite source version and page in rule specs and fixtures.
- Do not commit supplied PDFs, extracted tables, proprietary app assets, or copied product UI. Record content permissions and attribution before distributing rulebook material.
- Do not add AI services, accounts, cloud sync, desktop packaging, or deployment without a task requesting them.
