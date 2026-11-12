import { expect, test } from "vitest";
import { type Longitudes, dashaPeriods, periodScore, planetStrengths } from "./dasha";

const DAY_MS = 86_400_000;
const YEAR_MS = 365.25 * DAY_MS;
const BIRTH = Date.UTC(2000, 0, 1);

test("moon halfway through Dhanishta leaves half of the 7-year Mars period", () => {
  const periods = dashaPeriods(300, BIRTH, 90);

  expect(periods[0].major).toBe("Mars");
  const rahuStart = periods.find((p) => p.major === "Rahu")!.start;
  expect((rahuStart - BIRTH) / YEAR_MS).toBeCloseTo(3.5, 6);
});

test("sub-periods already elapsed at birth are skipped, and the rest keep their order", () => {
  const marsSubs = dashaPeriods(301, BIRTH, 90).filter((p) => p.major === "Mars").map((p) => p.minor);

  // Mars sub-periods: Mars, Rahu, Jupiter, Saturn, Mercury, Ketu, Venus, Sun, Moon.
  // The first four end 3.5 years in; a Moon at 301° is 4.03 years in, inside Mercury.
  expect(marsSubs).toEqual(["Mercury", "Ketu", "Venus", "Sun", "Moon"]);
});

test("periods are contiguous from birth and stop at the requested age", () => {
  const periods = dashaPeriods(300, BIRTH, 90);

  expect(periods[0].start).toBe(BIRTH);
  periods.slice(1).forEach((p, i) => expect(p.start).toBe(periods[i].end));
  expect((periods.at(-1)!.end - BIRTH) / YEAR_MS).toBeCloseTo(90, 6);
});

test("moon at 0° Aries starts a full 7-year Ketu period", () => {
  const periods = dashaPeriods(0, BIRTH, 90);

  expect(periods[0]).toMatchObject({ major: "Ketu", minor: "Ketu" });
  expect((periods.find((p) => p.major === "Venus")!.start - BIRTH) / YEAR_MS).toBeCloseTo(7, 6);
});

const CHART: Longitudes = {
  Sun: 5, // Aries: exalted, 1st from Moon
  Moon: 10, // Aries
  Mars: 100, // Cancer: debilitated but cancelled (its sign lord, the Moon, is in an angle), 4th from Moon
  Mercury: 160, // Virgo: exalted, 6th from Moon
  Jupiter: 250, // Sagittarius: own sign, 9th from Moon
  Venus: 40, // Taurus: own sign, 2nd from Moon
  Saturn: 130, // Leo: neutral, 5th from Moon
  Rahu: 95, // Cancer: takes the Moon's dignity (neutral in Aries), 4th from Moon
  Ketu: 275, // Capricorn: takes Saturn's dignity, 10th from Moon
};

test("strength combines sign dignity with the house counted from the Moon", () => {
  const strengths = planetStrengths(CHART);

  expect(strengths.Sun).toBe(98); // exalted 90 + angle 8
  expect(strengths.Mars).toBe(78); // cancelled debilitation 70 + angle 8
  expect(strengths.Mercury).toBe(82); // exalted 90 - difficult house 8
  expect(strengths.Venus).toBe(84); // own 80 + 2nd house 4
  expect(strengths.Rahu).toBe(63); // Moon's dignity 55 + angle 8
});

test("debilitation stays in force when neither cancelling planet is in an angle from the Moon", () => {
  // Sun in Libra, 7th from Moon. Its cancellers are Venus (2nd) and Saturn (5th): neither is in an angle.
  const strengths = planetStrengths({ ...CHART, Sun: 185 });

  expect(strengths.Sun).toBe(38); // debilitated 30 + angle 8
});

test("period score weights the sub-period lord more and rewards lords placed well from each other", () => {
  const strengths = planetStrengths(CHART);

  // Jupiter 88, Sun 98; Sun is 5th from Jupiter: +4
  expect(periodScore("Jupiter", "Sun", strengths, CHART)).toBe(Math.round(0.4 * 88 + 0.6 * 98 + 4));
  // Sun 98, Mercury 82; Mercury is 6th from Sun: -6
  expect(periodScore("Sun", "Mercury", strengths, CHART)).toBe(Math.round(0.4 * 98 + 0.6 * 82 - 6));
});

test("scores stay inside 0-100", () => {
  const strengths = planetStrengths(CHART);
  expect(periodScore("Sun", "Sun", strengths, CHART)).toBeLessThanOrEqual(100);
});
