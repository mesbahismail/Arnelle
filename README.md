# RNL — React Native iOS template

<!-- mesbah-lab-credit -->
> **A Mesbah Lab freebie.** Designed and coded by us at [Mesbah Lab](https://mesbahlab.net).
>
> **More freebies:** [mesbahlab.net](https://mesbahlab.net)
>
> **Follow us:** [Instagram](https://www.instagram.com/themesbahlab/) · [X](https://x.com/mesbahlab) · [Facebook](https://www.facebook.com/profile.php?id=1421874334341579) · [Pinterest](https://www.pinterest.com/mesbahlab/) · [YouTube](https://www.youtube.com/channel/UCyPo3LFW1Xv8DkcEnRdB7Ug) · [Behance](https://www.behance.net/mesbahismail) · [GitHub](https://github.com/mesbahismail)
>
> **Enjoying this freebie?** [Support us with a donation on PayPal](https://paypal.me/mesbahlab). Your tip keeps designs free for everyone.
<!-- /mesbah-lab-credit -->

One React Native application, following the supplied iPhone screens. The browser preview renders the **same `native/App.tsx`** inside a 393 × 852 iPhone viewport. There is no separate desktop UI.

## Preview on localhost

```sh
npm install
npm --prefix native install
npm run preview:build
npm run dev
```

Open http://localhost:3000. On desktop the iPhone screen stays at its original proportions and scales down only when necessary to fit the window. On a phone it fills the viewport. Re-run `npm run preview:build` after changing native screens. `npm run build` rebuilds the preview automatically.

## Deploy to Vercel

Use the repository root as the Vercel project root and keep the build command as `npm run build`. The checked-in `vercel.json` installs both the root and `native/` dependencies from their lockfiles before building. The native dependencies are required because the build exports the Expo browser preview before building Next.js.

## Run as a native iOS app

```sh
cd native
npm install
npm run ios
```

This launches the Expo app in an available iPhone Simulator. For a physical iPhone, use a compatible Expo Go client or an Expo development build; see [native setup](native/README.md). Native iOS uses the real status bar, safe areas, and home indicator. Browser-only simulated chrome lives in `native/src/preview-chrome.tsx` and is never rendered on iOS.

## Included flows

Animated splash → welcome → demo login / sign-up / recovery → setup → onboarding → interests → follow creators → Discover. Browse/search, communities and local posts, messaging, profile/followers/saved reels, camera/library → story editing → music selection → audience → publish, and a live-room demo with bundled looping nature video, incoming fading comments every 1.7 seconds, white floating hearts, and point-based gifts.

The reference-inspired Arnelle bird mark is shared by the welcome screen, splash, app icon, and browser icon. Press feedback and screen transitions respect Reduce Motion. Demo login: **arnelle / demo1234**. Passwords are never persisted. Facebook and Google login open Discover directly with a local demo session. Recovery previews the flow without sending email.

All screens use React Native primitives, Lucide icons, and bundled DM Sans typography. Login goes straight to Discover; setup is reserved for sign-up. Avatar story rings open a story viewer, and circular shared-story cards in conversations open the creator’s story viewer. Profile reels stay in two columns. Discover has full-width section dividers. Capture follows the supplied full-screen layout with a circular shutter, timer, camera settings, and filter strip. Native UI, data, persistence, media helpers, and preview share one source. The palette and spacing tokens are in `native/src/data.ts`.

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

The runtime smoke test executes the actual Expo web bundle and checks authentication validation, recovery, setup, onboarding, all five tabs, logout, story avatars, shared reels, the two-column profile grid, and the live room. It is not a visual screenshot test.

The downloadable native source is `public/rnl-template.zip`. Self-hostable shadcn registry packages are in `public/r/`; the native package is `/r/rnl-native.json`. Registry distribution does not convert native controls into DOM-based shadcn widgets. No official directory listing is claimed.

## Demo boundaries

Authentication, messages, posts, follows, saved reels, story metadata, and gift credits are local demo state. Live broadcasting, cloud uploads, remote messaging, video compositing, and real payments require a backend. Integration contracts are in `native/src/services.ts`.

Code and original avatars/audio are MIT licensed. See [LICENSE](LICENSE) and [ASSETS.md](ASSETS.md) for separate photo and video licenses. Photos are demo assets; the original image files from the reference screenshots were not supplied separately.
