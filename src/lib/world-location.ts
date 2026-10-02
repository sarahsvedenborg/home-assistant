import worldMap from "@/data/world-map.json";

type CountryGeometry = {
  d?: string;
  x: number;
  y: number;
  m?: number;
  b?: number[];
};

type WorldMapData = {
  viewBox: string;
  sphere: string;
  land: string;
  countries: Record<string, CountryGeometry>;
};

const data = worldMap as WorldMapData;
export const WORLD_WIDTH = 960;
export const WORLD_HEIGHT = 500;
const WORLD_ASPECT = WORLD_WIDTH / WORLD_HEIGHT;

export type WorldView = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WorldLocation = {
  viewBox: string;
  view: WorldView;
  sphere: string;
  land: string;
  selected?: {
    d?: string;
    x: number;
    y: number;
    marker: boolean;
  };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function regionalView(selected: CountryGeometry): WorldView {
  const bounds = selected.b;
  const rawWidth = bounds ? Math.max(bounds[2] - bounds[0], 1) : 8;
  const rawHeight = bounds ? Math.max(bounds[3] - bounds[1], 1) : 8;
  const inflated =
    rawWidth > WORLD_WIDTH * 0.42 || rawHeight > WORLD_HEIGHT * 0.5;
  const countryWidth = inflated ? 8 : rawWidth;
  const countryHeight = inflated ? 8 : rawHeight;
  const minWidth = 280;

  let width = Math.max(countryWidth / 0.14, minWidth);
  let height = Math.max(countryHeight / 0.14, minWidth / WORLD_ASPECT);

  if (inflated) {
    width = WORLD_WIDTH * 0.4;
    height = width / WORLD_ASPECT;
  }

  if (width / height > WORLD_ASPECT) {
    height = width / WORLD_ASPECT;
  } else {
    width = height * WORLD_ASPECT;
  }

  width = clamp(width, minWidth, WORLD_WIDTH * 0.62);
  height = width / WORLD_ASPECT;
  height = Math.min(height, WORLD_HEIGHT * 0.76);
  width = height * WORLD_ASPECT;

  const x = clamp(selected.x - width / 2, 0, WORLD_WIDTH - width);
  const y = clamp(selected.y - height / 2, 0, WORLD_HEIGHT - height);

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10,
  };
}

function needsMarker(selected: CountryGeometry, view: WorldView) {
  if (!selected.d) {
    return true;
  }

  const bounds = selected.b;
  if (!bounds) {
    return selected.m === 1;
  }

  const countrySpan = Math.max(bounds[2] - bounds[0], bounds[3] - bounds[1]);
  return countrySpan / Math.min(view.width, view.height) < 0.055;
}

export function getWorldLocation(
  countryCode: string,
  viewOverride?: WorldView,
): WorldLocation {
  const code = countryCode.trim().toLowerCase();
  const selected = data.countries[code];
  const view =
    viewOverride ??
    (selected
      ? regionalView(selected)
      : { x: 0, y: 0, width: WORLD_WIDTH, height: WORLD_HEIGHT });

  return {
    viewBox: `${view.x} ${view.y} ${view.width} ${view.height}`,
    view,
    sphere: data.sphere,
    land: data.land,
    selected: selected
      ? {
          d: selected.d,
          x: selected.x,
          y: selected.y,
          marker: needsMarker(selected, view),
        }
      : undefined,
  };
}

function roundView(view: WorldView): WorldView {
  return {
    x: Math.round(view.x * 10) / 10,
    y: Math.round(view.y * 10) / 10,
    width: Math.round(view.width * 10) / 10,
    height: Math.round(view.height * 10) / 10,
  };
}

export function clientToWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  view: WorldView,
): { x: number; y: number } {
  const xRatio = rect.width === 0 ? 0.5 : (clientX - rect.left) / rect.width;
  const yRatio = rect.height === 0 ? 0.5 : (clientY - rect.top) / rect.height;

  return {
    x: view.x + xRatio * view.width,
    y: view.y + yRatio * view.height,
  };
}

export function clampWorldView(
  view: WorldView,
  minWidth: number,
  maxWidth = WORLD_WIDTH,
): WorldView {
  let width = clamp(view.width, minWidth, maxWidth);
  let height = width / WORLD_ASPECT;

  if (width >= WORLD_WIDTH * 0.97) {
    return {
      x: 0,
      y: 0,
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
    };
  }

  height = Math.min(height, WORLD_HEIGHT);
  width = height * WORLD_ASPECT;

  return roundView({
    x: clamp(view.x, 0, WORLD_WIDTH - width),
    y: clamp(view.y, 0, WORLD_HEIGHT - height),
    width,
    height,
  });
}

export function zoomWorldView(
  view: WorldView,
  focus: { x: number; y: number },
  clientX: number,
  clientY: number,
  rect: DOMRect,
  scale: number,
  minWidth: number,
): WorldView {
  const next = clampWorldView(
    {
      ...view,
      width: view.width / scale,
      height: view.height / scale,
    },
    minWidth,
  );
  const xRatio = rect.width === 0 ? 0.5 : (clientX - rect.left) / rect.width;
  const yRatio = rect.height === 0 ? 0.5 : (clientY - rect.top) / rect.height;

  return clampWorldView(
    {
      ...next,
      x: focus.x - xRatio * next.width,
      y: focus.y - yRatio * next.height,
    },
    minWidth,
  );
}

export function zoomLimitWidth(baseWidth: number) {
  return Math.max(140, Math.min(baseWidth * 0.5, 220));
}
