"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "family-hub-install-hint-dismissed";
const PHONE_QUERY = "(max-width: 699px)";
const STANDALONE_QUERY =
  "(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui)";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay() {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia(STANDALONE_QUERY).matches || nav.standalone === true;
}

function isIosDevice() {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    /iPad|iPhone|iPod/.test(nav.userAgent) ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  );
}

export function InstallPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY);
    const standalone = window.matchMedia(STANDALONE_QUERY);

    function refresh() {
      const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
      const hideOnRoute = pathname === "/login" || pathname.startsWith("/studio");
      setVisible(phone.matches && !isStandaloneDisplay() && !dismissed && !hideOnRoute);
    }

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      if (phone.matches && !isStandaloneDisplay()) {
        setInstallEvent(event as BeforeInstallPromptEvent);
      }
    }

    setIsIOS(isIosDevice());
    refresh();

    phone.addEventListener("change", refresh);
    standalone.addEventListener("change", refresh);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    return () => {
      phone.removeEventListener("change", refresh);
      standalone.removeEventListener("change", refresh);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("installPromptVisible", visible);
    return () => document.body.classList.remove("installPromptVisible");
  }, [visible]);

  async function install() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <aside className="installPrompt" aria-label="Installer Family Hub">
      <p>
        {isIOS
          ? "Legg Family Hub på hjemskjermen: trykk Del og velg Legg til på Hjem-skjerm."
          : "Du kan åpne Family Hub som en app fra hjemskjermen."}
      </p>
      <div className="installPromptActions">
        {installEvent ? (
          <button className="buttonPrimary" type="button" onClick={() => void install()}>
            Installer
          </button>
        ) : null}
        <button className="buttonSecondary" type="button" onClick={dismiss}>
          Ikke nå
        </button>
      </div>
    </aside>
  );
}
