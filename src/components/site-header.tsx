"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setIsOpen(false);
  }

  function navClass(href: string) {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return isActive ? "navLink navLinkActive" : "navLink";
  }

  return (
    <header className="siteHeader">
      <div className="siteHeaderTop">
        <Link href="/" className="brandMark" onClick={closeMenu}>
          <span className="brandEmoji">🏡</span>
          <span>
            <strong>Family Hub</strong>
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
        <Link href="/" className={navClass("/")} onClick={closeMenu}>
          Hjem
        </Link>
        <Link
          href="/onskeliste"
          className={navClass("/onskeliste")}
          onClick={closeMenu}
        >
          Ønskeliste
        </Link>
        <Link
          href="/movies"
          className={navClass("/movies")}
          onClick={closeMenu}
        >
          Filmer
        </Link>
        <Link
          href="/handleliste"
          className={navClass("/handleliste")}
          onClick={closeMenu}
        >
          Handleliste
        </Link>
        <Link
          href="/oppskrifter"
          className={navClass("/oppskrifter")}
          onClick={closeMenu}
        >
          Oppskrifter
        </Link>
        <Link
          href="/forslag"
          className={navClass("/forslag")}
          onClick={closeMenu}
        >
          Forslag
        </Link>
        <Link
          href="/aktiviteter"
          className={navClass("/aktiviteter")}
          onClick={closeMenu}
        >
          Aktiviteter
        </Link>
        <Link
          href="/kalender"
          className={navClass("/kalender")}
          onClick={closeMenu}
        >
          Kalender
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
