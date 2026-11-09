# Solo RP Engine

An independent local-first solo tabletop RPG companion inspired by the workflows of JeansenVaars' PUM Companion. Not affiliated with or endorsed by Unfolding Machines.

## Run locally

Requires Node.js 24. The application has no third-party runtime dependencies.

```sh
npm start
```

Open http://localhost:3000. The server binds only to this computer. Stop it with Ctrl+C.

## Playable features

- Multiple campaigns with world/tone and plot scope setup.
- Journal writing, editing, deletion, search and scene links.
- Editable characters, scenes and typed plot nodes.
- Custom-length plot track with separate beat invocation, confirmation and dismissal.
- Named editable oracle tables, questions, dice expressions and persistent activity log.
- Automatic browser saves, versioned JSON export/import, legacy v1 migration.
- Save recovery and cross-tab conflict detection to reduce accidental overwrite.

Campaigns stay in this browser's local storage. Export each campaign regularly. Imports create a new copy rather than replacing an existing campaign. Browser storage is not a durable backup. A storage error pauses or reports failed saving while retaining current work in memory for export.

The custom plot workflow implements part of PUM v9; official random tables and full SUM/GUM mechanics are not bundled. See [mechanics](docs/PUM-MECHANICS.md), [roadmap](docs/ROADMAP.md), and [sources](docs/SOURCES.md).

## Checks

```sh
npm run check
npm test
```

GitHub Actions runs both checks and a Chromium browser acceptance script on pushes and pull requests. The browser job temporarily installs pinned Playwright test tooling; it does not add runtime dependencies. Screenshots are attached to the workflow run.

To run the same optional browser checks locally, first start the app, then in another terminal:

```sh
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install chromium
node scripts/browser-smoke.cjs
```

Set `CHROMIUM_PATH` only if using an existing Chromium executable. Browser testing uses disposable contexts, not your personal campaign data.

## Manual play-test checkpoint

1. Create an adventure and add a journal entry. Edit it and reload.
2. Add a character, a scene, and a question node. Try the workspace at your usual display size.
3. Add your own oracle table, ask a question, and roll dice. Check the activity log.
4. Invoke a beat. Confirm that the track waits for your confirmation; dismiss a second beat.
5. Export the campaign and import it as a new copy. Check that the journal, scenes and track survive.

Feedback needed: whether this workspace organization supports your actual play, which panels should stay visible together, and how closely the next UI iteration should follow the Companion's workflow. Automated checks cannot answer those preferences.
