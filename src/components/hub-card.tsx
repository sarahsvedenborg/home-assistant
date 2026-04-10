import Link from "next/link";

type HubCardProps = {
  href: string;
  icon: string;
  title: string;
  description: string;
  stat: string;
  accentClass: string;
  ctaLabel: string;
};

export function HubCard({
  href,
  icon,
  title,
  description,
  stat,
  accentClass,
  ctaLabel,
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
      <p>{description}</p>
      <Link href={href} className="buttonSecondary">
        {ctaLabel}
      </Link>
    </article>
  );
}
