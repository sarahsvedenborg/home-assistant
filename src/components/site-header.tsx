"use client";

import Link from "next/link";
import { useState } from "react";

type SiteHeaderProps = {
  current:
    | "home"
    | "wishlist"
    | "onskeliste"
    | "movies"
    | "handleliste"
    | "oppskrifter"
    | "forslag"
    | "aktiviteter"
    | "kalender"
    | "meldinger"
    | "ukelonn";
};

export function SiteHeader({ current }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="siteHeader">
      <div className="siteHeaderTop">
        <Link href="/" className="brandMark" onClick={closeMenu}>
          <span className="brandEmoji">🏡</span>
          <span>
            <strong>Infoskjermen</strong>
            <small>Felles info for familien Svedenborg</small>
          </span>
        </Link>

        <button
          type="button"
          className={isOpen ? "menuButton menuButtonOpen" : "menuButton"}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          aria-label="Aapne meny"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        id="site-navigation"
        className={isOpen ? "siteNav siteNavOpen" : "siteNav"}
        aria-label="Hovednavigasjon"
      >
        <Link href="/" className={current === "home" ? "navLink navLinkActive" : "navLink"} onClick={closeMenu}>
          Hjem
        </Link>
        <Link
          href="/onskeliste"
          className={current === "onskeliste" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Ønskeliste
        </Link>
        <Link
          href="/movies"
          className={current === "movies" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Filmer
        </Link>
        <Link
          href="/handleliste"
          className={current === "handleliste" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Handleliste
        </Link>
        <Link
          href="/oppskrifter"
          className={current === "oppskrifter" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Oppskrifter
        </Link>
        <Link
          href="/forslag"
          className={current === "forslag" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Forslag
        </Link>
        <Link
          href="/aktiviteter"
          className={current === "aktiviteter" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Aktiviteter
        </Link>
        <Link
          href="/kalender"
          className={current === "kalender" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Kalender
        </Link>
        <Link
          href="/meldinger"
          className={current === "meldinger" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Meldinger
        </Link>
        <Link
          href="/ukelonn"
          className={current === "ukelonn" ? "navLink navLinkActive" : "navLink"}
          onClick={closeMenu}
        >
          Ukelønn
        </Link>
       {/*  <Link href="/studio" className="navLink navLinkStudio">
          Studio for voksne
        </Link> */}
          <Link href="https://svedenborg.sanity.studio" className="navLink navLinkStudio">
         Admin
        </Link>
      </nav>
    </header>
  );
}
