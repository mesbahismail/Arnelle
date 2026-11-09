import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "RNL — A little more you.",
  description:
    "Find your people. Share your world. A free React Native social and live streaming app template.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RNL",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
