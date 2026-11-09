# Development status and next checkpoints

## Implemented: core play loop
- Campaign setup and switching; editable/searchable journal and editable characters.
- Editable named custom tables, questions, dice and persistent activity log.
- Editable scenes, scene-journal links, closing/reopening scenes.
- Editable typed plot nodes with manual resolution/reopening.
- Local storage, version 2 JSON import/export, migration from original v1 files, storage recovery and cross-tab conflict detection.

## Implemented: first PUM mechanics slice
Custom-length plot track; beat invocation independent from confirmation; dismissal without advancing; explicit node invocation. Eight boxes is an editable application default. Source and limits are in PUM-MECHANICS.md.

## Validation
Engine tests and syntax checks run locally. A Chromium end-to-end script covers campaign setup, safe text rendering, editing, custom tables, dice, scenes, beat confirmation, reload persistence, fresh-context import/export, malformed imports, mobile overflow, cross-tab conflicts and corrupt-save preservation. GitHub Actions runs this script and uploads desktop/mobile screenshots.

Local browser execution was blocked by this agent workspace's process/network isolation. Do not claim the browser suite passed until its workflow run reports success. User visual/play testing remains necessary for layout and workflow preference.

## Next: user visual/play-test checkpoint
Use README's five-step play test. Resolve workspace layout and panel visibility preferences before expanding the interface further.

## Following that checkpoint
1. Multiple plot scopes/sheets and track history; verified per-sheet specifications.
2. Official PUM beat/oracle indexing with source/page fixtures and appropriate content distribution permissions. Keep user-entered content separate from shipped engine code.
3. SUM v8 Rev2 scene-control and NPC interaction mechanics, checked against the supplied edition.
4. GUM v2.2 game setup/improvisation workflow, checked against the supplied edition.
5. Richer entities, accessibility refinements and offline installation once actual play confirms the core workflow.

AI services, accounts, cloud sync, desktop packaging and public deployment remain outside this checkpoint. No feature parity or official-app save compatibility is claimed.
