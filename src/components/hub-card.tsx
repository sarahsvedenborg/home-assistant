import Link from "next/link";

type HubCardProps = {
  // Link to the section's list page.
  href: string;
  // Link to the section page with the hash that opens its add form.
  formHref: string;
  icon: string;
  title: string;
  stat: string;
  accentClass: string;
  // Label for the button that opens the list page.
  openLabel: string;
  // Label for the button that opens the submission form.
  addLabel: string;
};

export function HubCard({
  href,
  formHref,
  icon,
  title,
  stat,
  accentClass,
  openLabel,
  addLabel,
}: HubCardProps) {
  return (
    <article className={`hubCard ${accentClass}`}>
      <div className="hubCardTop">
        <span className="hubIcon" aria-hidden="true">
          {icon}
        </span>
        <span className="hubStat">{stat}</span>
      </div>
      <h2>{title}</h2>
      <div className="hubCardActions">
        <Link href={href} className="buttonSecondary">
          {openLabel}
        </Link>
        <Link href={formHref} className="buttonPrimary">
          {addLabel}
        </Link>
      </div>
    </article>
  );
}
