export type PlanetKey = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";

/** Sidereal ecliptic longitude in degrees, 0-360, per planet. */
export type Longitudes = Record<PlanetKey, number>;

export interface DashaPeriod {
  major: PlanetKey;
  minor: PlanetKey;
  /** Epoch milliseconds. */
  start: number;
  end: number;
}

const YEAR_MS = 365.25 * 86_400_000;
const CYCLE_YEARS = 120;
const NAKSHATRA_SPAN = 360 / 27;
const SIGN_SPAN = 30;

/** Vimshottari order starting from the lord of Ashwini, with each lord's years. */
const SEQUENCE: [PlanetKey, number][] = [
  ["Ketu", 7], ["Venus", 20], ["Sun", 6], ["Moon", 10], ["Mars", 7],
  ["Rahu", 18], ["Jupiter", 16], ["Saturn", 19], ["Mercury", 17],
];

/**
 * Vimshottari major/minor periods from birth until `untilAge` years.
 * The Moon's position inside its nakshatra decides how much of the first major period is left.
 */
export function dashaPeriods(moonLongitude: number, birth: number, untilAge: number): DashaPeriod[] {
  const nakshatra = Math.floor(moonLongitude / NAKSHATRA_SPAN);
  const elapsedFraction = (moonLongitude % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const firstLord = nakshatra % SEQUENCE.length;
  const limit = birth + untilAge * YEAR_MS;
  // The first major period notionally began before birth.
  let majorStart = birth - elapsedFraction * SEQUENCE[firstLord][1] * YEAR_MS;
  const periods: DashaPeriod[] = [];

  for (let m = firstLord; majorStart < limit; m += 1) {
    const [major, majorYears] = SEQUENCE[m % SEQUENCE.length];
    let start = majorStart;
    for (let a = 0; a < SEQUENCE.length; a += 1) {
      const [minor, minorYears] = SEQUENCE[(m + a) % SEQUENCE.length];
      const end = start + ((majorYears * minorYears) / CYCLE_YEARS) * YEAR_MS;
      if (end > birth && start < limit) {
        periods.push({ major, minor, start: Math.max(start, birth), end: Math.min(end, limit) });
      }
      start = end;
    }
    majorStart = start;
  }
  return periods;
}

type Classical = Exclude<PlanetKey, "Rahu" | "Ketu">;

const SIGN_LORDS: Classical[] = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
];
/** Sign index (Aries = 0) where each planet is exalted; debilitation is the opposite sign. */
const EXALTATION: Record<Classical, number> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
};

const DIGNITY = { exalted: 90, own: 80, cancelled: 70, neutral: 55, debilitated: 30 } as const;
const ANGLES = [1, 4, 7, 10];
const HOUSE_BONUS: Record<number, number> = {
  1: 8, 4: 8, 7: 8, 10: 8, 5: 8, 9: 8, 2: 4, 11: 4, 3: 0, 6: -8, 8: -8, 12: -8,
};
const MAJOR_WEIGHT = 0.4;
const MINOR_WEIGHT = 0.6;
const SUPPORTIVE_HOUSES = [1, 4, 5, 7, 9, 10];
const DIFFICULT_HOUSES = [6, 8, 12];
const SUPPORT_BONUS = 4;
const DIFFICULT_PENALTY = 6;

const signOf = (longitude: number): number => Math.floor((((longitude % 360) + 360) % 360) / SIGN_SPAN);
/** House (1-12) of `sign` counted from `fromSign`. */
const houseFrom = (fromSign: number, sign: number): number => ((sign - fromSign + 12) % 12) + 1;
const clamp = (value: number): number => Math.min(100, Math.max(0, value));

/**
 * Debilitation is cancelled (นิจภังค์) when the lord of the sign, or the planet exalted in that sign,
 * sits in an angle from the Moon.
 */
function isDebilitationCancelled(sign: number, chart: Longitudes): boolean {
  const moonSign = signOf(chart.Moon);
  const exaltedHere = (Object.keys(EXALTATION) as Classical[]).filter((p) => EXALTATION[p] === sign);
  return [SIGN_LORDS[sign], ...exaltedHere].some((p) => ANGLES.includes(houseFrom(moonSign, signOf(chart[p]))));
}

function dignityOf(planet: Classical, chart: Longitudes): number {
  const sign = signOf(chart[planet]);
  if (sign === EXALTATION[planet]) return DIGNITY.exalted;
  if (sign === (EXALTATION[planet] + 6) % 12) {
    return isDebilitationCancelled(sign, chart) ? DIGNITY.cancelled : DIGNITY.debilitated;
  }
  return SIGN_LORDS[sign] === planet ? DIGNITY.own : DIGNITY.neutral;
}

/**
 * Strength 0-100 per planet: sign dignity plus a bonus for the house it occupies.
 * Rahu and Ketu have no signs of their own, so they take the dignity of the lord of the sign they sit in.
 */
export function planetStrengths(chart: Longitudes): Record<PlanetKey, number> {
  // ponytail: houses are counted from the Moon's sign (จันทร์ลัคน์), which needs no birthplace.
  // Counting from the true ascendant needs latitude/longitude; add a province picker to upgrade.
  const moonSign = signOf(chart.Moon);
  const entries = (Object.keys(chart) as PlanetKey[]).map((planet) => {
    const sign = signOf(chart[planet]);
    const dignity = dignityOf(planet === "Rahu" || planet === "Ketu" ? SIGN_LORDS[sign] : planet, chart);
    return [planet, clamp(dignity + HOUSE_BONUS[houseFrom(moonSign, sign)])] as const;
  });
  return Object.fromEntries(entries) as Record<PlanetKey, number>;
}

/** Score 0-100 for a period: the sub-period lord counts more, adjusted by how the two lords sit from each other. */
export function periodScore(
  major: PlanetKey,
  minor: PlanetKey,
  strengths: Record<PlanetKey, number>,
  chart: Longitudes,
): number {
  const relation = houseFrom(signOf(chart[major]), signOf(chart[minor]));
  const adjustment = SUPPORTIVE_HOUSES.includes(relation)
    ? SUPPORT_BONUS
    : DIFFICULT_HOUSES.includes(relation)
      ? -DIFFICULT_PENALTY
      : 0;
  return Math.round(clamp(MAJOR_WEIGHT * strengths[major] + MINOR_WEIGHT * strengths[minor] + adjustment));
}
