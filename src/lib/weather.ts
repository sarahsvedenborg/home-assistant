// Maps MET Norway weather symbol codes to an emoji + Norwegian label.
// Symbol codes carry a _day/_night/_polartwilight suffix we strip first.
// See https://api.met.no/weatherapi/weathericon/2.0/documentation

type WeatherDescription = { emoji: string; label: string };

const SYMBOLS: Record<string, WeatherDescription> = {
  clearsky: { emoji: "☀️", label: "Klarvær" },
  fair: { emoji: "🌤️", label: "Lettskyet" },
  partlycloudy: { emoji: "⛅", label: "Delvis skyet" },
  cloudy: { emoji: "☁️", label: "Skyet" },
  fog: { emoji: "🌫️", label: "Tåke" },
  lightrainshowers: { emoji: "🌦️", label: "Lette regnbyger" },
  rainshowers: { emoji: "🌦️", label: "Regnbyger" },
  heavyrainshowers: { emoji: "🌧️", label: "Kraftige regnbyger" },
  lightrain: { emoji: "🌦️", label: "Lett regn" },
  rain: { emoji: "🌧️", label: "Regn" },
  heavyrain: { emoji: "🌧️", label: "Kraftig regn" },
  lightsleet: { emoji: "🌨️", label: "Lett sludd" },
  sleet: { emoji: "🌨️", label: "Sludd" },
  heavysleet: { emoji: "🌨️", label: "Kraftig sludd" },
  lightsnow: { emoji: "🌨️", label: "Lett snø" },
  snow: { emoji: "❄️", label: "Snø" },
  heavysnow: { emoji: "❄️", label: "Kraftig snø" },
  lightsnowshowers: { emoji: "🌨️", label: "Lette snøbyger" },
  snowshowers: { emoji: "🌨️", label: "Snøbyger" },
};

export function describeWeather(code: string): WeatherDescription {
  const base = code.replace(/_(day|night|polartwilight)$/, "");

  if (SYMBOLS[base]) {
    return SYMBOLS[base];
  }

  // Fallbacks for the many combined codes (e.g. thunder variants) we don't
  // list explicitly: match on the dominant keyword.
  if (base.includes("thunder")) {
    return { emoji: "⛈️", label: "Torden" };
  }
  if (base.includes("snow")) {
    return { emoji: "❄️", label: "Snø" };
  }
  if (base.includes("sleet")) {
    return { emoji: "🌨️", label: "Sludd" };
  }
  if (base.includes("rain")) {
    return { emoji: "🌧️", label: "Regn" };
  }
  if (base.includes("cloud")) {
    return { emoji: "☁️", label: "Skyet" };
  }

  return { emoji: "🌡️", label: "Vær" };
}
