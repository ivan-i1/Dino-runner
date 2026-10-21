# ADV-REV — Dino-runner — V2

_Adversarial pass over the answers in `ADV-REV-Dino-runner-V1.md` (Q1–Q12, written inline) · 2026-09-30 · input left untouched_

**Ground truth used this round**

- **Chromium dino source:** the same TypeScript as V1, at `/tmp/dino/`. Line refs below are to those files.
- **Exact-constant simulation:** Node scripts replaying the original physics frame by frame. They are in the job scratch dir as `sim.js`, `clear.js`, `gaps.js`, `seq2.js` and `mc.js`. The Monte Carlo is 200,000 runs × 200 obstacles.
- **Local readiness:**
  - This Mac has **Xcode 26.2** (`xcodebuild -version`).
  - Bounce Fidget (`hyper-casual-game`): `app.json:17` has an iOS bundle id, but there is no `ios/` dir and no `eas.json`. Its `claude/STATUS.md:99-100,286` shows no Play release confirmed live on any track.
  - Bingepick: `project.pbxproj:263` has `DEVELOPMENT_TEAM = 6Z7QTCVKMR`, but `:277` still uses the template bundle id.
- **Web:** Apple and Google policy pages, npm registry and engine docs, fetched 2026-09-30. Two were checked by hand:
  - Apple "Add a new app": _"You can use an app name for one app per localization."_
  - Google Play 14151465: _"minimum of 12 testers who have been opted in continuously for at least 14 days"_, for personal accounts created after Nov 13, 2023.

**V1-answer bucket split**

- **Stated certain:** every answer to Q1–Q12.
- **Stated uncertain:** "artwork not yet decided" (Q12).
- **Stated wonder:** none.
- **Unstated assumptions:** seven (U1–U7 below).

---

## 1. Verdict table

| #   | V1 answer (paraphrased)                                                                                              | Verdict                                                     | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q4  | Two bands. Upper = pterodactyl, **jumping T-Rex**, flyers                                                           | **REFUTED as a geometric model. Survives only as a rule.** | In the original's geometry a **held jump flies above any flyer row** (apex hitbox y 3–50, against the high pterodactyl box at y 59–78). A **short hop sits inside it** for 22–24 of its 26–28 airborne frames. "Airborne = upper band" is therefore true for some jumps and false for others. Physics: `trex.ts:86-91,469,516-520`. Results: `sim.js`, `ptero.js`. See S1.                                                                                                                                                                                                                                                                                                                        |
| Q7  | 1 cactus : 2 rocks, "shuffled"; one cactus funds 2–3 rocks; losing comes only from skipped cacti or over-charging | **REFUTED as stated**                                       | With independent random draws at 1:2, the longest rock run in a 200-obstacle game averages **11.3**. The 99th percentile is 21 and the worst seen was 43 (`mc.js`). A meter that "starts full" cannot cover that unless "full" is enormous, so runs end in **unavoidable** deaths, which contradicts the stated loss conditions. See S2.                                                                                                                                                                                                                                                                                                                                  |
| Q2  | "No duck, just variable-height jump"                                                                                 | **CORRECTED**                                               | Variable height does not come free on touch. In the original, a release is **ignored until the T-Rex has risen 30 px** (`endJump` checks `reachedMinHeight`, `trex.ts:483-487`). That takes 3–4 frames (50–67 ms), so a quick tap produces a **full** jump (apex 91 px, 35 frames at speed 6), not a hop. Phone taps are commonly that short. _Inferred:_ on touch the control reads as random. Fast-drop is dropped too, which I am taking as your intent ("just"). → Q22                                                                                                                                                                                                    |
| Q7  | Charge drain "calculated in relationship with the probability of cacti"                                              | **CORRECTED: no fixed ratio exists**                        | Rocks reach the triceratops faster as speed rises. Per **frame** drained, the same meter covers **1.32–1.37× more** rocks at speed 13 than at 6. Per **pixel** scrolled, it covers **0.61–0.63×** (`gaps.js`; formula `obstacle.ts:204-209`). "One cactus = 2–3 rocks" only holds at one speed unless the cost is charged **per rock**. See S2. → Q17                                                                                                                                                                                                                                                                                                                       |
| Q3  | Flyers are the pterodactyl's threat; ground obstacles are ignored unless diving                                     | **CORRECTED: the pterodactyl idles at the start**            | The original spawns pterodactyls only at speed ≥ 8.5 (`offline_sprite_definitions.ts:178`). Speed rises 0.001 per frame from 6 (`offline.ts:62,889-891`), so that takes **41.7 s** on a ≥500 px canvas. Phone-width canvases start slower (`offline.ts:485-497`): **59–78 s** at 412–320 px. Copied as-is, the pterodactyl has nothing to do for its first minute. → Q15                                                                                                                                                                                                                                                                                                  |
| Q4  | Pterodactyl dive is variable-depth, mirroring the T-Rex jump                                                         | **CONFIRMED: the engine already supports it**               | The original T-Rex has a per-character `invertJump` flag (`trex.ts:27,76`, set from the sprite definition at `:262`). It is honoured in jump start, the min and max height checks and landing (`trex.ts:474,500,509-523`). It is left over from the removed alt-game characters. **A downward jump from a top baseline is already written.** The pterodactyl really can be "the T-Rex, inverted".                                                                                                                                                                                                                                                                                    |
| Q1  | Rocks shared. T-Rex jumps them, pterodactyl must not dive, triceratops charges                                      | **CONFIRMED (consistent)**                                  | The simulation found **no unavoidable pair at minimum gap**: cactus or rock then flyer, flyer then cactus, triple large cacti, at speeds 6, 9.5 and 13 (`seq2.js`). One untested caveat: the original's ±0.8 pterodactyl speed jitter can close a gap by about 1 px per frame (`obstacle.ts:130-133`). Re-test if flyers keep it.                                                                                                                                                                                                                                                                                                                                       |
| Q5  | Flyers don't affect the triceratops                                                                                  | **CONFIRMED (consistent)**                                  | It follows from the band rule. It also removes V1's S3 "unavoidable bird" hole.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Q6  | Meter starts full, to stop the triceratops being an unlosable endless dash                                          | **CONFIRMED in intent. The capacity is unstated.**          | Q16 decides whether the opening is fair. See S2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Q8  | A wasted charge is a fair death. The meter is shown in the upper band, for the triceratops only                      | **CONFIRMED (consistent)**                                  | One overlap: flyers still cross the upper band in a shared stream, behind the meter HUD. It is harmless, but visual clutter. → Q25                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Q9  | Ships on Google Play, web and iOS                                                                                    | **CONFIRMED as a goal. It narrows the stack.**              | Three targets rule out the Bounce Fidget loop library. `react-native-game-engine` has had no release since **1.2.0** (`npm view`: latest 1.2.0; the agent's registry check puts the publish date at 2020-06-09). It has no stated web support. See S3.                                                                                                                                                                                                                                                                                                                                                                                                             |
| Q10 | All dinos unlocked; high score in a "mixed" and a "split" category                                                   | **CONFIRMED as modelable. Where scores are stored is unstated.** | A local mixed board plus one per dino is trivial. Online, Play Games v2 allows 70 leaderboards (developer.android.com/games/pgs/leaderboards) and Game Center allows 100 per app (developer.apple.com/help/app-store-connect/configure-game-center/configure-leaderboards), so N+1 boards fit. **Neither works on web.** A board shared across platforms needs a third party. → Q21                                                                                                                                                                                                                                                                                            |
| Q11 | Night mode, score flash and clear-time deferred; bare minimum                                                        | **CONFIRMED**                                               | One correction to V1's table: `clearTime` delays the first **obstacle** (to about 4 s, counted after the first jump and the 0.4 s intro, `offline.ts:721,830`), not the speed ramp. Some first-obstacle grace period is still needed in any minimum build.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Q12 | Name "Dino-runner"; no "Chrome"/"Google"; original art                                                               | **CORRECTED: the name is crowded**                          | **Play:** two live listings are titled exactly "Dino Runner" (`com.kivyx.dinorunner`, `com.Digittrix.DinoRunner`). There are several near-misses, such as `com.diki.dinorunner` and `com.squad.a2048`. **iOS:** "Dino Runner - Endless Runner" exists (id6449506392; the fetch returned 404, so it may be delisted). **Apple naming:** Apple allows a name for "one app per localization". Guideline 4.1 bars "minor changes to another app's name", so a hyphen is unlikely to count as distinct. _Inferred._ Play does not require unique titles (support.google.com/googleplay/android-developer/answer/9898842).                                                                                    |

**Inherited and still unverified from V1** (no new evidence; confidence not raised):

- Dino Run 2's charging triceratops: still supported only by a search snippet, because the fandom page returned 402.
- No USPTO mark on "T-Rex Runner" / "Chrome Dino": still web search only.
- No precedent for a playable diving pterodactyl: the search was not exhaustive.

---

## 2. What changes the shape of the project

### S1. "Bands" must be a rule, not geometry. Variable height then needs a new job

Using the original's geometry, a **held** T-Rex jump clears a flyer at the old pterodactyl's top height. Its apex box is y 3–50 and the flyer's is y 59–78, so it passes **above** the "upper band". A **short hop** sits in that band for most of its airtime. With real hitboxes, "a jumping T-Rex collides with flyers" holds only for some jump heights. Where flyers sit becomes a fiddly tuning problem, and it shifts on every screen aspect ratio.

**What dies:** pixel-accurate collision between the player and flyers as the band mechanism.

**What replaces it (recommended):**

- Collision is decided by **band membership**: airborne T-Rex or diving pterodactyl means the other band, and you collide with whatever overlaps in x in your band.
- Draw continuous arcs for looks only.
- Variable height then stops mattering for clearance and becomes **airtime**:
  - a long hold clears wide groups (3 cacti or rocks at 735–1103 px at speed 13, `gaps.js`);
  - but it keeps you in the other band longer, exposed to its obstacles.

That is a real skill tension, and it applies identically to the pterodactyl's dive (`invertJump`). → Q13, Q14

### S2. The triceratops economy needs a bounded shuffle and a per-rock cost, or it isn't fair

Your stated loss conditions are skipping cacti or charging too long. They only hold if no sequence is unsurvivable with perfect play. Two things break that today:

1. **Unbounded rock runs.** Independent random draws at 1:2 give runs of 11+ rocks in a typical game.

   | Generator | Max rocks in a row | Rock share |
   | --- | --- | --- |
   | Independent random draws | unbounded (typical 11, 99th percentile 21) | 0.667 |
   | Original repeat cap of 2 (`horizon.ts:299-305`, `offline.ts:53`) | 2 | **0.556** (also forces a rock after two cacti, so 1:2 becomes about 4:5) |
   | **Bag shuffle [C,R,R]** | **4** (bag C,R,R then R,R,C) | 0.667 |

   _Recommendation:_ bag shuffle, with **meter capacity ≥ 4 rocks' cost**. Every run is then survivable from any meter level the player could fairly have reached.

2. **Time-based drain changes what a cactus is worth with speed** (1.32–1.37× from speed 6 to 13). Pixel-based drain does too, in the other direction (0.61–0.63×).

   _Recommendation:_ **charge mostly per rock broken** (a fixed cost), so "1 cactus = 2–3 rocks" is exactly true at every speed. Add a **small per-frame drain while held** so over-charging still costs you, as you want.

   Ground truth for tuning: a 17-px rock passes in about 10 frames at speed 6 and 5 at speed 13 (`gaps.js`, using the T-Rex's 44-px width; the triceratops width is undefined). → Q16, Q17

### S3. Three platforms plus a Mac you already have: the cheapest stack is not Expo this time

- **What dies:** reusing Bounce Fidget's loop. `react-native-game-engine` is unmaintained (latest 1.2.0), its web support is undocumented, and it renders through React every frame. Bounce Fidget also has no sprites, scrolling, entity collision or score (V1 A3).
- **The two live options:**
  - **(a) TypeScript + plain canvas (or Kaplay / Phaser 4) wrapped in Capacitor 8.**
    - The **most direct port** of the Chromium code, which is BSD-3 Canvas-2D TypeScript (`offline.ts:1-3`). You would stub its `chrome://` imports.
    - Web payload is about 70–350 KB gzip (Kaplay 3001.0.19 / Phaser 4.2.1, measured from CDN builds).
    - Needs a Mac and Xcode for iOS, which **you have (Xcode 26.2)**.
  - **(b) Expo + `@shopify/react-native-skia` 2.13.1, with a Reanimated `useFrameCallback` loop.**
    - Keeps your toolchain and EAS cloud builds.
    - Costs a **~2.9 MB gzip CanvasKit wasm** download on web (shopify.github.io/react-native-skia/docs/getting-started/web) and a rewrite of the drawing code.
  - Godot 4.7 (web 2.7–8.7 MB, new language) is not worth it at this scope.
- _Recommendation: (a)._ It is the one option where the web build is the native target and the reference code ports nearly line for line. → Q19

---

## 3. Corrections and confirmations, claim by claim

**Q1 / Q3 / Q5: the shared stream.** The single-obstacle-at-a-time generator naturally keeps ground obstacles and flyers apart in x. Gaps are `round(width·speed + typeMinGap·0.6)` up to ×1.5 (`obstacle.ts:204-209`), and only the first obstacle is collision-checked (`offline.ts:849-852`). That is why no unavoidable pair turned up. **Keep one stream**; don't run two independent streams per band, or this guarantee is lost.

**Each dinosaur has one active and one passive obstacle class.**

| Dinosaur | Must act on | Ignores |
| --- | --- | --- |
| T-Rex | cacti, rocks | flyers |
| Pterodactyl | flyers | cacti, rocks |
| Triceratops | rocks (cacti feed it) | flyers |

It is elegant: one input across all three, and the same stream. **But it makes difficulty depend on the stream mix.** With 1C:2R plus few flyers, the T-Rex acts on almost everything and the pterodactyl on almost nothing. → Q15, Q20

**Q2: T-Rex jump.** Original numbers at speed 6:

| Jump | Apex | Airtime | Ground covered |
| --- | --- | --- | --- |
| Shortest hop (release on frame 3–4) | 62 px | 28 frames | 168 px |
| Full | 91 px | 35 frames | 210 px |

At speed 13: 55/90 px apex and 26/34 frames (`sim.js`). Every single and grouped cactus is clearable by a hold at all speeds, and by a short hop except triple-large at speed 6, which cannot spawn below speed 7 (`clear.js`). The **tap problem** is in the table above. _Fix (opinion):_ latch a release that arrives too early and apply it once the minimum height is reached.

**Q6–Q8: meter.** See S2. Starting full is right; capacity is the open number.

**Frame-rate trap (an addition the original hides):** the original adds 0.001 speed **per animation frame** (`offline.ts:1294-1298`). On a 120 Hz phone the game ramps twice as fast in wall-clock time. All physics must be scaled to delta-time. Bounce Fidget already has a tested helper for exactly this: `game/physics.ts` `frameScale`, which scales motion to frame time, with 381 lines of tests.

---

## 4. Additions — what the answers never mentioned but must handle

- **U1. Flyers' share of the stream.** The 1:2 ratio covers ground obstacles only. Flyers are the pterodactyl's _only_ threat, so their share sets its difficulty. A bag like [C,R,R,F] gives the pterodactyl one action per four obstacles and the T-Rex three. → Q15
- **U2. The flyer start delay** (41.7–78 s, see the verdict table) must drop to zero, or close to it. → Q15
- **U3. Mixed-board fairness.** With the stream fixed, the three dinosaurs face very different action densities, so a mixed board will be won by whichever is easiest. Options: accept it, tune per-dino speed or density, or normalise scores. → Q20
- **U4. Score storage.** "Bare minimum" (Q11) plus three platforms points to **local-only** scores (localStorage / Capacitor Preferences). Native boards need Play Games v2 and Game Center configured separately, and still don't cover web. → Q21
- **U5. Store prerequisites you may not have.**
  - **Apple Developer Program at $99/yr** (developer.apple.com/programs/enroll). A team ID in Bingepick does not prove membership, because free personal teams also get one.
  - **Play closed test with 12 testers for 14 days** if your Play account is personal and was created after 2023-11-13. This is the longest wall-clock item on the path. Nothing in Bounce Fidget's docs records a closed test (`STATUS.md` has no match). → Q23
- **U6. Apple 4.3(b) spam risk.** It rejects apps "indistinguishable from what's already widely available", and dino runners are a crowded genre. **The three-dino mechanics are the differentiation**, so don't cut them from the MVP to save time. _Inferred:_ a T-Rex-only first release is the riskiest submission.
- **U7. Charging (Q7 wording).** "Hold means it charges **instead of moving forward**" can be read two ways: the world slows or stops while charging, or the charge state simply replaces the run state. These are different games. → Q18

---

## 5. Dark areas

| Question | What was searched | Why it came back empty | What would settle it |
| --- | --- | --- | --- |
| Is "Dino Runner" free on the iOS App Store? | Search index, apps.apple.com fetches | One exact-title listing returned 404 (delisted, or region-locked?). Apple publishes no name-lookup API. | Create the app record in App Store Connect. That both tests and reserves the name. |
| Does a hyphen ("Dino-runner") count as a distinct name to Apple? | Apple help pages and guidelines | Not documented. Guideline 4.1's "minor changes" clause suggests not. | The same App Store Connect attempt |
| Does Play Games Services work for a web build? | Google docs | The deprecation wording for web games appears only in search snippets; the page now redirects | Irrelevant if Q21 = local-only |
| Does a quick tap on a real phone fall under 50–67 ms? | No device data | It's a human-factors measurement | Log touch durations in the first greybox build |
| What is the triceratops's hitbox width? | n/a | Not designed yet; the art is undecided (Q12) | The art decision. Until then the tuning tables use 44 px. |
| Is the triceratops fun with the S2 economy? | Not researchable | It's feel | A greybox playtest (still open from V1) |

---

## 6. Decisions that are not mine → **Ivan (author)**

- **D5. Band mechanism (Q13).**
  - **Rule-based bands:** robust on every aspect ratio, and makes airtime the skill.
  - **Pixel geometry:** closer to the original, but flyer altitude must be tuned per screen.
  - _Recommend rule-based._
- **D6. Shuffle and meter (Q16, Q17).**
  - **Bag + per-rock cost:** provably fair; tune by counting.
  - **Random + time drain:** more variance, unavoidable deaths, and the economy drifts with speed.
  - _Recommend bag + per-rock + small hold drain._
- **D7. Stack (Q19).**
  - **Capacitor + TS canvas:** direct port, small web build, uses your Mac.
  - **Expo + Skia:** same toolchain, 2.9 MB web download, a rewrite.
  - _Recommend Capacitor._
- **D8. Leaderboard scope (Q21).**
  - **Local:** zero backend.
  - **Native per store:** two integrations, no web.
  - **Third-party shared:** one board everywhere, plus a vendor dependency (UGS is "free for a limited time"; LootLocker's trial is 30 days).
  - _Recommend local for the MVP_, consistent with Q11.
- **D9. Store name (Q24).** Keep "Dino-runner" as the repo name, and pick a distinct store title, or use "Dino Runner: <subtitle>" within 30 characters.

---

## 7. Tradeoffs

- **Per-rock cost vs pure time drain.**
  - Per-rock buys exact, speed-independent economics. It costs the "charge as long as there's juice" fantasy, softened by the small hold drain.
  - Pure time drain is the reverse.
- **Flyer density.**
  - More flyers make the pterodactyl busier, and also the T-Rex's skies more crowded during long jumps (S1).
  - Fewer flyers make the pterodactyl trivially easy.
  - A per-dino density breaks "one shared stream", which is what guarantees no unavoidable pair (§3).
- **Original tap feel vs latched release.**
  - The original's ignore-early-release keeps faithful arcs but makes quick taps random on touch.
  - Latching gives a dependable short hop, but deviates from Chrome.
- _Moved — not a real tradeoff:_ **Godot.** It loses on web size, language and porting effort at this scope (§S3).

---

## 8. Questions for the next dump

Numbering continues from V1 (#1–#12 answered). Ordered by how much each answer unblocks.

13. **Bands as rules:** should collision be decided by band (airborne or diving = other band; collide with anything overlapping in x there), rather than pixel hitboxes? (S1, D5)
14. **Variable height under band rules:** confirm its job is **airtime**. A long hold clears wide groups but keeps you longer in the other band. Is the same true for the pterodactyl's variable dive? (S1)
15. **Stream mix:** what share are flyers vs cacti vs rocks (e.g. bag [C,R,R,F])? Should flyers appear from the very start, rather than after ~42–78 s as in the original? (U1, U2)
16. **Shuffle and capacity:** bag shuffle (max 4 rocks in a row) instead of independent random draws? Is "full" meter at least 4 rocks' worth? (S2, D6)
17. **Cost basis:** charge per rock broken plus a small drain while held, or pure drain over time? (S2, D6)
18. **"Charges instead of moving forward":** does the world slow or stop while charging, or does the charge state just replace running? (U7)
19. **Stack:** TS canvas + Capacitor (port the Chromium code, use your Mac), or Expo + Skia (keep the toolchain)? (S3, D7)
20. **Mixed board fairness:** accept that dinos differ in difficulty, or tune per-dino speed or density? (U3)
21. **Scores:** local-only for this iteration? If online, is one board shared across platforms or native boards per store? (U4, D8)
22. **Tap behaviour:** should a quick tap give the **shortest** hop (latched release) instead of the original's full jump? Is fast-drop confirmed dropped? (Q2 verdict)
23. **Accounts:** is your Apple Developer Program membership active and paid? Is your Play developer account personal and created after 2023-11-13 (12-tester, 14-day closed test)? (U5)
24. **Store title:** is "Dino-runner" the store title or the working name? Would you use a subtitle or a distinct name given the collisions? (D9)
25. **Meter HUD:** should flyers be hidden in the triceratops's run, so its upper-band meter doesn't overlap them? (Q8 verdict)
26. **Art:** what did you mean by "won't be led screen art"? LED/LCD-style monochrome pixels like Chrome's, or something else? (Q12)
