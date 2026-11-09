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

Local browser execution was blocked by this agent workspace's process/network isolation, so the suite ran on GitHub Actions. Both engine and Chromium jobs passed for commit 6c83f8c (run 42583358153). The first browser run caught mobile horizontal overflow; that defect was fixed before the successful rerun. Desktop and 390-pixel mobile screenshots were visually inspected. User visual/play testing remains necessary for layout and workflow preference.

Validation run: https://github.com/sdhaight1-hash/Solo-RP-Engine/actions/runs/42583358153

## Interface target selected
Steve selected the layout closest to PUM Companion. The play screen now follows its documented arrangement: oracle panel left, journal and entities center, plot nodes right, plot track above, dice below the composer. Desktop panels coexist, medium-width side panels roll out, and narrow screens use one active panel. The timeline merges narration, oracle/dice results and beat actions chronologically. Character dialogue records a speaker name snapshot. Existing version 2 saves remain compatible; speaker names are optional on imported journal entries.

Sources: https://unfolding-machines.github.io/pumc-online-hub/game-interface/ and https://unfolding-machines.github.io/pumc-online-hub/log-panel/

New browser coverage checks 1920px desktop, 1280px rollout behavior and 390px single-panel navigation. The new layout passed both engine and Chromium jobs in run 42585783468 for commit 48a0d7d, including medium-width toolbar accessibility. Desktop and mobile screenshots were reviewed; follow-up styling gives the mobile campaign selector a full row and keeps the desktop panes within 1080px height. The browser suite reruns for those refinements.

Panel-layout validation: https://github.com/sdhaight1-hash/Solo-RP-Engine/actions/runs/42585783468

Remaining interface work: resizable dividers, broader entity tabs, rich-text formatting and main-menu campaign cards. These are not claimed as implemented.

## Following that checkpoint
1. Multiple plot scopes/sheets and track history; verified per-sheet specifications.
2. Official PUM beat/oracle indexing with source/page fixtures and appropriate content distribution permissions. Keep user-entered content separate from shipped engine code.
3. SUM v8 Rev2 scene-control and NPC interaction mechanics, checked against the supplied edition.
4. GUM v2.2 game setup/improvisation workflow, checked against the supplied edition.
5. Richer entities, accessibility refinements and offline installation once actual play confirms the core workflow.

AI services, accounts, cloud sync, desktop packaging and public deployment remain outside this checkpoint. No feature parity or official-app save compatibility is claimed.
