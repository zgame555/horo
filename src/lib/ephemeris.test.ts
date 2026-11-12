import { expect, test } from "vitest";
import { siderealLongitudes } from "./ephemeris";

// Reference: at J2000.0 (1 Jan 2000 12:00 UT) the tropical Sun is at 280.37°, the Moon at 223.32°
// and the mean lunar node at 125.04°; the Lahiri ayanamsa is 23.853°.
test("sidereal positions at J2000 match published values", () => {
  const chart = siderealLongitudes(Date.UTC(2000, 0, 1, 12));

  expect(chart.Sun).toBeCloseTo(280.37 - 23.853, 1);
  expect(chart.Moon).toBeCloseTo(223.32 - 23.853, 1);
  expect(chart.Rahu).toBeCloseTo(125.04 - 23.853, 1);
  expect(chart.Ketu).toBeCloseTo(chart.Rahu + 180, 6);
});
