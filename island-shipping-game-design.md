# Island Shipping Tycoon — Game Design Document

## Overview

A top-down 2D shipping and trading game for kids ages 6–12. Players start with a single rowboat and a small home island, explore a fog-covered sea to discover new islands, run trade routes between them, and grow into a shipping empire. Single-player, single save slot, endless sandbox.

**Core loop:** Sail → Discover → Trade → Earn → Upgrade → Sail further

**Design pillars:**
- **Approachable for a 6-year-old.** Visual progression, no time pressure, clear feedback.
- **Deep enough for a 12-year-old.** Route optimization, risk/reward decisions, automation systems.
- **Event-driven.** Nothing happens unless the player takes action. Safe to walk away.

---

## Systems

### 1. The Map

- Top-down 2D view, scrollable in all directions.
- Starts almost entirely covered in **fog of war**. Only the home island and a small radius around it are visible.
- Sailing a ship through the fog reveals the area in a radius around the ship. Discovered areas stay visible permanently.
- Procedurally generated or hand-designed map of ~25–30 islands at varying distances from home.
- Map includes:
  - **Open sea** (safe sailing)
  - **Storm waters** (dark blue tiles, dangerous, faster routes)
  - **Pirate zones** (revealed once a pirate island is discovered nearby)

### 2. Islands

Each island has:
- A **name** (auto-generated from a name list — "Coral Bay," "Ironhold," "Mango Cove")
- A **resource it produces** (one primary resource)
- A **resource demand profile** — what it pays well for and what it doesn't want
- A **visual style** matching its resource (palm trees for tropical, smoke stacks for industrial, etc.)

**Resource list (starting set):**
- Coconuts
- Fish
- Iron
- Wood
- Sugar
- Spices
- Gold ore
- Cloth

**Pricing logic:** Each island pays a base price for each resource, with a multiplier (0.2x to 5x) based on demand. The home island always buys everything at fair prices, but distant islands offer the best margins.

**Discovery reward:** First time you discover an island, get a small gold bonus (50–500 depending on distance from home).

### 3. Ships and Sailing

**Manual control:**
- Click and drag to set a destination, or use arrow keys to steer.
- Ship sails automatically once a destination is set.
- Player can dock at any discovered island to buy/sell.

**Cargo system:**
- Each ship has a cargo capacity (starts at 5 units).
- Player chooses what to load at each port.
- Selling at a destination is automatic on docking, with a confirmation popup showing prices.

**Ship types (progression):**
| Ship | Cost | Cargo | Speed | Hull | Notes |
|------|------|-------|-------|------|-------|
| Rowboat | Starter | 5 | Slow | Weak | Free, the one you start with |
| Sloop | 500g | 15 | Medium | Medium | First real upgrade |
| Schooner | 2,500g | 40 | Fast | Medium | Good all-rounder |
| Galleon | 10,000g | 100 | Slow | Strong | Cargo hauler |
| Steamship | 50,000g | 200 | Very Fast | Strong | Endgame ship |

**Ship upgrades (per ship):**
- Cargo hold (+capacity)
- Sails/engine (+speed)
- Hull plating (+survival chance in danger zones)
- Cannons (+pirate combat odds)

### 4. Risk and Danger

**Storm waters:**
- When setting a route, the game shows estimated travel time.
- Player can choose **safe route** (around storms, longer) or **shortcut** (through storms, faster but ~20% chance of ship damage or sinking per voyage).
- Visual cue: storm waters are dark blue with animated waves and lightning.

**Pirates:**
- **Roaming pirates** appear on discovered routes once you've discovered a pirate island. They chase ships within range. Faster ships outrun them; ships with cannons can fight.
- **Pirate islands** spawn raiders periodically. Player can:
  - Pay tribute (one-time gold cost, peace for 10 voyages)
  - Hire them (they protect your ships, cost ongoing)
  - Destroy them (send a warship, expensive, permanent reward)
- **Home island raids** (mid-game and later): pirates occasionally attack the home bank. Player must build cannon towers on home island for defense. If undefended, lose 10–25% of stored gold.

**Ship loss:**
- If a ship sinks, cargo is lost.
- Sunk ships can be recovered for half their original cost (insurance light).
- Make sure rowboat sinking is rare and forgiving early — the 6-year-old will be doing manual runs.

### 5. Trade Routes / Shipping Lanes

Once player has discovered enough islands and saved enough gold:
- **Build a trade post** on a discovered island (cost scales with distance from home).
- **Establish a shipping lane** between two trade posts (one-time cost based on distance).
- Assign a ship to the lane. It runs the route automatically, buying low and selling high based on player's configuration.
- Player sets:
  - Which resource to pick up at each end
  - Whether to take safe or fast route

**Why this matters:** This is the transition from "playing the game" to "managing the game." It's the classic tycoon moment, and it's what makes the 12-year-old keep playing.

### 6. Home Island Progression

Visible, dramatic visual progression. Buildings appear as you build them.

**Starter state:** One small dock, one hut, one coconut tree.

**Buildings to unlock (in rough order):**
- **Warehouse** — increases gold/resource storage cap
- **Shipyard** — required to build new ships beyond rowboat
- **Market** — boosts home island prices by 10%
- **Lighthouse** — extends fog-of-war reveal radius for all your ships
- **Cannon Towers** — defend against pirate raids
- **Naval Academy** — required for steamships and warships
- **Bank Vault** — pirates can steal less during raids
- **Trading Hall** — manage shipping lanes from here

Each building has 3 visual upgrade tiers so the home island visibly grows from "lonely hut" to "bustling port city."

### 7. Economy and UI

**Top bar (always visible):**
- Gold counter (clickable — opens resource inventory)
- Current ship's cargo (when sailing)
- Mini-map button

**Resource inventory popup:**
- List of all resources currently held in home warehouse
- Quantities and current home-market prices

**At each island dock:**
- Buy/sell screen showing local prices for every resource
- Highlights items where local price is significantly above or below average

**No timers, no day/night, no seasons.** Everything is event-driven. Walking away from the game pauses it.

---

## Audience-Specific Design Notes

**For the 6-year-old:**
- Manual sailing is satisfying on its own. Don't force them to use shipping lanes.
- Visual feedback for everything: coins fly into the bank when selling, ships visibly grow when upgraded, home island gets prettier.
- Crashes and pirate losses should be rare and recoverable in early game.
- Big chunky icons. Resource buttons should be obvious.

**For the 12-year-old:**
- Price discovery is its own meta-game. Let them keep notes mentally on which islands pay best for what.
- Risk math on storm shortcuts.
- Optimization of shipping lane configurations.
- Pirate decisions: tribute vs. hire vs. destroy creates real strategy.

**For the dad:**
- Endless mode means they can come back to it for months.
- Fog-of-war reveal is genuinely satisfying for any age.

---

## Build Order (Suggested Phases)

This is the order I'd suggest for development. Each phase produces a playable game; later phases add depth.

### Phase 1: Core Loop (Minimum Playable)
- Top-down map with home island and 3–5 nearby islands (no fog of war yet)
- One rowboat, manual control with arrow keys
- Buy/sell at islands with fixed prices
- Gold counter and basic resource inventory
- Goal of this phase: it's fun to sail around and trade for 10 minutes

### Phase 2: Exploration
- Fog of war
- Larger map with 25–30 islands
- Discovery bonuses
- Variable pricing per island

### Phase 3: Ships and Upgrades
- Buy new ships (sloop, schooner)
- Ship upgrades (cargo, speed, hull)
- Shipyard building on home island
- Multiple ships owned (manually switch which one you control)

### Phase 4: Danger
- Storm waters with safe/fast route choice
- Basic pirates (roaming only)
- Cannons and ship combat
- Ship loss and recovery mechanic

### Phase 5: Automation
- Trade posts on islands
- Shipping lanes between trade posts
- Trading Hall building on home island
- Lane configuration UI

### Phase 6: Home Island Depth
- All buildings (warehouse, lighthouse, market, naval academy, bank vault)
- Visual tier upgrades for buildings
- Cannon towers and home raid defense

### Phase 7: Endgame
- Galleons and steamships
- Pirate islands with tribute/hire/destroy options
- Larger map, more resources

---

## Technical Notes for Claude Code

- **Recommended stack:** HTML5 Canvas + vanilla JS, or Phaser 3 if you want a 2D game framework. Phaser handles sprites, input, and game loops out of the box and is well-documented.
- **Save system:** localStorage is fine for single save slot. Save game state on every major action (dock, purchase, upgrade).
- **Art:** Simple top-down sprite art. Free assets available on itch.io (search "top down ship sprites" or "pixel pirate"). Or use simple geometric shapes as placeholders during development.
- **Sound:** Optional but adds a lot. Wave sounds, coin chimes, ship horns. freesound.org has free options.
- **Map generation:** For a first version, hand-place the islands in a JSON file rather than procedurally generating. Easier to balance and tune.
- **Build small, test with kids early.** Phase 1 alone, played by your 6-year-old, will tell you more than any design doc.

---

## Open Questions to Decide Later

- Should ships have crews that need to be hired and paid? (Adds depth, also adds friction. Probably skip for v1.)
- Should there be weather beyond storm zones? (Random storms anywhere = annoying. Skip.)
- Should there be quests/missions from islanders? ("Bring me 10 coconuts for a reward.") (Good Phase 7+ addition.)
- Multiplayer/co-op? (You said no for now, but local couch co-op where one kid steers and one manages economy could be a future idea.)
