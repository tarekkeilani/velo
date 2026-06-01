# Publishing Velo to the Google Play Store

## Build the upload artifact

```sh
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```

The release build is signed with the **upload key** in `android/app/velo-upload.keystore`,
configured via `android/keystore.properties`. Both are git-ignored.

### ⚠️ Back up your signing key

If you lose `velo-upload.keystore` **and** its password, you can no longer push
updates under this upload key (though with Play App Signing you can request an
upload-key reset). Store a copy of the keystore file and the password somewhere
safe (a password manager). The password is in `android/keystore.properties`.

## One-time Play Console setup

1. Create the app in the [Play Console](https://play.google.com/console).
   Package name: **com.tarekkeilani.velo** (permanent — cannot change later).
2. Enable **Play App Signing** (recommended). You upload with the upload key;
   Google manages the distribution signing key.
3. **Privacy policy**: host `docs/PRIVACY.md` at a public URL (e.g. GitHub Pages)
   and paste the link in the Console. Replace the contact email first.
4. **Data Safety form**: declare camera/mic are used for app functionality and
   not collected/stored by you; calls are P2P/encrypted. Review carefully.
5. **Content rating**, **target audience**, **ads = none**.

## Store listing assets you'll need

- App icon 512×512 (you have `velo-icon/png/velo-icon-512.png`).
- Feature graphic 1024×500.
- At least 2 phone screenshots (e.g. home screen + an active call).
- Short description (≤80 chars) and full description.

## Versioning (for each update)

Bump in `android/app/build.gradle`:
- `versionCode` — integer, must increase every upload.
- `versionName` — human label, e.g. "1.0.1".

## Known gaps before a public launch

- **TURN**: with STUN-only, calls behind strict/symmetric NAT won't connect.
  Add a TURN server for reliable connectivity (has a bandwidth cost).
- **iOS**: not yet built/tested; speaker routing needs an AVAudioSession path.
