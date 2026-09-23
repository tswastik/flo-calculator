# Project Understanding — Flo Calculator

A menstrual cycle tracker built with Expo (React Native + React Native Web) — one codebase that already runs on web and, via EAS Build, as a standalone Android APK. iOS works today through Expo Go and can become a standalone build once an Apple Developer account is added.

Visual language is modeled on [Flo's period calculator](https://flo.health/tools/period-calculator) — reference screenshots live in `docs/reference/`.

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Expo SDK 57 (React Native 0.86, React 19) | One codebase → web now, iOS/Android later, no rewrite |
| Navigation | Expo Router (file-based, `src/app/`) via `expo-router/ui`'s `Tabs`/`TabList`/`TabTrigger`/`TabSlot` | Same JS-based tab bar renders identically on web and native — deliberately *not* `expo-router/unstable-native-tabs`, which is native-only |
| Diagrams | `react-native-svg` | Cycle-phase donut renders identically cross-platform |
| Persistence | `@react-native-async-storage/async-storage` | Per-profile local storage, no backend |
| Styling | Hand-rolled `StyleSheet` + theme tokens (no NativeWind/Tamagui) | Kept from the default `create-expo-app` template |
| Buttons | `expo-linear-gradient` | Pink pill buttons matching the reference design |
| Icons | `expo-symbols` (`SymbolView`) | One icon name per platform (SF Symbol / Material Symbol), consistent look on web, iOS, Android |
| Build/distribute | EAS Build (`eas.json`, `preview` profile → installable APK) | No local Android Studio/Xcode required |

## Project structure

```
src/
  app/                     — Expo Router routes; every file here is a screen
    _layout.tsx             — root layout: theme provider, user-profile gate, tab navigator
    index.tsx                — Calculator screen (route "/")
    history.tsx               — History screen (route "/history")
    faq.tsx                    — FAQ screen (route "/faq")
    profile.tsx                 — Profile management screen (route "/profile")
  components/              — reusable UI, no routing logic
  hooks/                    — cross-cutting React state (theme, active user)
  lib/                       — pure logic + persistence, no React/UI imports
  constants/                  — design tokens (colors, spacing, fonts)
docs/reference/              — original design screenshots used as the visual spec
assets/images/                 — app icon, adaptive icon layers, favicon, splash image
eas.json, app.json               — build/app configuration (see "Build & distribution")
```

## Routing & app shell

**`src/app/_layout.tsx`** is the root gate. It wraps everything in `ThemeProvider` (light/dark), then `UserProvider` (see Hooks below), then a small `RootGate` component that decides what to render *before* the tab navigator ever mounts:

- still loading profiles → blank themed view
- no active profile → `UserOnboarding` (name-only sign-up screen)
- active profile exists → `AppTabs` (the real app)

This means every screen under `app/` can assume `useUser().activeUser` is non-null — there's no need to re-check for a signed-in user on every screen.

**`src/components/app-tabs.tsx`** renders the bottom tab bar (Calculator / History / FAQ / Profile) using `expo-router/ui`'s cross-platform `Tabs` primitives, styled as a floating pill matching the reference design, pinned to the bottom of the screen on every platform.

## Screens (`src/app/`)

- **`index.tsx` (Calculator)** — the main screen. Holds local form state (last period start date, period length, cycle length), loads that user's saved defaults + history average on mount (or whenever the active user changes), and on "See results" computes a `CalculatorResult` via `calculateCycle()`. Renders two `ResultCard`s (ovulation date, next period range — sized to share one font size so neither wraps/truncates) and the `CyclePhaseDiagram`. "Save this cycle" writes a `CycleEntry` to that user's history.
- **`history.tsx`** — loads the active user's saved cycles on every tab focus (`useFocusEffect`), annotates each entry via `annotateHistoryRegularity()`, and lists them newest-first with a Regular/Irregular badge and a delete button. Shows an auto-computed average-cycle-length banner once 2+ entries exist.
- **`faq.tsx`** — static accordion of Q&A content from `lib/faqContent.ts`.
- **`profile.tsx`** — lists up to `MAX_USERS` (3) profiles, lets you switch the active one, add a new one (hidden once at the limit), or delete one (inline Cancel/Delete confirmation, no native `Alert` dependency).

## Components (`src/components/`)

| Component | Purpose |
|---|---|
| `cycle-form.tsx` | Date field + two steppers + submit button; shows a soft "may be irregular" hint when inputs fall outside typical ranges |
| `date-field.tsx` | Self-contained calendar picker (month grid + prev/next) built from scratch with `Modal`/`Pressable`/`View` — no native date-picker package, so it behaves identically on web and native and needed no platform-specific files |
| `stepper.tsx` | Bordered −/+ numeric input (period length, cycle length) |
| `result-card.tsx` | One result tile (label, month, big day number). Exports `fontSizeForDays()`, which sizes text to fit the *longest* value across sibling cards so a cross-month range like "29 Jul – 2 Aug" never wraps/truncates while a single day like "7" stays large |
| `cycle-phase-diagram.tsx` | SVG donut (Period / Follicular / Fertile+Ovulation / Luteal arcs), hand-computed via `polarToCartesian`/`describeArc`, sized to the *actual* computed dates rather than a generic illustration |
| `gradient-button.tsx` | Shared pink pill button (`expo-linear-gradient`) |
| `regularity-badge.tsx` | Green "Regular" / pink "Irregular" pill, or a neutral "First logged cycle" tag when there's no prior entry to compare against |
| `faq-accordion.tsx` | Thin wrapper that maps FAQ content onto the template's existing `Collapsible` |
| `user-onboarding.tsx` | First-run "what should we call you?" screen, calls `useUser().addUser()` |
| `themed-text.tsx` / `themed-view.tsx` | Template-provided light/dark-aware primitives; every screen builds on these instead of raw `Text`/`View` |
| `ui/collapsible.tsx`, `animated-icon*`, `app-tabs.tsx` | Template-provided or navigation chrome (see below) |

## Hooks (`src/hooks/`)

- **`use-user-store.tsx`** — the multi-profile system. `UserProvider` loads the profile list + last-active id from storage once, exposes `{ loading, users, activeUser, addUser, switchUser, removeUser }` via `useUser()`. Every screen that reads or writes per-user data (calculator defaults, history) goes through `activeUser.id`, keeping each of the 3 possible profiles' data fully separate.
- **`use-theme.ts`** / **`use-color-scheme(.web).ts`** — template-provided light/dark mode plumbing; `Colors[scheme]` from `constants/theme.ts` is the single source of truth for every color used in the app.

## Business logic (`src/lib/`) — deliberately UI-free

- **`cycleMath.ts`** — all the date math, kept pure and testable:
  - `calculateCycle(lastPeriodStart, periodLength, cycleLength)` → next period start/end, ovulation date (`nextPeriodStart − 14 days`, since the luteal phase is relatively fixed), fertile window (`ovulation − 5` to `ovulation + 1`).
  - `computeAverageCycleLength(history)` → average gap between consecutive logged start dates (null until 2+ entries).
  - `isLikelyIrregular(periodLength, cycleLength)` → outside the ACOG-cited typical ranges (period 2–7 days, cycle 21–35 days).
  - `annotateHistoryRegularity(history)` → sorts oldest-first and tags each entry with the cycle length *into* it and whether that's irregular; the earliest entry gets `null` (no prior cycle to measure against).
  - Formatting helpers (`formatMonthAbbrev`, `formatDayRange`, `formatLongDate`, `toISODateString`).
- **`storage.ts`** — the only file that touches `AsyncStorage`. Two concerns:
  1. **User profiles**: `getUsers`/`createUser`/`deleteUser`/`getActiveUserId`/`setActiveUserId`, capped at `MAX_USERS = 3`. Deleting a profile also wipes its history/defaults keys.
  2. **Per-user data**: `getHistory`/`saveCycleEntry`/`deleteCycleEntry`/`getLastInputs`/`setLastInputs` — every one of these takes a `userId` as its first argument and reads/writes a key namespaced to that user (e.g. `flo-calculator/cycle-history/<userId>`), which is what actually keeps profiles' data separate.
- **`faqContent.ts`** — the FAQ question/answer data, written in original wording (not copied from Flo).
- **`types.ts`** — `CycleEntry`, `CalculatorResult`, `UserProfile`.

## Design tokens (`src/constants/theme.ts`)

`Colors.light` / `Colors.dark` hold every color the app uses (`primary`, `accent` (teal), `period`, `diagramBackground`, `regular`/`irregularSoft`, etc.) — components always read through `useTheme()`, never hardcode hex values, so dark mode "just works" everywhere. `PrimaryGradient` is the two-stop pink used by `GradientButton`. `Spacing`, `Fonts`, `BottomTabInset`, `MaxContentWidth` round out the token set (the last one centers content on wide/web viewports).

## App icon & branding

`assets/images/` holds the "Blossom" icon (four overlapping petal circles + a teal center dot) at every size Expo needs: `icon.png` (1024, full pink tile), Android adaptive-icon foreground/background/monochrome layers, `favicon.png`, and `splash-icon.png`. These were generated from one parametric SVG glyph via a throwaway `sharp`-based script (not checked into the repo) rather than hand-exported, so re-running the same generator would reproduce them exactly if the palette ever changes. `app.json`'s splash and adaptive-icon background colors match the icon's light-pink tile; the old iOS Icon Composer bundle was removed since iOS now falls back to generating its icon from `icon.png` directly.

## Build & distribution

- **Web**: `npx expo start --web` — the target that's been most heavily iterated on and verified in-browser.
- **Android**: `eas.json`'s `preview` profile builds a directly-installable APK (`"buildType": "apk"`, not an AAB) via `eas build --platform android --profile preview`. The project is linked to EAS as `@tswastik/flo-calculator` (`app.json → extra.eas.projectId`), with EAS-managed remote signing credentials (no local keystore).
- **iOS**: not yet buildable standalone — requires enrolling in the Apple Developer Program first (out of scope for this repo alone). Until then, `npx expo start` + Expo Go on a physical iPhone runs the same app over the LAN with zero build step.

## Known gaps / next steps

- No automated tests yet — `cycleMath.ts` is written to be pure/testable but nothing exercises it.
- iOS standalone build is blocked on an Apple Developer account.
- The FAQ/irregular-cycle copy is informational only (explicitly not medical advice) — worth a real review pass if this ever ships beyond personal/learning use.
- `eslint-config-expo`'s `react-hooks/set-state-in-effect` rule still flags the template's own `src/hooks/use-color-scheme.web.ts` — pre-existing, not introduced by this project's code.
