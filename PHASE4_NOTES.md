# Phase 4 — Implementation Notes

Tracking what's done vs. deferred from the **Phase 4: Danger** section of [island-shipping-game-design.md](island-shipping-game-design.md).

## Done

- **Storm waters**
  - 4 storm zones placed on the map (north-gale, east-squall, south-tempest, southwest-fury).
  - Animated rendering: dark blue radial gradient, swirling rings, occasional lightning flash.
  - Hidden under fog of war until discovered, like islands.
  - Damage roll fires once per storm-entry (transition from outside → inside).
  - Damage probability scales with hull tier:
    - hullTier 0 (default): 22%
    - hullTier 1: 12%
    - hullTier 2: 6%
  - On a damage roll:
    - 70% — minor damage: lose ~35–55% of cargo overboard.
    - 30% — ship sinks: all cargo lost.
  - **Sinking flow:**
    - Rowboat: cargo wiped, refloated at Home Harbor (kid-friendly, never lose the rowboat).
    - Paid ships (Sloop/Schooner): removed from fleet, added to `game.sunkShips`. Active ship switches to the next ship (rowboat fallback if fleet empty).
    - Recovery: a "Recover [Ship]" action appears in the Shipyard tab at home for half the original cost.
  - First-ever storm entry shows a one-time warning: *"Storm waters! Sailing through is faster but risky."*

## Deferred → Now Built

The following were originally deferred from Phase 4 and have since shipped in the **Pirates Pass** (combined with the pirate-related items from Phase 6 and Phase 7):

- ✅ Roaming pirates that chase player ships
- ✅ Cannons ship upgrade (3 tiers)
- ✅ Combat popup (Fight / Flee / Pay off) with cannon + speed-based odds
- ✅ Pirate islands with Tribute / Hire / Destroy negotiation
- ✅ Cannon Towers + Bank Vault home buildings
- ✅ Home raid system (periodic, defended by towers, gold loss reduced by vault)
- ✅ Lane auto-combat (silent dice roll, toasts narrate)

All tuning knobs are at the top of [game.js](game.js) in the `PIRATES` constant.

## Open questions to revisit when we do pirates

- Should pirates only spawn on discovered routes, or anywhere in revealed waters?
- Should a "no-pirate" early game window exist (e.g., not until the player owns a Sloop)?
- Should the Hull Plating upgrade also help against pirates, or do we add a separate Cannons upgrade with its own odds?
- Recovery cost balancing: half of original cost feels right for storms; pirates probably want a different recovery model since they could *steal* the ship rather than sink it.

## Temporary test changes (revert before shipping)

- **Starting gold bumped to 9150g** (from 150g) in [game.js](game.js) `game.gold` for faster testing of mid/late-game features (Sloop, Schooner, upgrades, sinkings + recoveries). Lower this back to 150 before any real playtest with kids — the early-game gold pacing is a core part of the loop.

## Future polish — storms

- **Dynamic storms.** Real storms aren't fixed locations — they form, drift, and dissipate. Replace the static `storms` array with a system that:
  - Spawns storms periodically in random open-water cells.
  - Gives each storm a lifetime (~30–90 seconds) with grow / hold / shrink phases.
  - Optionally drifts them slowly across the map.
  - Caps total active storm count (~3–5).
  - Hides storm centers under fog so they only become visible as the player nears them.
- This is a Phase 4 polish task we can do later — current static storms are good enough to playtest the danger feel.

## Tuning knobs (if storms feel off in playtests)

All in [game.js](game.js):
- Storm placement / radius: `storms` array near top.
- Damage chance: `stormDamageChance(hullTier)`.
- Sink-vs-damage split: 0.3 in `applyStormStrike`.
- Cargo loss fraction: `0.35 + Math.random() * 0.2` in `applyStormStrike`.
