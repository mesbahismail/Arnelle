"use client";
import { useEffect, useState } from "react";

/** Only a device viewport. All screens and interactions come from native/App.tsx. */
export default function Home() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const resize = () =>
      setScale(
        window.innerWidth <= 430
          ? 1
          : Math.min(1, (window.innerHeight - 32) / 852),
      );
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return (
    <main className="ios-preview">
      <div
        className="device-space"
        style={{ width: 393 * scale, height: 852 * scale }}
      >
        <iframe
          title="RNL — React Native iPhone preview"
          src="/ios/index.html"
          className="iphone-screen"
          style={{ transform: `scale(${scale})` }}
          allow="camera; microphone; autoplay"
        />
      </div>
    </main>
  );
}
