import { Body, Ecliptic, GeoVector } from "astronomy-engine";
import type { Longitudes } from "./dasha";

const J2000_MS = Date.UTC(2000, 0, 1, 12);
const YEAR_MS = 365.25 * 86_400_000;
const DAY_MS = 86_400_000;
const JULIAN_CENTURY_DAYS = 36_525;
/** Lahiri ayanamsa at J2000 in degrees, and its yearly drift. */
const LAHIRI_J2000 = 23.85306;
const LAHIRI_PER_YEAR = 50.2792 / 3600;

const norm = (degrees: number): number => ((degrees % 360) + 360) % 360;

// ponytail: mean ayanamsa without nutation, about 0.005° off the true value. That moves period
// dates by a day or two at most; switch to a nutation-corrected ayanamsa if day-level precision matters.
const ayanamsa = (ms: number): number => LAHIRI_J2000 + ((ms - J2000_MS) / YEAR_MS) * LAHIRI_PER_YEAR;

/** Mean lunar ascending node (tropical), Meeus ch. 47. */
function meanNode(ms: number): number {
  const t = (ms - J2000_MS) / DAY_MS / JULIAN_CENTURY_DAYS;
  return norm(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t);
}

const BODIES = {
  Sun: Body.Sun, Moon: Body.Moon, Mars: Body.Mars, Mercury: Body.Mercury,
  Jupiter: Body.Jupiter, Venus: Body.Venus, Saturn: Body.Saturn,
} as const;

/** Sidereal (Lahiri) geocentric longitudes for a UTC instant in epoch milliseconds. */
export function siderealLongitudes(ms: number): Longitudes {
  const date = new Date(ms);
  const shift = ayanamsa(ms);
  const tropical = (body: Body): number => Ecliptic(GeoVector(body, date, true)).elon;
  const rahu = norm(meanNode(ms) - shift);
  return {
    Sun: norm(tropical(BODIES.Sun) - shift),
    Moon: norm(tropical(BODIES.Moon) - shift),
    Mars: norm(tropical(BODIES.Mars) - shift),
    Mercury: norm(tropical(BODIES.Mercury) - shift),
    Jupiter: norm(tropical(BODIES.Jupiter) - shift),
    Venus: norm(tropical(BODIES.Venus) - shift),
    Saturn: norm(tropical(BODIES.Saturn) - shift),
    Rahu: rahu,
    Ketu: norm(rahu + 180),
  };
}
