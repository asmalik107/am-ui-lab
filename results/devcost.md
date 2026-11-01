# Developer cost

Counted 2026-11-01 with `scripts/devcost.mjs`.

| App | Lines of screen code you write | Library code copied into your app (lines) | Config files added or changed | Setup steps | Setup problems hit | Type errors in your own code | Type errors in copied library code | Accessibility props written by hand |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | 912 | 0 | 0 | n/a (reference app) | n/a (reference app) | 0 | 0 | 75 |
| unistyles | 1050 | 0 | 2 | 8 | 2 | 0 | 0 | 75 |
| uniwind | 888 | 0 | 3 | 11 | 0 | 0 | 0 | 75 |
| nativewind | 877 | 0 | 6 | 14 | 0 | 0 | 0 | 75 |
| tamagui | 833 | 0 | 5 | 11 | 6 | 0 | 0 | 12 |
| gluestack | 812 | 7488 | 8 | 5 | 8 | 0 | 17 | 11 |
| heroui | 671 | 0 | 3 | 10 | 4 | 0 | 0 | 20 |
| reusables | 705 | 1519 | 4 | 12 | 6 | 0 | 0 | 21 |

- **screenLines:** Non-blank lines of TypeScript in the app's own src/ folder: the test screen, any components built by hand and the theme setup. Code a library's CLI copied in isn't counted here.
- **copiedLines:** Non-blank lines a library's CLI copied into the app (gluestack's components/ui, Reusables' src/components/ui). This code is now yours to maintain and fix. The other libraries ship as npm packages, so they show 0.
- **configFiles:** Files at the app root, and .css or .d.ts files in src/, that are new or differ from the baseline app's (Babel, Metro, Tailwind, theme and type files). package.json, the lockfile and app.json are left out, because every app changes them.
- **setupSteps:** How many numbered steps the setup section of the app's NOTES.md lists. A rough guide only: each app's notes split steps differently. The iOS 27 step, the same in every app, is left out.
- **errorsHit:** How many problems came up while setting the app up and had to be worked around (a CLI that hung or overwrote files, docs that disagree with the code, wrong package versions), as listed in the app's NOTES.md. A count, not a measure of effort: one took two minutes, another twenty.
- **tscOwn:** TypeScript errors that npx tsc --noEmit reports in the app's own files.
- **tscKit:** TypeScript errors that npx tsc --noEmit reports in the files a library's CLI copied in. The app still builds and runs, because Metro doesn't type-check, but the project's type-check fails until someone fixes code they didn't write.
- **a11yProps:** role, aria-*, accessibility* and importantForAccessibility props in the app's own code. Higher means more accessibility written by hand; the component libraries supply some of it themselves.

- baseline config files: none
- unistyles config files: babel.config.js, index.ts
- uniwind config files: metro.config.js, src/css.d.ts, src/global.css
- nativewind config files: metro.config.js, nativewind-env.d.ts, postcss.config.mjs, tsconfig.json, src/css.d.ts, src/global.css
- tamagui config files: .gitignore, index.js, metro.config.js, tamagui.build.ts, tamagui.config.ts
- gluestack config files: .npmrc, babel.config.js, css.d.ts, global.css, index.js, metro.config.js, theme.generated.css, tsconfig.json
- heroui config files: metro.config.js, src/css.d.ts, src/global.css
- reusables config files: components.json, metro.config.js, src/expo-types.d.ts, src/global.css
