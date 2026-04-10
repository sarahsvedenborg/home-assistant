import Link from "next/link";

type SiteHeaderProps = {
  current: "home" | "wishlist" | "movies" | "handleliste";
};

export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="siteHeader">
      <Link href="/" className="brandMark">
        <span className="brandEmoji">🏡</span>
        <span>
          <strong>Family Hub</strong>
          <small>Felles info for familien Svedenborg</small>
        </span>
      </Link>

      <nav className="siteNav" aria-label="Hovednavigasjon">
        <Link href="/" className={current === "home" ? "navLink navLinkActive" : "navLink"}>
          Hjem
        </Link>
        <Link
          href="/wishlist"
          className={current === "wishlist" ? "navLink navLinkActive" : "navLink"}
        >
          Ønskeliste
        </Link>
        <Link
          href="/movies"
          className={current === "movies" ? "navLink navLinkActive" : "navLink"}
        >
          Filmer
        </Link>
        <Link
          href="/handleliste"
          className={current === "handleliste" ? "navLink navLinkActive" : "navLink"}
        >
          Handleliste
        </Link>
        <Link href="/studio" className="navLink navLinkStudio">
          Studio for voksne
        </Link>
      </nav>
    </header>
  );
}
