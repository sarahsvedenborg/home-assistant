import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const d3 = require("d3-geo");
const topojson = require("topojson-client");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const WIDTH = 960;
const HEIGHT = 500;
const PADDING = 8;
const SMALL_AREA = 42;
const SMALL_EDGE = 7;

// ISO 3166-1 numeric (world-atlas ids) → alpha-2.
const ISO2_BY_NUMERIC = Object.fromEntries(
  `
af004 al008 dz012 as016 ad020 ao024 ai660 aq010 ag028 ar032 am051 aw533
au036 at040 az031 bs044 bh048 bd050 bb052 by112 be056 bz084 bj204 bm060
bt064 bo068 bq535 ba070 bw072 bv074 br076 io086 bn096 bg100 bf854 bi108
cv132 kh116 cm120 ca124 ky136 cf140 td148 cl152 cn156 cx162 cc166 co170
km174 cg178 cd180 ck184 cr188 ci384 hr191 cu192 cw531 cy196 cz203 dk208
dj262 dm212 do214 ec218 eg818 sv222 gq226 er232 ee233 sz748 et231 fk238
fo234 fj242 fi246 fr250 gf254 pf258 tf260 ga266 gm270 ge268 de276 gh288
gi292 gr300 gl304 gd308 gp312 gu316 gt320 gg831 gn324 gw624 gy328 ht332
hm334 va336 hn340 hk344 hu348 is352 in356 id360 ir364 iq368 ie372 im833
il376 it380 jm388 jp392 je832 jo400 kz398 ke404 ki296 kp408 kr410 kw414
kg417 la418 lv428 lb422 ls426 lr430 ly434 li438 lt440 lu442 mo446 mg450
mw454 my458 mv462 ml466 mt470 mh584 mq474 mr478 mu480 yt175 mx484 fm583
md498 mc492 mn496 me499 ms500 ma504 mz508 mm104 na516 nr520 np524 nl528
nc540 nz554 ni558 ne562 ng566 nu570 nf574 mk807 mp580 no578 om512 pk586
pw585 ps275 pa591 pg598 py600 pe604 ph608 pn612 pl616 pt620 pr630 qa634
re638 ro642 ru643 rw646 bl652 sh654 kn659 lc662 mf663 pm666 vc670 ws882
sm674 st678 sa682 sn686 rs688 sc690 sl694 sg702 sx534 sk703 si705 sb090
so706 za710 gs239 ss728 es724 lk144 sd729 sr740 sj744 se752 ch756 sy760
tw158 tj762 tz834 th764 tl626 tg768 tk772 to776 tt780 tn788 tr792 tm795
tc796 tv798 ug800 ua804 ae784 gb826 us840 um581 uy858 uz860 vu548 ve862
vn704 vg092 vi850 wf876 eh732 ye887 zm894 zw716 xk983
`
    .trim()
    .split(/\s+/)
    .map((entry) => [entry.slice(2), entry.slice(0, 2)]),
);

const ISO2_BY_NAME = {
  Kosovo: "xk",
};

const FALLBACK_COORDINATES = {
  bl: [-62.83, 17.9],
  bq: [-68.26, 12.18],
  bv: [3.36, -54.42],
  cc: [96.83, -12.17],
  cx: [105.63, -10.49],
  gf: [-53.13, 3.93],
  gi: [-5.35, 36.14],
  gp: [-61.55, 16.25],
  mf: [-63.05, 18.07],
  mq: [-61.02, 14.64],
  pn: [-127.95, -24.37],
  re: [55.54, -21.12],
  sj: [15.5, 78],
  tk: [-171.86, -9.2],
  tv: [179.2, -8.52],
  um: [166.64, 19.29],
  yt: [45.17, -12.83],
};

function round(value) {
  return Math.round(value * 10) / 10;
}

function compactPath(d) {
  return d
    ? d.replace(/(-?\d+\.\d+)/g, (value) => String(round(Number(value))))
    : "";
}

function simplifyRing(ring, minStep = 0.12) {
  if (ring.length <= 24) {
    return ring;
  }

  const simplified = [ring[0]];

  for (let index = 1; index < ring.length - 1; index += 1) {
    const previous = simplified[simplified.length - 1];
    const point = ring[index];
    if (Math.hypot(point[0] - previous[0], point[1] - previous[1]) >= minStep) {
      simplified.push(point);
    }
  }

  simplified.push(ring[ring.length - 1]);
  return simplified;
}

function smallerWinding(coordinates) {
  const original = { type: "Polygon", coordinates };
  const reversedCoordinates = coordinates.map((ring) => ring.slice().reverse());
  const reversed = { type: "Polygon", coordinates: reversedCoordinates };

  return d3.geoArea(reversed) < d3.geoArea(original)
    ? reversedCoordinates
    : coordinates;
}

function cleanGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: smallerWinding(geometry.coordinates).map((ring) =>
        simplifyRing(ring),
      ),
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map((polygon) =>
        smallerWinding(polygon).map((ring) => simplifyRing(ring)),
      ),
    };
  }

  return geometry;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function iso2ForGeometry(geometry) {
  if (geometry.properties?.name && ISO2_BY_NAME[geometry.properties.name]) {
    return ISO2_BY_NAME[geometry.properties.name];
  }

  if (typeof geometry.id !== "string" && typeof geometry.id !== "number") {
    return null;
  }

  const numeric = String(geometry.id).padStart(3, "0");
  return ISO2_BY_NUMERIC[numeric] ?? null;
}

function addCountry(countries, code, feature, path, projection, simplify = false) {
  const geometry = feature.geometry
    ? simplify
      ? cleanGeometry(feature.geometry)
      : {
          ...feature.geometry,
          coordinates:
            feature.geometry.type === "Polygon"
              ? smallerWinding(feature.geometry.coordinates)
              : feature.geometry.type === "MultiPolygon"
                ? feature.geometry.coordinates.map((polygon) => smallerWinding(polygon))
                : feature.geometry.coordinates,
        }
    : feature.geometry;
  const cleaned = { ...feature, geometry };
  const d = compactPath(path(cleaned));
  const geographic = d3.geoCentroid(cleaned);
  const centroid = projection(geographic) ?? path.centroid(cleaned);
  const bounds = path.bounds(cleaned);
  const width = bounds[1][0] - bounds[0][0];
  const height = bounds[1][1] - bounds[0][1];

  if (!centroid || !Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) {
    return;
  }

  const entry = {
    x: round(centroid[0]),
    y: round(centroid[1]),
    b: [
      round(bounds[0][0]),
      round(bounds[0][1]),
      round(bounds[1][0]),
      round(bounds[1][1]),
    ],
  };

  if (d && d !== "M0,0") {
    entry.d = d;
  }

  if (!entry.d || width * height < SMALL_AREA || Math.max(width, height) < SMALL_EDGE) {
    entry.m = 1;
  }

  if (!countries[code] || (!countries[code].d && entry.d)) {
    countries[code] = entry;
  }
}

const landTopo = readJson(join(root, "node_modules/world-atlas/land-110m.json"));
const countries110 = readJson(join(root, "node_modules/world-atlas/countries-110m.json"));
const countries50 = readJson(join(root, "node_modules/world-atlas/countries-50m.json"));
const uk = readJson(join(root, "scripts/uk-constituents.json"));

const projection = d3.geoNaturalEarth1().fitExtent(
  [
    [PADDING, PADDING],
    [WIDTH - PADDING, HEIGHT - PADDING],
  ],
  { type: "Sphere" },
);
const path = d3.geoPath(projection).digits(1);
const countries = {};

for (const geometry of countries110.objects.countries.geometries) {
  const code = iso2ForGeometry(geometry);
  if (!code) {
    continue;
  }

  addCountry(
    countries,
    code,
    topojson.feature(countries110, geometry),
    path,
    projection,
  );
}

for (const geometry of countries50.objects.countries.geometries) {
  const code = iso2ForGeometry(geometry);
  if (!code || countries[code]?.d) {
    continue;
  }

  addCountry(
    countries,
    code,
    topojson.feature(countries50, geometry),
    path,
    projection,
  );
}

for (const feature of uk.features) {
  addCountry(countries, feature.properties.code, feature, path, projection, true);
}

for (const [code, coordinates] of Object.entries(FALLBACK_COORDINATES)) {
  if (countries[code]) {
    continue;
  }

  const point = projection(coordinates);
  if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
    continue;
  }

  const x = round(point[0]);
  const y = round(point[1]);
  countries[code] = { x, y, m: 1, b: [x - 6, y - 6, x + 6, y + 6] };
}

const output = {
  viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
  sphere: compactPath(path({ type: "Sphere" })),
  land: compactPath(path(topojson.feature(landTopo, landTopo.objects.land))),
  countries,
};

const outPath = join(root, "src/data/world-map.json");
writeFileSync(outPath, `${JSON.stringify(output)}\n`);

const withPath = Object.values(countries).filter((country) => country.d).length;
const withMarker = Object.values(countries).filter((country) => country.m).length;
console.log(
  `wrote ${outPath} (${Math.round(readFileSync(outPath).length / 1024)}kb, ${Object.keys(countries).length} codes, ${withPath} shapes, ${withMarker} markers)`,
);
