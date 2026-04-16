import type { ChaosWeatherResponse } from "../types/index.js";

type WeatherInput = {
  latitude?: number;
  longitude?: number;
};

const GRAN_CANARIA = {
  latitude: 27.9206,
  longitude: -15.5477,
  locationName: "Gran Canaria",
};

function toNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  return value;
}

function weatherSummary(code: number): string {
  if (code === 0) return "Klar himmel, nesten mistenkelig bra forhold.";
  if ([1, 2, 3].includes(code)) return "Skyer med ambisjoner.";
  if ([45, 48].includes(code)) return "Tåke. Hjernen går på lavt bluss.";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Nedbør og eksistensiell stemning.";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Vintermodus aktivert.";
  if ([95, 96, 99].includes(code)) return "Tordenvær. Kaoset har værstatus.";
  return "Været er uklart, men dramatikken er høy.";
}

function verdictFromWeather(temperature: number, windSpeed: number, precipitation: number, code: number): string {
  if (code === 0 && temperature >= 22) return "Optimal dag for å late som du har full kontroll.";
  if (windSpeed >= 25 || [95, 96, 99].includes(code)) return "Systemet anbefaler kaffe, skjerf og strategisk overlevelse.";
  if (precipitation > 0.2) return "Produktivitet på lavtrykk. Små seire teller.";
  if (temperature < 10) return "Kald luft, varm kopp, fokus i korte intervaller.";
  return "Bra nok forhold til å gjøre ting uten å dramatisere for mye.";
}

function recommendedActionFromWeather(temperature: number, windSpeed: number, precipitation: number): string {
  if (windSpeed >= 25 || precipitation > 0.4) return "Start med den enkleste oppgaven og hold kaffe innen rekkevidde.";
  if (temperature >= 24) return "Ta en pause i skyggen og returner med minimal heroisme.";
  if (temperature < 8) return "Finn et pledd og gå i små, effektive steg.";
  return "Del opp oppgaven og sett en tydelig første milepæl.";
}

function chaosLevel(temperature: number, windSpeed: number, precipitation: number, code: number): number {
  const base =
    (temperature < 10 ? 20 : temperature > 24 ? 15 : 8) +
    (windSpeed > 20 ? 28 : windSpeed > 10 ? 14 : 6) +
    (precipitation > 0.3 ? 24 : precipitation > 0.05 ? 10 : 3) +
    ([95, 96, 99].includes(code) ? 25 : [51, 53, 55, 61, 63, 65].includes(code) ? 12 : 0);

  return Math.max(5, Math.min(100, base));
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string | undefined> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");

  const res = await fetch(url);
  if (!res.ok) return undefined;

  const data = (await res.json()) as { results?: Array<{ name?: string; admin1?: string; country?: string }> };
  const place = data.results?.[0];

  if (!place) return undefined;

  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

export async function getChaosWeather(input: WeatherInput = {}): Promise<ChaosWeatherResponse> {
  const latitude = toNumber(input.latitude) ?? GRAN_CANARIA.latitude;
  const longitude = toNumber(input.longitude) ?? GRAN_CANARIA.longitude;
  const usingDefault = latitude === GRAN_CANARIA.latitude && longitude === GRAN_CANARIA.longitude;

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(latitude));
  forecastUrl.searchParams.set("longitude", String(longitude));
  forecastUrl.searchParams.set("current", "temperature_2m,precipitation,wind_speed_10m,weather_code");
  forecastUrl.searchParams.set("timezone", "auto");

  const forecastRes = await fetch(forecastUrl);
  if (!forecastRes.ok) {
    throw new Error(`Open-Meteo request failed: ${forecastRes.status}`);
  }

  const forecast = (await forecastRes.json()) as {
    current?: {
      temperature_2m?: number;
      precipitation?: number;
      wind_speed_10m?: number;
      weather_code?: number;
    };
  };

  const temperature = forecast.current?.temperature_2m ?? 0;
  const precipitation = forecast.current?.precipitation ?? 0;
  const windSpeed = forecast.current?.wind_speed_10m ?? 0;
  const weatherCode = forecast.current?.weather_code ?? 0;
  const summary = weatherSummary(weatherCode);
  const locationName = usingDefault
    ? GRAN_CANARIA.locationName
    : (await reverseGeocode(latitude, longitude)) ?? "Din lokasjon";

  return {
    locationName,
    latitude,
    longitude,
    temperature,
    windSpeed,
    precipitation,
    weatherCode,
    summary,
    chaosLevel: chaosLevel(temperature, windSpeed, precipitation, weatherCode),
    verdict: verdictFromWeather(temperature, windSpeed, precipitation, weatherCode),
    recommendedAction: recommendedActionFromWeather(temperature, windSpeed, precipitation),
  };
}
