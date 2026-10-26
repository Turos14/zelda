# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This repository holds two unrelated, independent projects — there is no shared build system or code between them:

- The repository root — a MakeCode Arcade action game ("Zelda"-style) written in TypeScript against the PXT/MakeCode Arcade API (`pxt.json`, generated assets and `main.ts` at the root, hand-written game logic under `ts/`). It originally lived under a `Zelda 2/` subfolder; what remains there is leftover build output, not source.
- `png-to-makecode/` — a standalone vanilla-JS/HTML/CSS web tool (no build step, no dependencies) that converts PNG images into MakeCode Arcade asset code, used to help hand-author art for the game (or any other MakeCode Arcade project).

When asked to work "on the game," that means `pxt.json`, the root `.g.*`/`main.ts` files and `ts/*.ts`; "the converter"/"asset tool" means `png-to-makecode/`.

## MakeCode Arcade game (repository root)

### Development workflow

This is a MakeCode Arcade project (`pxt.json`, `mkc.json`, `supportedTargets: ["arcade"]`), normally developed by importing/exporting in the web editor at https://arcade.makecode.com/, or locally via CLI. CI (`.github/workflows/makecode.yml`) builds on every push via `npx makecode` (the lightweight `makecode`/`mkc` npm package, which compiles against a cached virtual filesystem and never writes a physical `pxt_modules/` to disk). `pxt_modules/` and `built/binary.js` are generated build artifacts, gitignored — never hand-edit them.

**TypeScript IntelliSense in VS Code / Codespaces:** plain TS IntelliSense only resolves MakeCode globals (`Sprite`, `sprites`, `game`, `tiles`, ...) if `pxt_modules/` physically exists on disk with real `.ts`/`.d.ts` files — `mkc`/`makecode` alone does not produce this, so a fresh clone shows "cannot find name" errors on every MakeCode API. `.devcontainer/devcontainer.json` fixes this by installing the classic `pxt` CLI (separate npm package from `makecode`) and running `pxt target arcade && pxt install` on container creation, which materializes a real `pxt_modules/`. If types are still unresolved (e.g. right after moving files, or on an already-running Codespace), rerun `npx pxt install` from the repo root and restart the TS server (Command Palette → "TypeScript: Restart TS Server"). The `ms-edu.pxt-vscode-web` extension (also recommended) offers an alternative MakeCode-aware editing/simulator experience that doesn't depend on `pxt_modules` at all.

Build/compile-check commands (run from the repo root):

- `npx makecode build -j` — compiles to JavaScript for the simulator (`built/binary.js`). This is the reliable type-check: use it after any `.ts` change.
- `npx makecode` (what CI runs) — native build, defaulting to the `n3` hardware variant. It currently fails with `program too big by ~95000 bytes` (large tilemaps/images exceed that variant's flash), on `HEAD` as well, so a red CI run is not by itself a sign your change broke something — check with `-j`.

There's no automated test suite; verify behavior by reading the TypeScript logic and, where possible, importing the project into the MakeCode Arcade web editor to run it in the simulator.

Formatting follows `.prettierrc`: `arrowParens: avoid`, `semi: false`, `tabWidth: 4`. Match this in `.ts` files.

### File load order and architecture

`pxt.json`'s `files` array is the authoritative compile order and list of paths, and the files' `//#region --- N. ... ---` headers roughly follow it (their numbers don't match the list below one-to-one — trust `pxt.json`). When adding, splitting, renaming or moving a `.ts`/`.jres` file, update its path in `pxt.json`'s `files` — a listed path that doesn't exist makes the build fail with `ENOENT`, an unlisted file is silently not compiled. Everything is global/top-level — no modules, no classes — so functions and `let`/`const` state declared in one file are used directly by later files, per the MakeCode Arcade "single program" model:

1. `images.g.jres` / `images.g.ts` — generated image/animation assets (`assets.image\`...\``, `assets.animation\`...\``). Header says "Auto-generated code. Do not edit." — regenerate via the MakeCode asset editor or `png-to-makecode`, don't hand-edit.
2. `tilemap.g.jres` / `tilemap.g.ts` — generated tilesets/tilemaps (`tilemap\`...\``, `assets.tile\`...\``). Same: generated, don't hand-edit directly.
3. `ts/spriteKinds.ts` — screen size (`userconfig.ARCADE_SCREEN_WIDTH/HEIGHT`) and custom `SpriteKind`s (`épée`, `aide`, `likelikeKind`, `BossGerudo`, `BossZora`, `BossPiaf`).
4. `ts/link.ts` — player (`link`) sprite setup (data `"vie"`/`"dégats"`, walk animation, `verifier_mort_link`) and the HUD status bars (`barreVieJoueur`, `barreEnduJoueur`, `barreFoodJoueur`, `argent`).
5. `ts/argent.ts` — rupee counter (`rubis`) and chest interaction (`coffre`: a chest tile `myTile16` gives either health/food or rupees).
6. `ts/joueur.ts` — shared top-level game state (`score`, `coup`, `nombre_de_monstre`, `dialogue`, enemy health-bar arrays, etc.) declared as module-scope `let`/`const` — other files read and mutate these directly.
7. `ts/combat.ts` — sword-swing (`coup_épée`, `epeeForever`) and damage/health functions (`change_vie`, `change_vie_likelike`, `change_vie_boss`).
8. `ts/monstres.ts` — enemy spawning/behavior (`creer_Monstre`, `si_tuile_cree_monstre`, `fps`, `creer_likelike`).
9. `ts/gerudo_boss.ts`, `ts/zora_boss.ts`, `ts/piaf_boss.ts` — one boss fight each (`gerudoBoss()`, etc.); each is self-contained, creating its sprite, a health bar destroyed `onDestroyed`, and a `game.onUpdateInterval` distance-driven AI loop.
10. `ts/outils.ts` — small map-size/tile-distance math helpers (`NbC`, `NbL`, `obtenirDistanceTuileLaPlusProche`).
11. `ts/controles.ts` — global input/collision wiring (`controller.B.onEvent`, `sprites.onOverlap` for player vs. enemy/projectile/likelike/each boss kind).
12. `ts/prepare_main.ts` — game start, executed as top-level code: stamina state (`enduV`, `enduR`), initial tilemap, intro sprites, the scripted opening (dialogue, triggering `gerudoBoss()`, a walk-to-x gate).
13. `ts/forever.ts` — the recurring loops: stamina (`enduF`), `miasme`, `nouriture`, `tile_center`, plus the main `game.onUpdateInterval(500, …)` / `game.onUpdate` loops (which call `coffre`).
14. `main.ts` — kept as the last entry of `files` but currently empty; game logic belongs in `ts/`.

Top-level statements run in `files` order, but function bodies only run when called — so a function may reference globals from a later file (e.g. `coffre` in `argent.ts` uses `dialogue` from `joueur.ts`), whereas top-level code may not. Code in `prepare_main.ts` that blocks (`game.showLongText`, `pause`, waiting loops) delays registration of the loops in `forever.ts`.

Comments and identifiers are in French (`dégats`, `vie`, `épée`, etc.) — keep new code consistent with that.

### Conventions specific to this game

- New sprite kinds beyond the MakeCode built-ins (`Player`, `Enemy`, `Projectile`) belong in `spriteKinds.ts`.
- Per-sprite data (health, damage) is stored via `sprites.setDataNumber`/`readDataNumber`/`changeDataNumberBy` using the string keys `"vie"` and `"dégats"` — reuse these keys rather than inventing new per-sprite fields.
- New bosses should follow the shape established in `gerudo_boss.ts`: a `Sprite`, a `StatusBarKind.Health` bar torn down `onDestroyed`, and an `onUpdateInterval` state machine driven by distance to `link`.
- `assets.image\`...\``/`assets.tile\`...\``/`assets.animation\`...\`` references (e.g. `myImage15`, `myAnim4`, `myTile16`) are opaque generated names from `images.g.ts`/`tilemap.g.ts` — look up what they render as there rather than guessing from the name.

## `png-to-makecode/` — PNG-to-MakeCode asset converter

Single-page vanilla HTML/CSS/JS (`index.html`, `script.js`, `palette.js`, `style.css`), no build step, no dependencies — open `index.html` directly in a browser to work on or test it. In Codespaces, use the `ms-vscode.live-server` extension (recommended via the devcontainer) to preview it through the forwarded port instead.

- `palette.js` defines `MAKECODE_PALETTE`, the fixed 16-color MakeCode Arcade palette (index 0 always transparent), mapping each palette hex digit (`.`, `1`–`9`, `a`–`f`) to an RGB triple.
- `script.js` has two modes (`mode`: `"img" | "tilemap"`):
  - **Image mode** — quantizes a dropped PNG to the MakeCode palette and emits an `img\`...\`` literal (as a `case` block for `images.g.ts`, a bare `const`, or raw), with optional resizing and an alpha transparency threshold.
  - **Tilemap mode** — quantizes and packs pixels into MakeCode's binary tile format, then either *"Nouvelle tuile"* (appends one new tile to a dropped `tilemap.g.jres`/`tilemap.g.ts` pair) or *"Carte complète"* (slices a whole image into tiles, dedupes against the existing tileset, and emits one or more `tiles.createTilemap(...)` blocks — splitting into multiple tilemaps when a region would exceed the configurable max-distinct-tiles-per-map, since MakeCode caps a tileset at 255 tiles).
- Output is meant to be pasted directly into the MakeCode Arcade game's generated asset files at the repo root (`images.g.ts`, `tilemap.g.jres`/`tilemap.g.ts`), or any other MakeCode Arcade project's. It edits/inserts using the exact `//% fixedInstance jres blockIdentity=images._tile` / `TileScale.*` code shapes MakeCode itself generates, so its output can be appended to real project files without a full re-export from the web editor.
- All UI strings are French — keep new strings consistent with the existing tone.
