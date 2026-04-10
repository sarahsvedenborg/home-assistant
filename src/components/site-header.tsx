import Link from "next/link";

type SiteHeaderProps = {
  current: "home" | "wishlist" | "movies";
};

export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="siteHeader">
      <Link href="/" className="brandMark">
        <span className="brandEmoji">🏡</span>
        <span>
          <strong>Family Hub</strong>
          <small>shared ideas, one happy place</small>
        </span>
      </Link>

      <nav className="siteNav" aria-label="Main navigation">
        <Link href="/" className={current === "home" ? "navLink navLinkActive" : "navLink"}>
          Hub
        </Link>
        <Link
          href="/wishlist"
          className={current === "wishlist" ? "navLink navLinkActive" : "navLink"}
        >
          Wish List
        </Link>
        <Link
          href="/movies"
          className={current === "movies" ? "navLink navLinkActive" : "navLink"}
        >
          Movies
        </Link>
        <Link href="/studio" className="navLink navLinkStudio">
          Grown-up Studio
        </Link>
      </nav>
    </header>
  );
}
