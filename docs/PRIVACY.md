# Velo — Privacy Policy

_Last updated: 2026-06-01_

Velo is a peer-to-peer video calling app. It is designed to collect and store
as little as possible. **Please review and adjust this document, and have it
checked for your jurisdiction, before publishing — it is a starting point, not
legal advice.**

## What Velo does

Velo lets two people make a live, end-to-end-encrypted video call by sharing a
short room code. Audio and video travel **directly between the two devices**
and are encrypted in transit (WebRTC DTLS-SRTP). Velo does **not** record,
store, or have access to the contents of your calls.

## Data we process

- **Camera & microphone.** Used only during an active call to capture your
  live audio and video, which is sent directly to the other participant. It is
  never recorded or stored by us.
- **Call setup (signaling) data.** To connect two devices, Velo exchanges
  technical connection details (a room code and WebRTC session/ICE data)
  through Supabase Realtime. This data is **ephemeral** — it is used to
  establish the call and is not written to a database or retained by us.
- **IP addresses.** Inherent to any peer-to-peer call, the two devices learn
  each other's network addresses in order to connect. A public STUN server
  (currently Google's `stun.l.google.com`) is used to help devices discover
  their own public address; it may see your IP address as part of this process.

## What we do NOT do

- No user accounts, names, emails, or contact lists.
- No analytics, advertising, or tracking SDKs.
- No selling or sharing of personal data.
- No recording or server-side storage of call audio/video.

## Third-party services

- **Supabase** (Realtime) — relays ephemeral call-setup messages. See Supabase's
  privacy policy.
- **Google STUN** — assists network address discovery for connectivity.

## Permissions

- **Camera / Microphone** — to make video calls.
- **Network / Wi-Fi state** — required by the WebRTC engine for connectivity.

## Children

Velo is not directed to children under 13 (or the minimum age in your region).

## Contact

Questions about this policy: **tarek.keilani@gmail.com**
