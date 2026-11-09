# Implementation plan

## 0: Development foundation (implemented)
- Dependency-free browser shell; multiple campaigns, journal entries, character notes.
- Generic NdS dice, uniform custom oracle draws, local storage, validated version 1 JSON import/export.
- Node mechanics tests, syntax checks, GitHub Actions CI.

Acceptance: checks pass; campaign export/import preserves content; invalid saves are rejected. Browser QA still required for storage, downloads, import, keyboard navigation, and narrow screens.

## 1: Complete the basic play loop
- Edit journal and characters; persist dice/oracle outcomes in the campaign log.
- Persist named custom tables; explicit campaign switching and backup feedback.
- Browser acceptance: create two campaigns, edit both, reload, export one and import into a fresh browser profile. Failed import must leave existing state intact.

## 2: PUM v9 mechanics
- Write source/page-based specifications for plot scopes, nodes, tracks, focuses, beat invocation, confirmation and advancement.
- Separate proposed beats from confirmed beats; do not automatically advance every scene.
- Implement one verified plot-sheet mode first, with boundary tests and deterministic examples.
- Keep exact published table text separate from engine code; confirm redistribution terms before including content.

## 3: SUM v8 Rev2 and GUM v2.2
- SUM: specify and implement scene emulation and NPC interaction workflows from the supplied edition.
- GUM: specify game setup and improvisation helpers from the supplied edition.
- Check actual dice/table indexing, modifiers and transitions against each source before implementation. Generic prototype oracles are not substitutes for official mechanics.

## Later
Search, richer entities, themes, accessible responsive workspace, offline installation/service worker, and desktop packaging only after the core play loop is reliable. AI, cloud, 3D dice, decks and marketplace extras are outside the initial scope.

The prototype runs locally but is not yet an installable offline PWA. No feature parity or official-app save compatibility is claimed.
