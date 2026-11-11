export const HOUSES = [
  "วาสนา", "ทรัพย์", "เพื่อน", "ญาติ", "บริวาร", "ศัตรู",
  "คู่ครอง", "โรคภัย", "ความสุข", "การงาน", "ลาภยศ", "วินาศ",
] as const;

export type Zone = "สวรรค์" | "โลกมนุษย์" | "นรกภูมิ";

export interface GraphColumn {
  house: string;
  value: number;
  pair: string;
  zone: Zone;
}

const COLUMNS = 12;
const WEEKDAYS = 7;

const zoneOf = (value: number): Zone =>
  value >= 9 ? "สวรรค์" : value >= 5 ? "โลกมนุษย์" : "นรกภูมิ";

/** Thai 12-number life graph: weekday + Thai month + year animal, summed per column, mod 12. */
export function lifeGraph(year: number, month: number, day: number): GraphColumn[] {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error("วันเกิดไม่ถูกต้อง");
  }

  // ponytail: weekday rolls at midnight and year animal at 1 Jan. Traditional rules roll the
  // day at sunrise and the animal at Thai new year; add birth time + lunar calendar when needed.
  const weekday = date.getUTCDay() + 1; // Sunday = 1
  const thaiMonth = (month % 12) + 1; // December = 1 (เดือนอ้าย)
  const animal = ((((year - 4) % 12) + 12) % 12) + 1; // ชวด = 1

  return HOUSES.map((house, i) => {
    const dayRow = i < WEEKDAYS ? ((weekday - 1 + i) % WEEKDAYS) + 1 : 0;
    const monthRow = ((thaiMonth - 1 + i) % COLUMNS) + 1;
    const yearRow = ((animal - 1 + i) % COLUMNS) + 1;
    const value = ((dayRow + monthRow + yearRow - 1) % COLUMNS) + 1;
    return { house, value, pair: HOUSES[(COLUMNS - value) % COLUMNS], zone: zoneOf(value) };
  });
}

/** Column the given calendar month falls on; the birth month is column 0. */
export function currentMonthColumn(birthMonth: number, nowMonth: number): number {
  return (nowMonth - birthMonth + COLUMNS) % COLUMNS;
}

/** Column for a running age (อายุย่าง): age 1 is column 0. */
export function runningAgeColumn(runningAge: number): number {
  return (runningAge - 1) % COLUMNS;
}
