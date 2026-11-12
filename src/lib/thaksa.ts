export type Planet = "อาทิตย์" | "จันทร์" | "อังคาร" | "พุธ" | "เสาร์" | "พฤหัสบดี" | "ราหู" | "ศุกร์";
export type Role = "บริวาร" | "อายุ" | "เดช" | "ศรี" | "มูละ" | "อุตสาหะ" | "มนตรี" | "กาลกิณี";

export interface NameLetter {
  char: string;
  planet: Planet;
  role: Role;
}

/** Thaksa wheel order (not weekday order). */
const WHEEL: Planet[] = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "เสาร์", "พฤหัสบดี", "ราหู", "ศุกร์"];
const ROLES: Role[] = ["บริวาร", "อายุ", "เดช", "ศรี", "มูละ", "อุตสาหะ", "มนตรี", "กาลกิณี"];
/** Ruling planet per weekday, Sunday = 1. */
const DAY_PLANET: Planet[] = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const WEDNESDAY = 4;

// Tone marks, ์, ็, ๆ, ฯ and the rare ฤ ฦ are not in any group and are skipped.
const LETTER_GROUPS: Record<Planet, string> = {
  อาทิตย์: "อะัาำิีึืุูเแโใไ",
  จันทร์: "กขฃคฅฆง",
  อังคาร: "จฉชซฌญ",
  พุธ: "ฎฏฐฑฒณ",
  เสาร์: "ดตถทธน",
  พฤหัสบดี: "บปผฝพฟภม",
  ราหู: "ยรลว",
  ศุกร์: "ศษสหฬฮ",
};

const LETTER_PLANET = new Map<string, Planet>(
  WHEEL.flatMap((planet) => [...LETTER_GROUPS[planet]].map((char) => [char, planet] as const)),
);

/** Role of each planet for a birth weekday (Sunday = 1). Wednesday after 18:00 is ruled by Rahu. */
export function thaksaRoles(weekday: number, isNight: boolean): Record<Planet, Role> {
  const ruler = weekday === WEDNESDAY && isNight ? "ราหู" : DAY_PLANET[weekday - 1];
  const start = WHEEL.indexOf(ruler);
  return Object.fromEntries(
    ROLES.map((role, i) => [WHEEL[(start + i) % WHEEL.length], role]),
  ) as Record<Planet, Role>;
}

export function analyzeName(name: string, weekday: number, isNight: boolean): NameLetter[] {
  const roles = thaksaRoles(weekday, isNight);
  return [...name].flatMap((char) => {
    const planet = LETTER_PLANET.get(char);
    return planet ? [{ char, planet, role: roles[planet] }] : [];
  });
}
