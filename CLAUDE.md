# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This directory holds two unrelated, independent projects — there is no shared build system or code between them:

- `Zelda 2/` — a MakeCode Arcade action game ("Zelda"-style) written in TypeScript against the PXT/MakeCode Arcade API.
- `png-to-makecode/` — a standalone vanilla-JS/HTML/CSS web tool (no build step, no dependencies) that converts PNG images into MakeCode Arcade asset code, used to help hand-author art for `Zelda 2` (or any other MakeCode Arcade project).

When asked to work "on the game," that means `Zelda 2/`; "the converter"/"asset tool" means `png-to-makecode/`.

## `Zelda 2/` — MakeCode Arcade game

### Development workflow

There is no local build/lint/test tooling available in this environment (no `mkc`/`pxt` CLI installed, no `package.json`). This is a MakeCode Arcade project (`pxt.json`, `mkc.json`, `supportedTargets: ["arcade"]`), normally developed by importing/exporting this folder in the web editor at https://arcade.makecode.com/, or locally via the `mkc` CLI if it's installed. CI (`.github/workflows/makecode.yml`) builds on every push via `npx makecode`. `pxt_modules/` (vendored MakeCode dependencies) and `built/binary.js` are generated build artifacts, gitignored — never hand-edit them.

There's no automated test suite; verify behavior by reading the TypeScript logic and, where possible, importing the project into the MakeCode Arcade web editor to run it in the simulator.

Formatting follows `.prettierrc`: `arrowParens: avoid`, `semi: false`, `tabWidth: 4`. Match this in `.ts` files.

### File load order and architecture

`pxt.json`'s `files` array is the authoritative compile order, and matches the numbered `//#region` headers (1–9) at the top of each file. Everything is global/top-level — no modules, no classes — so functions and `let`/`const` state declared in one file are used directly by later files, per the MakeCode Arcade "single program" model:

1. `images.g.jres` / `images.g.ts` — generated image/animation assets (`assets.image\`...\``, `assets.animation\`...\``). Header says "Auto-generated code. Do not edit." — regenerate via the MakeCode asset editor or `png-to-makecode`, don't hand-edit.
2. `tilemap.g.jres` / `tilemap.g.ts` — generated tilesets/tilemaps (`tilemap\`...\``, `assets.tile\`...\``). Same: generated, don't hand-edit directly.
3. `spriteKinds.ts` — screen size (`userconfig.ARCADE_SCREEN_WIDTH/HEIGHT`) and custom `SpriteKind`s (`épée`, `aide`, `likelikeKind`, `BossGerudo`, `BossZora`, `BossPiaf`).
4. `joueur.ts` — player (`link`) sprite setup, health bar, and shared top-level game state (`score`, `coup`, `nombre_de_monstre`, `dialogue`, etc.) declared as module-scope `let`/`const` — later files read and mutate these directly.
5. `combat.ts` — FPS tracking, sword-swing (`coup_épée`, `epeeForever`) and damage/health functions (`change_vie`, `change_vie_likelike`, `change_vie_boss`).
6. `monstres.ts` — enemy spawning/behavior and chest interaction (`coffre`, `creer_Monstre`, `si_tuile_cree_monstre`, `miasme`, `fps`, `creer_likelike`).
7. `gerudo_boss.ts`, `zora_boss.ts`, `piaf_boss.ts` — one boss fight each (`gerudoBoss()`, etc.); each is self-contained, creating its sprite, a health bar destroyed `onDestroyed`, and a `game.onUpdateInterval` distance-driven AI loop.
8. `outils.ts` — small map-size/tile-distance math helpers (`NbC`, `NbL`, `obtenirDistanceTuileLaPlusProche`).
9. `controles.ts` — global input/collision wiring (`controller.B.onEvent`, `sprites.onOverlap` for player vs. enemy/projectile/likelike/each boss kind).
10. `main.ts` — entry point: sets the initial tilemap, spawns intro sprites, drives the scripted opening (dialogue, triggering `gerudoBoss()`, a walk-to-x gate), then starts the game's two main `game.onUpdate` loops.

Comments and identifiers are in French (`dégats`, `vie`, `épée`, etc.) — keep new code consistent with that.

### Conventions specific to this game

- New sprite kinds beyond the MakeCode built-ins (`Player`, `Enemy`, `Projectile`) belong in `spriteKinds.ts`.
- Per-sprite data (health, damage) is stored via `sprites.setDataNumber`/`readDataNumber`/`changeDataNumberBy` using the string keys `"vie"` and `"dégats"` — reuse these keys rather than inventing new per-sprite fields.
- New bosses should follow the shape established in `gerudo_boss.ts`: a `Sprite`, a `StatusBarKind.Health` bar torn down `onDestroyed`, and an `onUpdateInterval` state machine driven by distance to `link`.
- `assets.image\`...\``/`assets.tile\`...\``/`assets.animation\`...\`` references (e.g. `myImage15`, `myAnim4`, `myTile16`) are opaque generated names from `images.g.ts`/`tilemap.g.ts` — look up what they render as there rather than guessing from the name.

## `png-to-makecode/` — PNG-to-MakeCode asset converter

Single-page vanilla HTML/CSS/JS (`index.html`, `script.js`, `palette.js`, `style.css`), no build step, no dependencies — open `index.html` directly in a browser to work on or test it.

- `palette.js` defines `MAKECODE_PALETTE`, the fixed 16-color MakeCode Arcade palette (index 0 always transparent), mapping each palette hex digit (`.`, `1`–`9`, `a`–`f`) to an RGB triple.
- `script.js` has two modes (`mode`: `"img" | "tilemap"`):
  - **Image mode** — quantizes a dropped PNG to the MakeCode palette and emits an `img\`...\`` literal (as a `case` block for `images.g.ts`, a bare `const`, or raw), with optional resizing and an alpha transparency threshold.
  - **Tilemap mode** — quantizes and packs pixels into MakeCode's binary tile format, then either *"Nouvelle tuile"* (appends one new tile to a dropped `tilemap.g.jres`/`tilemap.g.ts` pair) or *"Carte complète"* (slices a whole image into tiles, dedupes against the existing tileset, and emits one or more `tiles.createTilemap(...)` blocks — splitting into multiple tilemaps when a region would exceed the configurable max-distinct-tiles-per-map, since MakeCode caps a tileset at 255 tiles).
- Output is meant to be pasted directly into a MakeCode Arcade project's generated asset files (e.g. `Zelda 2/images.g.ts`, `tilemap.g.jres`/`tilemap.g.ts`). It edits/inserts using the exact `//% fixedInstance jres blockIdentity=images._tile` / `TileScale.*` code shapes MakeCode itself generates, so its output can be appended to real project files without a full re-export from the web editor.
- All UI strings are French — keep new strings consistent with the existing tone.
