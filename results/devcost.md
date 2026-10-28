# Developer cost

Counted 2026-10-28 with `scripts/devcost.mjs`.

| App | Own source lines | Copied kit lines | Config files | Setup steps | Errors hit | tsc errors (src/ / all) | Hand-written a11y props |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 840 | 0 | 0 | no NOTES | no NOTES | 0 / 0 | 75 |
| unistyles | 957 | 0 | 2 | 8 | 2 | 0 / 0 | 75 |
| uniwind | 814 | 0 | 3 | 11 | 0 | 0 / 0 | 75 |
| nativewind | 819 | 0 | 6 | 14 | 0 | 0 / 0 | 75 |
| tamagui | 812 | 0 | 5 | 11 | 6 | 0 / 0 | 12 |
| gluestack | 770 | 7488 | 8 | 5 | 8 | 0 / 18 | 11 |
| heroui | 641 | 0 | 3 | 10 | 4 | 0 / 0 | 20 |
| reusables | 654 | 1519 | 4 | 12 | 6 | 0 / 0 | 21 |

- **screenLines:** Non-blank lines in the app's own src/ .ts/.tsx files (kit components copied by a CLI excluded)
- **copiedLines:** Non-blank lines the kit's CLI copied into the app (gluestack components/ui, Reusables src/components/ui)
- **configFiles:** Files at the app root, plus .css and .d.ts files in src/, that are new or differ from the baseline's (package.json, lockfile, app.json and generated uniwind-types.d.ts left out)
- **setupSteps:** Numbered steps under the setup heading of NOTES.md (as written; each app's notes break steps up differently; the iOS 27 section, identical in every app, left out)
- **errorsHit:** Numbered entries under the errors heading of NOTES.md
- **tsc:** `npx tsc --noEmit` errors: all, and those in src/ outside copied kit code
- **a11yProps:** role=, aria-*=, accessibility*= and importantForAccessibility= props in the app's own src/ (kit components excluded)

- baseline config files: none
- unistyles config files: babel.config.js, index.ts
- uniwind config files: metro.config.js, src/css.d.ts, src/global.css
- nativewind config files: metro.config.js, nativewind-env.d.ts, postcss.config.mjs, tsconfig.json, src/css.d.ts, src/global.css
- tamagui config files: .gitignore, index.js, metro.config.js, tamagui.build.ts, tamagui.config.ts
- gluestack config files: .npmrc, babel.config.js, css.d.ts, global.css, index.js, metro.config.js, theme.generated.css, tsconfig.json
- heroui config files: metro.config.js, src/css.d.ts, src/global.css
- reusables config files: components.json, metro.config.js, src/expo-types.d.ts, src/global.css
