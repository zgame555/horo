import { expect, test } from "vitest";
import { currentMonthColumn, lifeGraph, runningAgeColumn } from "./lifeGraph";

test("matches the hand-checked graph for a Wednesday, November, year of the pig birth", () => {
  const graph = lifeGraph(2007, 11, 7);

  expect(graph.map((c) => c.value)).toEqual([4, 7, 10, 1, 9, 12, 3, 2, 4, 6, 8, 10]);
  expect(graph[0]).toMatchObject({ house: "วาสนา", pair: "ความสุข", zone: "นรกภูมิ" });
  expect(graph[5]).toMatchObject({ house: "ศัตรู", pair: "วาสนา", zone: "สวรรค์" });
  expect(graph[9]).toMatchObject({ house: "การงาน", pair: "คู่ครอง", zone: "โลกมนุษย์" });
});

test("birth month is column 0 and months wrap around the year", () => {
  expect(currentMonthColumn(11, 11)).toBe(0);
  expect(currentMonthColumn(11, 1)).toBe(2);
  expect(currentMonthColumn(11, 10)).toBe(11);
});

test("running age 32 lands on the eighth column", () => {
  expect(runningAgeColumn(32)).toBe(7);
  expect(runningAgeColumn(1)).toBe(0);
});

test("rejects impossible dates", () => {
  expect(() => lifeGraph(1995, 2, 30)).toThrow();
});
