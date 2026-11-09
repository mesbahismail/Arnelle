# RNL — React Native iOS template

One React Native application, following the supplied iPhone screens. The browser preview renders the **same `native/App.tsx`** inside a 393 × 852 iPhone viewport. There is no separate desktop UI.

## Preview on localhost

```sh
npm install
npm --prefix native install
npm run preview:build
npm run dev
```

Open http://localhost:3000. On desktop the iPhone screen stays at its original proportions and scales down only when necessary to fit the window. On a phone it fills the viewport. Re-run `npm run preview:build` after changing native screens. `npm run build` rebuilds the preview automatically.

## Run as a native iOS app

```sh
cd native
npm install
npm run ios
```

This launches the Expo app in an available iPhone Simulator. For a physical iPhone, use a compatible Expo Go client or an Expo development build; see [native setup](native/README.md). Native iOS uses the real status bar, safe areas, and home indicator. Browser-only simulated chrome lives in `native/src/preview-chrome.tsx` and is never rendered on iOS.

## Included flows

Onboarding → interests → follow creators → Discover. Browse/search, communities and local posts, messaging, profile/followers/saved reels, camera/library → story editing → music selection → audience → publish, and a live-room demo with point-based gifts.

All screens use React Native primitives. Native UI, data, persistence, media helpers, and preview share one source. The palette and spacing tokens are in `native/src/data.ts`.

## Validate and distribute

```sh
npm run lint
npm run typecheck
npm --prefix native run typecheck
npm run preview:build
npm test
npm run build
npm --prefix native run export:ios
npm run registry:build
npm run template:pack
```

The runtime smoke test executes the actual Expo web bundle and checks onboarding, all five tabs, and the profile menu. It is not a visual screenshot test.

The downloadable native source is `public/rnl-template.zip`. Self-hostable shadcn registry packages are in `public/r/`; the native package is `/r/rnl-native.json`. Registry distribution does not convert native controls into DOM-based shadcn widgets. No official directory listing is claimed.

## Demo boundaries

Messages, posts, follows, saved reels, story metadata, and gift credits are local demo state. Live broadcasting, cloud uploads, remote messaging, video compositing, and real payments require a backend. Integration contracts are in `native/src/services.ts`.

Code and original avatars/audio are MIT licensed. See [LICENSE](LICENSE) and [ASSETS.md](ASSETS.md) for separate photo and video licenses. Photos are demo assets; the original image files from the reference screenshots were not supplied separately.
