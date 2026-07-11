# Quota Machine

A systems-engineer-themed automation game (hackathon project, theme:
"Automation"). Each turn: buy machines in the shop, solve circuit-diagram
logic-gate puzzles to power them on, and connect machines together for
synergy bonuses so they keep generating quota on their own. Machines fail
after a few turns and need to be re-solved. Frontend-only, no backend —
everything runs client-side in the browser.

## Project layout

- `src/engine/circuit-engine.js` — pure digital-logic evaluator (AND/OR/NOT/XOR/NAND/NOR/BUFFER, cycle detection, truth-table validation). No React/DOM dependency.
- `src/data/` — hardcoded machines, synergy pairs, and puzzle specs (built with `genSpec`).
- `src/game/` — pure game-rule functions: state shape, turn resolution, shop.
- `src/components/` — React UI stubs that call into `engine/` and `game/` only.

## Run locally

```bash
npm install
npm run dev
```

## Run tests

```bash
npm test
```

## Build

```bash
npm run build
```

Outputs a static site to `dist/`.

## Deploy

This repo deploys via the **GitHub Actions** workflow at
[.github/workflows/deploy.yml](.github/workflows/deploy.yml), which builds
and publishes `dist/` to GitHub Pages on every push to `main`.

In the repo's **Settings → Pages**, set **Source** to **GitHub Actions**
(not the `gh-pages` branch) for this to work.

You can also deploy manually with the `gh-pages` package:

```bash
npm run deploy
```

Once enabled, the game will be live at:

```
https://<username>.github.io/quota-machine/
```
