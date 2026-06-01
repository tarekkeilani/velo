# Play Store listing — draft copy & form answers

> Review and edit before submitting. These are starting points, not legal advice.

## Text

**App name** (≤30): `Velo`

**Short description** (≤80):
> Private, end-to-end encrypted peer-to-peer video calls. No account needed.

**Full description** (≤4000):
> Velo is a simple, private way to make a video call.
>
> Calls connect your two devices directly (peer-to-peer) and are end-to-end
> encrypted, so the conversation stays between you and the person you're talking
> to. There are no accounts, no phone numbers, and no contact lists to hand over.
>
> How it works:
> • Start a call to get a short code.
> • Share the code with one person, any way you like.
> • They enter it and you're connected.
>
> Verify it's really them: every call shows a short Safety Code on both phones.
> Read it aloud — if it matches, no one is in the middle.
>
> What Velo does NOT do:
> • No accounts or sign-ups.
> • No ads, analytics, or trackers.
> • No recording or storing of your calls.
>
> Velo is built for privacy first.

## Data Safety form (recommended answers — confirm for your case)

- **Does your app collect or share user data?**
  - Audio/Video (call content): processed **ephemerally**, **end-to-end
    encrypted**, sent peer-to-peer, never stored by the developer. Declare under
    the ephemeral/E2E handling — not "collected" to your servers.
  - App activity / messages: none stored.
- **Is data encrypted in transit?** Yes.
- **Can users request deletion?** No personal data is stored, so there's nothing
  to delete.
- Note: room code + WebRTC signaling pass through Supabase Realtime ephemerally
  (not persisted). IP addresses are exchanged peer-to-peer for connectivity
  (inherent to any P2P call).

## Content rating (IARC questionnaire)

- App allows **real-time user-to-user video/voice communication**: **Yes**.
- User-generated content is **not moderated** by the developer.
- No violence, gambling, or mature content from the app itself.
- This typically yields a Teen/PEGI 12 rating due to unmoderated user
  communication — answer truthfully and accept the assigned rating.

## Assets

- App icon 512×512: `velo-icon/png/velo-icon-512.png`
- Feature graphic 1024×500: `velo-icon/png/velo-feature-1024x500.png`
- Screenshots: capture Home + an active call on a phone (2+ required).
