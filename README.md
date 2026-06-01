# Velo

**Private, end-to-end-encrypted, peer-to-peer video calls — no accounts, no phone numbers.**

You start a call, get a short code, share it with one person, and your two
phones connect **directly**. The audio and video are encrypted end-to-end, so
the conversation stays between the two of you. A short **safety code** shown on
both phones lets you verify there's no one in the middle.

---

## How it works

Velo is a React Native app built on **WebRTC** (the same real-time media engine
browsers use). The hard part of any calling app is two-fold: (1) getting the
encrypted media to flow directly between two phones, and (2) helping the two
phones find each other in the first place ("signaling").

```
  Phone A  ──────────────  encrypted audio/video (WebRTC, P2P)  ──────────────  Phone B
     │                                                                             │
     └───────────── signaling (room code + connection info) ───────────────────────┘
                         via Supabase Realtime "presence"
```

- **Media** travels **peer-to-peer** and is encrypted in transit with
  **DTLS-SRTP** (built into WebRTC — it can't be turned off). Velo never sees,
  records, or stores it.
- **Signaling** (the brief "let's connect" handshake) rides on **Supabase
  Realtime presence**. It only carries connection metadata, is ephemeral, and is
  never written to a database. _(We use presence rather than Supabase
  "broadcast" because broadcast reception is unreliable in React Native.)_
- **Trust:** after connecting, both phones derive the same **safety code** from
  the call's cryptographic fingerprints. Read it aloud — if it matches, no
  man-in-the-middle. If it differs, hang up.

### A call, step by step

1. **Caller** taps *Start a call* → gets a room code → shares it (any app).
2. **Callee** enters the code. Both phones join a presence channel keyed by the
   code.
3. When each side sees the other present, they exchange a single complete
   connection description (**non-trickle ICE** — all network candidates are
   gathered first and embedded in the description).
4. WebRTC establishes the direct, encrypted connection. Video appears; the
   **safety code** is shown.

## Project structure

```
src/
  app/                 # composition root: providers, navigation, config
    config/env.ts      # Supabase URL + publishable key, STUN servers
    providers/         # dependency-injection of services (Supabase, etc.)
    navigation/        # Home + Call routes
  features/call/       # the call feature (Data / Logic / UI separated)
    lib/               # signalingChannel, peerConnection, sas, fingerprint, audioRoute
    hooks/             # useLocalMedia (camera/mic), useCall (the orchestrator)
    ui/                # HomeScreen, CallScreen, SafetyCode, CallControls
  shared/              # reusable UI kit, theme, DI container
android/app/src/main/java/com/velo/  # AudioRouteModule (native speaker routing)
```

## Prerequisites

- **Node ≥ 22**, **JDK 17**
- **Android:** Android Studio / SDK (build tools), an Android device or emulator
- **iOS:** Xcode + CocoaPods (`bundle install`) — _note: iOS is not yet tested_

## Setup

```sh
npm install
```

**Supabase:** the app ships pointed at a Supabase project in
[`src/app/config/env.ts`](src/app/config/env.ts). To use your own project, edit
that file with your project URL and **publishable** key. No database tables or
schema are required — signaling uses ephemeral Realtime presence, which is on by
default. (The publishable key is meant to live in client apps; see *Security*.)

**Android — run on a device/emulator:**
```sh
# one-time: point Gradle at your SDK
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
npm start                 # Metro (keep running)
npm run android           # build + install a debug build
```

**iOS:**
```sh
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios
```

## Building a release

Signing reads from `android/keystore.properties` (git-ignored). Without it,
release falls back to the debug key.

```sh
cd android
./gradlew assembleRelease   # → per-ABI APKs (~25–35MB) for sideloading
./gradlew bundleRelease      # → app-release.aab for the Play Store
```

Outputs land under `android/app/build/outputs/`. See
[docs/PUBLISHING.md](docs/PUBLISHING.md) for the full Play Store checklist.

## Tests & checks

```sh
npm test            # Jest (pure logic: safety code, room codes, fingerprints)
npx tsc --noEmit    # type check
npm run lint        # eslint
```

## Security model

- **Calls are end-to-end encrypted** (DTLS-SRTP) and peer-to-peer; the contents
  never touch a server.
- **No accounts, no analytics, no stored call data.** See the
  [privacy policy](https://tarekkeilani.github.io/velo/).
- **The Supabase key in the repo is the _publishable_ key** — it is designed to
  be shipped inside client apps (it's in the APK either way) and is safe to be
  public. The real secrets — the Supabase **service-role/secret key** and the
  Android **signing keystore** — are **not** in this repo.
- For a hardened production deployment you would add **Realtime authorization /
  rate limits** so the publishable key can't be used to abuse your Realtime
  quota.

## Known limitations

- **No TURN server yet.** Velo uses STUN only, so calls connect directly on most
  networks but **fail on strict/symmetric NATs** (some mobile carriers, locked-
  down Wi-Fi). Adding a TURN relay fixes this (at a bandwidth cost).
- **iOS** is wired but untested.
- **v1 is anonymous room codes** — no contacts or incoming-call ringing yet.

## License

TBD.
