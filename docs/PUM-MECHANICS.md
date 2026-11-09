# PUM v9: implemented mechanics and limits

Source: user-supplied Plot Unfolding Machine v9.0, PDF pages 3–5, 7, 9. Page numbers below refer to the PDF page index (starting at 1). No official oracle/beat table text is distributed.

| Source | Requirement | Implementation |
| --- | --- | --- |
| Page 3, preparing a game | Establish universe, protagonists and plot scope | Campaign setup fields, characters and scope |
| Page 3, plot nodes | Keep plot-relevant world elements, potential problems, useful findings and pending questions | Typed editable nodes, with optional character/location categories |
| Pages 4–5, game loop | Invoke a beat, play it, assess relevance, then advance if relevant | `proposeBeat` creates pending beats; `resolveBeat` separately confirms or dismisses |
| Page 7, traversing a track | Confirming a relevant beat advances the next track position | Progress is derived from the number of confirmed beats |
| Pages 7 and 9, custom sheet | Track length may be customized | Editable length of 1–100; eight boxes is an application default, not the Standard sheet |
| Page 9, voluntary node invocation | A plot node may be invoked voluntarily | Invoke-node action creates a pending beat, subject to later confirmation |

Application choices: dismissed/confirmed beats cannot be confirmed again; progress cannot exceed the configured track length; shortening cannot erase confirmed progress. A completed track can be extended. These are data integrity constraints, not additional claims about PUM rules. Resolve/reopen on a plot node is a manual organizational aid.

Not yet implemented: official modified-proposal or random-prompt tables, sheet-specific focuses, multiple plot sheets per campaign, automatic stage labels, timed beats, disruption dice, official yes/no or enrichment tables, SUM scene automation, and GUM setup generators. The user currently interprets prompts with their own rulebook and records the outcome. Custom tables use uniform per-line draws; they do not claim to reproduce the official table indexing.

Tests: test/engine.test.js verifies non-advancing invocation/dismissal, exactly-once confirmation, full-track rejection and preservation of confirmed progress.
