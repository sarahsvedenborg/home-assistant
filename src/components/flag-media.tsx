"use client";

import { useState } from "react";

import type { Country } from "@/lib/types";

export function FlagMedia({
  country,
  featured = false,
  showMap = true,
  alt,
}: {
  country: Country;
  featured?: boolean;
  showMap?: boolean;
  alt?: string;
}) {
  const [flagSrc, setFlagSrc] = useState(country.flagUrl);
  const [mapFailed, setMapFailed] = useState(false);

  return (
    <div className={featured ? "flagMedia flagMediaFeatured" : "flagMedia"}>
      <img
        src={flagSrc}
        alt={alt ?? `Flagget til ${country.name}`}
        className="flagImage"
        onError={() => {
          if (flagSrc !== country.flagSvgUrl) {
            setFlagSrc(country.flagSvgUrl);
          }
        }}
      />
      {showMap && !mapFailed ? (
        <img
          src={country.mapUrl}
          alt={`Kart over ${country.name}`}
          className="flagMap"
          onError={() => setMapFailed(true)}
        />
      ) : null}
    </div>
  );
}
