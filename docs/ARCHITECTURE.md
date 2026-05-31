# Velo — Architecture

A feature-based structure with a clean separation between **Data**, **Logic**, and **UI**.

## Layers

```
src/
├─ app/                     # Composition root — wiring only, no business logic
│  ├─ App.tsx               # providers → navigation
│  ├─ config/env.ts         # environment constants (API host, etc.)
│  ├─ providers/            # AppProviders: builds concrete services & clients
│  └─ navigation/           # RootNavigator + route param types
│
├─ features/                # One folder per feature, self-contained
│  └─ posts/
│     ├─ api/               # DATA  — network access (depends on HttpClient)
│     ├─ model/             # domain types
│     ├─ hooks/             # LOGIC — React Query (server state) + Zustand (client state)
│     ├─ ui/                # UI    — presentational components + container screen
│     └─ index.ts           # public surface of the feature
│
└─ shared/                  # Cross-cutting, reusable building blocks
   ├─ ui/                   # themed primitives: Screen, Text, Button, Card
   ├─ theme/                # design tokens + ThemeProvider/useAppTheme
   └─ lib/                  # httpClient, storage, queryClient, DI (services)
```

## Dependency rule

`features` and `shared/ui` depend on **abstractions** (`HttpClient`, `Storage`,
the theme). Concrete implementations are built once in `app/providers/AppProviders.tsx`
(the composition root) and injected through React context (`useServices`).
This keeps features decoupled, swappable, and unit-testable with fakes.

```
app  ──▶ features ──▶ shared        (arrows = "may import")
 └──────────────────▶ shared
```

## Data / Logic / UI in one feature (posts)

| Layer | File | Responsibility |
|-------|------|----------------|
| Data  | `api/postsApi.ts`        | Endpoints & response shapes. No React. |
| Logic | `hooks/usePosts.ts`      | Server state via React Query (cache, retry, cancel). |
| Logic | `hooks/useFavorites.ts`  | Client state via Zustand (favorites set). |
| UI    | `ui/PostListItem.tsx`    | Pure row render (memoized). |
| UI    | `ui/PostsScreen.tsx`     | Composes hooks + components per state. |

## Path aliases

`@app/*`, `@features/*`, `@shared/*` — configured in `babel.config.js`
(module-resolver) and `tsconfig.json` (paths).

## iOS notes

Two new native modules (`react-native-screens`, already-present
`react-native-safe-area-context`) are autolinked. After pulling these changes:

```sh
bundle exec pod install   # from ios/, installs the native pods
npm run ios
```

- `shared/ui/Screen.tsx` applies safe-area insets (notch + home indicator).
- All interactive elements meet the 44pt HIG minimum touch target (`MIN_TOUCH_TARGET`).
- Lists use `FlatList` with windowing for smooth scrolling on device.
