import { getWorldLocation } from "@/lib/world-location";

export function CountryWorldLocation({
  countryCode,
  name,
  className,
}: {
  countryCode: string;
  name?: string;
  className?: string;
}) {
  const location = getWorldLocation(countryCode);
  const [, , width, height] = location.viewBox.split(" ").map(Number);
  const label = name ? `${name} i verden` : "Landets plassering i verden";

  return (
    <div
      className={["countryWorldLocation", className].filter(Boolean).join(" ")}
    >
      <svg
        viewBox={location.viewBox}
        role="img"
        aria-label={label}
        focusable="false"
      >
        <path className="countryWorldLocationOcean" d={location.sphere} />
        <path className="countryWorldLocationLand" d={location.land} />
        {location.selected?.d ? (
          <path
            className="countryWorldLocationSelected"
            d={location.selected.d}
          />
        ) : null}
      </svg>
      {location.selected?.marker && width && height ? (
        <span
          className="countryWorldLocationMarker"
          aria-hidden="true"
          style={{
            left: `${(location.selected.x / width) * 100}%`,
            top: `${(location.selected.y / height) * 100}%`,
          }}
        />
      ) : null}
    </div>
  );
}
