# Island Shipping Tycoon

A top-down 2D shipping & trading game for kids ages 6–12, built phase-by-phase from [island-shipping-game-design.md](island-shipping-game-design.md). Sail a rowboat out of a foggy ocean, discover 32 islands, run trade routes, fight pirates, and grow your home harbor from a hut into a port city.

No frameworks — plain HTML/CSS/JS, runs entirely in the browser.

## Run it locally

Clone the repo and serve the directory with any static file server. Easiest is Python's built-in:

```bash
git clone https://github.com/camjaywilson/island-game.git
cd island-game
python3 -m http.server 8765
```

Then open <http://localhost:8765> in a browser. That's it — no build step, no install.

If port 8765 is taken, use any other port (e.g. `python3 -m http.server 4000`).

## Controls

- **Arrow keys / WASD** — sail the active ship
- **Click an island** when nearby to dock and trade
- **Right-side panel at home** — Shipyard / Routes / Base tabs for upgrades
- **Left-side panel anywhere docked** — Market, Warehouse, Ship Hold

## Project layout

| File | What's in it |
|---|---|
| [`index.html`](index.html) | Page shell, top bar, side panels, modal + toast containers |
| [`styles.css`](styles.css) | All styling — panels, buttons, combat arena, toasts, modals |
| [`game.js`](game.js) | Everything else: world, islands, ships, storms, pirates, combat, lanes, rendering, input |
| [`island-shipping-game-design.md`](island-shipping-game-design.md) | Original game design doc |

## Tuning

All major balancing constants are gathered at the top of [`game.js`](game.js):

- `PIRATES` — detection radius, spawn rate, combat odds, tribute/hire/destroy costs, raid frequency
- `storms` array — storm zone positions and radii
- `stormDamageChance(hullTier)` — storm damage probability per hull tier
- `shipTypes` — costs, capacity, speed, hull for each ship class
- `RESOURCE_BASE_PRICE` — baseline price for each tradeable good
- `shipActions` / `homeActions` — upgrade tiers and costs

## Backlog / Future ideas

Things that aren't built yet, ordered roughly by how much they'd add:

- **Save / load** — `localStorage` so progress survives a page refresh
- **Dynamic storms** — current storms are fixed circles. Real ones form, drift, and dissipate. Replace the static `storms` array with periodic spawn + lifetime + grow/hold/shrink phases, capped at ~3–5 active.
- **Lane profitability HUD** — gold earned per lane this session, so the strategist kid can optimize routes
- **Sound** — wave loop, coin chime on sale, ship horn on dock, cannons in combat
- **Tactical combat buttons** — extend the round-based combat with Aimed Shot / Volley / Boarding choices, more rewarding for older kids
- **Boss pirates** at the pirate islands themselves, with much more HP and a real reward
- **Quests / missions** from islanders ("bring me 10 coconuts for a reward") — Phase 7+ in the design doc

## Built with

[Claude Code](https://claude.com/claude-code) — every feature in here was scoped, designed, and implemented in conversation with Claude.
