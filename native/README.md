# RNL · React Native for iOS

A free, MIT-licensed social app starter built with Expo SDK 54, React Native 0.81, and TypeScript. Native components, real iOS safe areas, system status bar, system home indicator, haptics, camera, photo library, video, audio, and local persistence.

## Run

```sh
npm install
npx expo install --check
npm run ios
```

`npm run ios` starts Metro and opens an installed iOS Simulator. Xcode and a compatible simulator runtime are required. For a physical iPhone, run `npm start` and use a compatible Expo Go client, or create a development build with `npx expo run:ios --device`. SDK 54 is deliberately pinned; use a matching development client instead of assuming the latest Expo Go supports it.

```sh
npm run typecheck
npm run export:ios
```

`export:ios` verifies the JavaScript/assets bundle. It does not produce a signed IPA. To generate a native Xcode project and run it locally: `npx expo run:ios`. Change `ios.bundleIdentifier` in app.json before distribution.

## Flows

- First launch: birthday, gender, nationality, language → interests → creators → Discover.
- Discover → reel playback or live demo room → follow, like, save, comments, and gift sheet. Gift credits debit only when sufficient balance remains.
- Browse → search reels, hashtags, and accounts. Saved reels are available under Profile → Menu.
- Communities → join / leave → community feed → publish a local post.
- Messaging → conversation → send locally persisted messages.
- Camera → real camera or photo library / demo capture → caption, stickers, tint filter, music → draggable audio selection → audience → publish to profile.
- Profile → followers, edit profile, menu, preferences, and restart onboarding.

## Template architecture

- `App.tsx`: screen orchestration and flows.
- `src/ui.tsx`: reusable buttons, icon buttons, headers, avatars, search fields, sheets, and section headings.
- `src/data.ts`: fixtures, original avatars, palette, and spacing tokens (2, 4, 8, 16, 23, 24, 32, 48).
- `src/store.ts`: versioned AsyncStorage persistence and default demo state.
- `src/media.ts`: original audio generation and durable photo storage.
- `src/services.ts`: typed integration contract and sample playback URLs.

The home indicator and status bar are rendered by iOS itself. There is no duplicate fake bar inside the native app. Sheets support downward dismissal from their handle, accessible close controls, and safe bottom padding.

## Connect your backend

The template is a functioning **local demo**, with no accounts or remote server. Messaging does not send to other people. Publish saves a story locally; it does not upload or composite a video. Caption, tint, audio offset, and audience are stored as story metadata. You can render that metadata in a viewer or send it to a media composition service. Demo privacy preferences do not enforce server authorization.

Implement `SocialBackend` in `src/services.ts` for auth, messages, uploads, comments, and authoritative gift balances. Set `livePlaybackUrl` to a server-issued HLS URL for live playback. Broadcasting requires a provider SDK, server-created credentials, and authorization. Never put provider secrets in the app. Gift points are fictional and no payment processing is included.

All fictional songs preview the original generated melody. Replace these fixtures with your own licensed tracks. Remote photo/video fixtures require internet. Camera and filesystem behavior must be checked on a real iPhone before release.

## Registry installation

This app is also packaged as `/r/rnl-native.json` by the companion preview. In an existing Expo SDK 54 project, install it with the shadcn CLI using the URL of your hosted registry:

```sh
npx shadcn@latest add https://YOUR_HOST/r/rnl-native.json
```

The package creates `rnl/App.tsx` and `rnl/src/*` without replacing your entry point. Export it from your app entry (`export { default } from './rnl/App'`), or render it from a route. Merge the camera, photo library, audio, and video plugin/permission configuration from the included setup guide into your app config, then rebuild your native client. Use `npx expo install --fix` to keep dependency versions aligned with your Expo SDK.

This is a self-hosted, schema-compatible registry package; it is not a claim of listing in shadcn's official directory.

## The localhost iPhone preview

The root project exports this exact React Native app with Expo for the browser, then displays it in a 393 × 852 viewport. Browser device chrome is isolated in `src/preview-chrome.tsx`; on native iOS, the operating system supplies those bars. There is no desktop dashboard or separate web implementation.
