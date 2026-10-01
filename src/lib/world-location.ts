import worldMap from "@/data/world-map.json";

type CountryGeometry = {
  d?: string;
  x: number;
  y: number;
  m?: number;
};

type WorldMapData = {
  viewBox: string;
  sphere: string;
  land: string;
  countries: Record<string, CountryGeometry>;
};

const data = worldMap as WorldMapData;

export type WorldLocation = {
  viewBox: string;
  sphere: string;
  land: string;
  selected?: {
    d?: string;
    x: number;
    y: number;
    marker: boolean;
  };
};

export function getWorldLocation(countryCode: string): WorldLocation {
  const code = countryCode.trim().toLowerCase();
  const selected = data.countries[code];

  return {
    viewBox: data.viewBox,
    sphere: data.sphere,
    land: data.land,
    selected: selected
      ? {
          d: selected.d,
          x: selected.x,
          y: selected.y,
          marker: selected.m === 1 || !selected.d,
        }
      : undefined,
  };
}
