import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { AppChrome } from "@/components/app-chrome";
import { MobileActionMenu } from "@/components/mobile-action-menu";
import { getTodaysBirthdays } from "@/lib/data";
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

  return (
    <html
      lang="no"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-theme={todaysBirthdays.length > 0 ? "birthday" : undefined}
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
        {children}
        <MobileActionMenu />
        <SanityLive />
      </body>
    </html>
  );
}
