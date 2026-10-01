# ADV-REV — Dino-runner — V1

*Adversarial pass over `ADV-REV-Dino-runner-V0.md` · 2026-09-30 · input left untouched*

**Ground truth used**
- **Repo:** `ivan-i1/Dino-runner` @ `fa51d9c` "Initial commit". It contains only `README.md` (`# Dino-runner`), an MIT `LICENSE` and a GitHub Gradle-template `.gitignore`. There is no source code yet, so every claim below is checked against the **original game**, not against shipped code.
- **Chromium dino source:** `chromium.googlesource.com/chromium/src/+/refs/heads/main/components/neterror/resources/dino_game/`, which is TypeScript since 2025-07-16. I cross-checked it against `github.com/wayou/t-rex-runner` `index.js` (2014). Line refs below are to the Chromium TS files.
- **Sibling repo:** `hyper-casual-game` (Bounce Fidget), as a stack and effort reference.
- **Web:** Play policy, US copyright guidance and prior-art search, all read on 2026-09-30.

**V0 bucket split** (done before any research)
- **Stated certain:** all nine claims.
- **Stated uncertain:** none.
- **Stated wonder:** none.
- **Unstated assumptions:** six were found (A1–A6 below). That is where this round's value is.

---

## 1. Verdict table

| # | V0 claim | Verdict | Evidence |
|---|---|---|---|
| C2 | "The difference will be the art, and selecting a dinosaur" | **REFUTED** | V0 itself adds two obstacle classes the original lacks: rocks, and aerial obstacles at the top of the screen. It also adds a resource (the cacti meter) and three distinct rule sets. The original roster is only `cactusSmall`, `cactusLarge`, `pterodactyl` and a non-hazard `collectable` (`offline_sprite_definitions.ts:144-198`). This is a new game design built on the Chrome loop, not a reskin. |
| C1 | "Same as the Chrome out-of-internet dinosaur game" | **CORRECTED** | It is true for the **loop**: auto-run, speed ramp, gap generation, AABB collision, score and night mode (`offline.ts:37-81`, `obstacle.ts:204-209`, `offline.ts:1581-1635`). It is false for the content, as shown under C2. |
| C3 | "The tyrannosaur is the same, runs, jumps" | **CORRECTED** | The original T-Rex has **three** inputs, not one. **Jump:** height varies with how long it is held. Release caps upward velocity at -5 once 30 px is reached (`trex.ts:465-520`). **Duck:** Down on the ground switches the hitbox from 44×47 to 59×25. **Fast-drop:** Down in the air sets velocity 1 and multiplies the fall by 3 (`offline.ts:1117-1128`). |
| C8 | "The pterodactyl is the same as the tyrannosaur but it keeps to the top of the screen" | **CORRECTED** | Nothing in the original lives at the top. Pterodactyl obstacles fly at yPos 100, 75 or 50 in a 150-px-tall canvas (`offline_sprite_definitions.ts:175`). A player pinned to the top has **zero obstacles** unless new ceiling obstacles are invented. See S2. |
| C9 | "Jumping causes it to dive, dodging aerial obstacles but being vulnerable to ground obstacles" | **UNVERIFIABLE (design gap)** | No "aerial obstacle" type exists apart from the pterodactyl itself (`offline_sprite_definitions.ts:172-178`). How deep the dive goes, and therefore which ground obstacles it can hit, is undefined. Large cacti reach y=90 (`:161`). |
| C5 | "Instead of jumping, [the triceratops] has a cacti meter that allows to charge into rocks" | **UNVERIFIABLE (design gap)** | The fill rate, trigger, duration, cost per rock and cap are all unstated. Without them, solvability cannot be determined. See S3. |
| C7 | "Going directly into a rock without charging causes a game over" | **CONFIRMED as a rule. Feasibility depends on spawning.** | Internally consistent. It forces a **fairness constraint** on the obstacle generator that the original does not have: no rock may arrive while the meter is empty. See S3. |
| C4 | "The triceratops can eat the cacti but not the rocks" | **CONFIRMED (internally consistent)** | The consequence is unstated: **cacti can never kill the triceratops**, so its only threats are rocks and pterodactyls. |
| C6 | "While charging, it cannot consume cacti but is not hurt either by them" | **CONFIRMED (internally consistent)** | The consequence is unstated: charging blocks refuelling, so long charges starve the meter. That is a good tension, but it is a balance parameter no one has set. |

---

## 2. What changes the shape of the project

### S1. This is three games sharing an engine, not one game with three skins
**What dies:** the "reskin plus a character select" scope that C2 implies.

**What replaces it:**
- One shared core: scroll, speed ramp, gap math, AABB collision, score.
- **One obstacle table and input mapping per dinosaur.** In the original the obstacle generator is a single flat table keyed by type (`offline_sprite_definitions.ts:140-200`), filtered by `minSpeed` and capped at two repeats in a row (`horizon.ts:295-304`).
- With per-dino content, that table needs a per-character dimension. Rocks are needed by the triceratops. Ceiling obstacles are needed by the pterodactyl. The T-Rex needs neither (see A1).

### S2. The pterodactyl has nothing to dodge until "aerial obstacles" are invented
Pinned at the top, the pterodactyl sits above every original obstacle:
- The highest original pterodactyl hitbox covers about y 59–78. This is inferred from the box geometry at yPos 50.
- The tallest cactus top is at y 90.

V0's "dive dodging aerial obstacles" only makes sense if something occupies the top band. The cleanest reading is that **the pterodactyl is a vertically mirrored T-Rex**:
- the ceiling is its ground;
- hanging obstacles are its cacti;
- the dive is its jump;
- ground obstacles are only a threat at the bottom of a deep dive.

That is a coherent design, but it means **new obstacle art and a new spawn table**, not "the same as the tyrannosaur". → Q3, Q4

### S3. The triceratops is not automatically solvable
Two unstated holes:
- **Pterodactyls.** It cannot jump. In the original, the low pterodactyl (yPos 100, hitbox about y 109–128) hits even a **ducking** T-Rex, so it must be jumped (geometry from `trex.ts:96-104` boxes vs the obstacle boxes). The triceratops either needs to charge through birds, or birds must be removed from its stream. Otherwise it dies to unavoidable obstacles once speed reaches 8.5 (`minSpeed: 8.5`, `offline_sprite_definitions.ts:178`).
- **Empty meter.** If a rock arrives with an empty meter, death is unavoidable. The generator must guarantee enough cacti before each rock, something like "meter ≥ cost when the rock spawns". The original generator has no such rule; it picks randomly with only a repeat cap (`horizon.ts:295-304`). This is new generator logic, and the triceratops's fairness depends on it. → Q5–Q8

---

## 3. Corrections and confirmations, claim by claim

**C1 / C2: "same game, only art + selection differ".** The loop really is reusable and well specified:

| Parameter | Value | Source |
|---|---|---|
| Speed | start 6, +0.001 per update, max 13; mobile multiplies speed by 1.2 | `offline.ts:37-81` |
| Clear time before the first obstacle | 3000 ms | `offline.ts:37-81` |
| Gap | `round(width*speed + typeMinGap*0.6)` up to ×1.5 | `obstacle.ts:204-209` |
| Night mode | every 700 points, lasts 12 s | `offline.ts:37-81` |
| Score | `round(distance*0.025)` | `distance_meter.ts` |

This is the part V0 gets right. The content layer is what V0 underestimates (S1).

**C3: T-Rex "runs, jumps".**
- Duck and fast-drop exist (`offline.ts:1117-1128`, `trex.ts:344-346`).
- **Mobile nuance:** on mobile the original only uses pterodactyl heights `[100, 50]` (`offline_sprite_definitions.ts:176`). Those are "must jump" and "ignore", so **ducking is never required on mobile**. If the target is a phone, dropping duck is faithful to the original rather than a simplification.
- Fast-drop still matters for skill at high speed.
- Variable-height jump is the one input that would change the game's feel if dropped. → Q2

**C4 / C6 / C7: triceratops rules.** These are internally consistent. The precedent is real: Dino Run 2 (Pixeljam) has a triceratops that charges through boulders and rock piles (dinorun.fandom.com/wiki/Dino_Run_2, via search snippet; en.wikipedia.org/wiki/Dino_Run). So the mechanic is proven to be understandable, but it is not novel.

**C8 / C9: pterodactyl.** See S2. Prior-art search turned up no Chrome-style runner with a **playable** diving pterodactyl. In clones and in every official Google variant the pterodactyl is only ever an obstacle (en.wikipedia.org/wiki/Dinosaur_Game; 9to5google.com/guides/dino-run/). This is the most novel part of the pitch. *Opinion:* it is probably the hook.

---

## 4. Additions — what V0 never mentioned but must handle

- **A1. What does the T-Rex do about rocks?** If rocks exist only in the triceratops's stream, say so. If they are shared, the T-Rex treats them as cacti (jump over them) and the pterodactyl must dive-avoid them. One sentence either way decides the spawn-table design. → Q1
- **A2. Platform and stack are undecided.**
  - The `.gitignore` is GitHub's stock Gradle template (lines 1-21). That is not a decision, and there is no `build.gradle`, `settings.gradle` or `AndroidManifest`.
  - The only shipped game in the workspace, Bounce Fidget, is **Expo 54 / React Native 0.81.5 / `react-native-game-engine`** (`hyper-casual-game/package.json:23,32,33`; loop at `App.tsx:885`). It uses Gradle only as generated output, and `/android` is gitignored (`.gitignore:41`).
  - The Chrome original is HTML canvas.
  - These three paths have very different costs. → Q9
- **A3. What's reusable from Bounce Fidget, and what isn't.**
  - **Reusable:** the frame-time-scaled loop (`game/physics.ts` `frameScale`, 381 lines of tests), the audio banks (`App.tsx:173-233`), the release-signing plugin and the AsyncStorage patterns.
  - **Absent and would have to be built:** sprite or image drawing (the ball is a styled `<View>`, `App.tsx:354-368`), scrolling, entity-vs-entity collision (only wall clamping, `App.tsx:317-335`), spawning, score, high score and the game-over state. That is essentially the entire runner.
- **A4. High score per dinosaur.** The three characters have different threat models, so one shared high score will be dominated by whichever is easiest. The original stores a single `HI` value (`offline.ts:1311-1340`). → Q10
- **A5. IP and store hygiene.**
  - Gameplay rules aren't copyrightable: "Copyright does not protect the idea for a game… or the method… for playing it" (US Copyright Office FL-108).
  - Look and feel can be: *Tetris Holding v. Xio*, D.N.J. 2012-05-30.
  - Google Play's Impersonation policy (support.google.com/googleplay/android-developer/answer/9888374) bars copying "logos or character designs from well-known brands" in icon or title.
  - So: keep "Chrome" and "Google" out of the title, icon and screenshots. Google holds CHROME, USPTO Reg. 3,360,331.
  - Don't ship the original "Lonely T-Rex" sprite. V0's new-art plan already avoids this. **Keep it that way for the T-Rex too:** "the tyrannosaur is the same" must not mean the same sprite.
  - If any Chromium code is ported, it is BSD-3-Clause (`offline.ts:1-3` plus the Chromium root `LICENSE`). That is compatible with MIT but requires keeping the notice in a NOTICE or third-party file.
- **A6. The repo is public.** `origin = git@github.com:ivan-i1/Dino-runner.git`. Note that an earlier public repo leaked a keystore password (memory: android-keystore-backup). Set up signing secrets outside the tree from day one.

---

## 5. Dark areas

| Question | What was searched | Why it came back empty | What would settle it |
|---|---|---|---|
| Is the triceratops fun at high speed, given cacti can never hurt it? | Not answerable by research | It's a feel question | A playtest of a greybox build: does the triceratops feel too safe? |
| Has Google ever taken down a dino clone on Play? | Web search for removals, ADR domain decisions | The only CHROME enforcement found was against malware or impersonating domains (adrforum.com, 2018). No dino-specific case found. | Nothing cheap. Accept the risk with the A5 hygiene. |
| Is there a registered "Dino" / "T-Rex Runner" mark? | Web search only | The USPTO search tool was not queried directly | A query in USPTO Trademark Search (tmsearch.uspto.gov) for "T-Rex Runner", "Chrome Dino" and "Dino Game" |
| What were the 2021 alt-game characters in Chromium? | Chromium source and log | Definitions were removed 2021-09-15 (crrev 3144005); `GAME_TYPE = []` | Historical checkout before that CL. *Low value: curiosity only.* |
| Is there an exact precedent for a pick-a-dino one-tap runner with per-dino mechanics? | itch.io, Play listings, secondary articles | Play search isn't reliably indexed. Closest matches: Dino Run 2 (PC, roster with abilities) and `com.spiky.DinoRun` (T-Rex, raptor and triceratops, but merge mechanics, not per-dino rules). | A manual Play Store search on a phone |

*Deadline realism* was skipped: V0 states no deadline. That is noted, not assumed.

---

## 6. Decisions that are not mine → **Ivan (author, sole committer)**

- **D1. Obstacle model: shared or per-dino stream (Q1).**
  - **Shared:** less content, but every dino must handle every obstacle, which forces T-Rex vs rock, triceratops vs bird and pterodactyl vs cactus rules.
  - **Per-dino:** three spawn tables, but each character stays pure.
  - *Recommendation: per-dino tables over a shared engine.* The rules in V0 already only make sense per-dino.
- **D2. Triceratops vs pterodactyl obstacles (Q5).** Options:
  - (a) no birds in its stream;
  - (b) a charge breaks birds too;
  - (c) birds fly only high enough to pass over it.
  - *(a) or (c) keep its identity: ground brute, no air game.*
- **D3. Platform (Q9).** Options:
  - **Expo/RN:** reuses your toolchain, signing and Play listing know-how. `react-native-game-engine` with `<View>` sprites is weak for many moving images; expect to add a canvas layer such as Skia.
  - **Web canvas:** closest to the original, fastest to prototype, and you could port Chromium logic under BSD.
  - **Native Kotlin or an engine (Godot, libGDX):** a fresh toolchain.
  - *No recommendation without knowing the distribution target (Q9).*
- **D4. T-Rex input fidelity (Q2).** Keep variable jump, fast-drop and duck, or reduce to tap = jump.

---

## 7. Tradeoffs

- **Per-dino high score vs one global score.**
  - Per-dino honours each character, but the leaderboard fragments.
  - Global is simpler, but players will converge on the easiest dino, and the triceratops's cactus immunity might make it that.
- **Meter as a timed charge vs a per-rock token.**
  - **Timed charge** (hold or tap to charge for N seconds, draining the meter): skill expression and risk of wasting it. Harder to guarantee fairness.
  - **Token** (each cactus = 1 charge; tapping before a rock spends one): trivially fair to generate (count tokens vs rocks), but less tension.
- **Pterodactyl dive depth.**
  - **Shallow** (never reaches cacti): makes "vulnerable to ground obstacles" dead text.
  - **Full** (reaches the ground): makes the dive a real commitment and gives the pterodactyl a skill ceiling.
- *Moved — not a real tradeoff:* **new art vs the original sprites.** New art wins outright: it is the V0 plan, and it is the impersonation safeguard (A5).

---

## 8. Questions for the next dump

Ordered by how much the answer unblocks. Numbering continues across the whole loop.

1. **Rocks: triceratops-only, or in every dino's stream?** If shared, what does the T-Rex do (jump like a cactus?) and the pterodactyl (dive-avoid?) (A1, D1)
2. **T-Rex inputs:** keep variable-height jump, fast-drop and duck? On mobile the original never requires duck. (C3, D4)
3. **Pterodactyl world: what are the "aerial obstacles"?** Hanging from the ceiling, other flyers, something else? Is it right to treat the pterodactyl as a vertically mirrored T-Rex? (S2)
4. **Pterodactyl dive depth:** can a dive reach cactus height or the ground, and does it have variable depth like the T-Rex's variable jump? (C9)
5. **Triceratops vs birds:** (a) none in its stream, (b) charge breaks them, or (c) they pass over it? (S3, D2)
6. **Meter economics:** how much does one cactus add, what is the max, and does it start empty or partly full? (C5)
7. **Charge mechanics:** tap or hold to charge? Fixed duration, or until it hits one rock? How much meter does one rock cost, and can one charge break several rocks? (C5, Tradeoffs)
8. **Fairness rule:** OK to guarantee in the generator that no rock spawns unless the meter can afford it? Or is "you wasted your charge" a legitimate death? (C7, S3)
9. **Where does this ship?** Google Play, web, iOS, several? Which stack: Expo/RN like Bounce Fidget, web canvas, or native/engine? (A2, D3)
10. **Scoring:** a separate high score per dino, or one shared? Are all three dinos available from the start, or unlocked? (A4)
11. **Are original-game features in scope?** Night-mode inversion every 700 points, the score flash and sound every 100, and the 3 s clear start. (C1)
12. **Name and branding:** confirm the store title will contain neither "Chrome" nor "Google", and that the T-Rex gets new art too. (A5)
