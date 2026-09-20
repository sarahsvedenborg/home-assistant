import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { AppChrome } from "@/components/app-chrome";
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
        <MobileActionMenu />
        <SanityLive />
      </body>
    </html>
  );
}
