# Solo RP Engine

An independent solo tabletop RPG companion inspired by the workflows of JeansenVaars' PUM Companion. Not affiliated with or endorsed by Unfolding Machines.

## Development

Requires Node.js 24. No third-party dependencies.

```sh
npm test
npm run check
npm start
```

Open http://localhost:3000. Campaigns stay in this browser's local storage. Export JSON backups to preserve them or move between devices.

## Starting scope

Campaigns, journal, characters, dice, custom oracle tables, and versioned JSON save/load. This is a foundation, not feature parity with PUM Companion. See [the roadmap](docs/ROADMAP.md) and [sources](docs/SOURCES.md).

## GitHub Actions

CI runs syntax checks and automated tests on pushes and pull requests, and can be started manually from Actions. No secrets are needed. GitHub Actions validates changes; it does not independently develop the application.
