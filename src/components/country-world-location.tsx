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
  const { view } = location;
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
        <rect
          className="countryWorldLocationOcean"
          x={view.x}
          y={view.y}
          width={view.width}
          height={view.height}
        />
        <path className="countryWorldLocationLand" d={location.land} />
        {location.selected?.d ? (
          <path
            className="countryWorldLocationSelected"
            d={location.selected.d}
          />
        ) : null}
      </svg>
      {location.selected?.marker ? (
        <span
          className="countryWorldLocationMarker"
          aria-hidden="true"
          style={{
            left: `${((location.selected.x - view.x) / view.width) * 100}%`,
            top: `${((location.selected.y - view.y) / view.height) * 100}%`,
          }}
        />
      ) : null}
    </div>
  );
}
