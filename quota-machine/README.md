# Quota Machine
A system engineer strives to automate his machines to please his boss and hit his quotas on time. 

## Project layout

- `src/engine/circuit-engine.js` — pure digital-logic evaluator (AND/OR/NOT/XOR/NAND/NOR/BUFFER, cycle detection, truth-table validation). No React/DOM dependency.
- `src/data/` — hardcoded machines, synergy pairs, and puzzle specs (built with `genSpec`).
- `src/game/` — pure game-rule functions: state shape, turn resolution, shop.
- `src/components/` — React UI stubs that call into `engine/` and `game/` only.
