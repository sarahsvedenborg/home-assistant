import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { AppChrome } from "@/components/app-chrome";
import { InstallPrompt } from "@/components/install-prompt";
import { MobileActionMenu } from "@/components/mobile-action-menu";
import { getTodaysBirthdays } from "@/lib/data";
import { themeForToday } from "@/lib/theme";
import { SanityLive } from "@/sanity/lib/live";

const displayFont = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Hub",
  description: "Et lekent felles sted for familiens ønskelister, filmvalg og planer.",
  applicationName: "Family Hub",
  appleWebApp: {
    capable: true,
    title: "Family Hub",
    statusBarStyle: "default",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fffaf1",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const todaysBirthdays = await getTodaysBirthdays();
  const theme = themeForToday({ isBirthday: todaysBirthdays.length > 0 });

  return (
    <html
      lang="no"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-theme={theme}
      suppressHydrationWarning
    >
      <body>
        <Suspense fallback={null}>
          <AppChrome />
        </Suspense>
        <div className="birthdayBalloons" aria-hidden="true">
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
          <span className="birthdayBalloon"></span>
        </div>
        <div className="autumnLeaves" aria-hidden="true">
          <span className="autumnLeaf">🍂</span>
          <span className="autumnLeaf">🍁</span>
          <span className="autumnLeaf">🍂</span>
          <span className="autumnLeaf">🍁</span>
          <span className="autumnLeaf">🍂</span>
        </div>
        <div className="christmasLights" aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => (
            <span className="christmasLight" key={index}></span>
          ))}
        </div>
        <div className="christmasSnow" aria-hidden="true">
          <span className="christmasFlake">❄</span>
          <span className="christmasFlake">❅</span>
          <span className="christmasFlake">❄</span>
          <span className="christmasFlake">❆</span>
          <span className="christmasFlake">❄</span>
          <span className="christmasFlake">❅</span>
          <span className="christmasFlake">❄</span>
          <span className="christmasFlake">❆</span>
        </div>
        {children}
        <InstallPrompt />
        <MobileActionMenu />
        <SanityLive />
      </body>
    </html>
  );
}
