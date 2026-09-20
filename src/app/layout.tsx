import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

import { AppChrome } from "@/components/app-chrome";
import { MobileActionMenu } from "@/components/mobile-action-menu";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <body>
        <Script
          id="family-hub-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("family-hub-theme");if(t==="christmas"||t==="birthday"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}',
          }}
        />
        <Suspense fallback={null}>
          <AppChrome />
        </Suspense>
        {children}
        <MobileActionMenu />
        <SanityLive />
      </body>
    </html>
  );
}
