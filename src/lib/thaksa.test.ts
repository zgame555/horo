import { expect, test } from "vitest";
import { analyzeName, thaksaRoles } from "./thaksa";

test("Wednesday daytime birth starts the role wheel at Mercury", () => {
  expect(thaksaRoles(4, false)).toEqual({
    พุธ: "บริวาร", เสาร์: "อายุ", พฤหัสบดี: "เดช", ราหู: "ศรี",
    ศุกร์: "มูละ", อาทิตย์: "อุตสาหะ", จันทร์: "มนตรี", อังคาร: "กาลกิณี",
  });
});

test("Wednesday night birth starts the wheel at Rahu instead", () => {
  expect(thaksaRoles(4, true).ราหู).toBe("บริวาร");
  expect(thaksaRoles(4, true).พฤหัสบดี).toBe("กาลกิณี");
});

test("night flag is ignored on other weekdays", () => {
  expect(thaksaRoles(1, true)).toEqual(thaksaRoles(1, false));
});

test("maps each letter of a name to its planet and role, skipping tone marks", () => {
  const letters = analyzeName("ก้านดา", 4, false);

  expect(letters.map((l) => [l.char, l.planet, l.role])).toEqual([
    ["ก", "จันทร์", "มนตรี"],
    ["า", "อาทิตย์", "อุตสาหะ"],
    ["น", "เสาร์", "อายุ"],
    ["ด", "เสาร์", "อายุ"],
    ["า", "อาทิตย์", "อุตสาหะ"],
  ]);
});

test("flags kalakini letters", () => {
  expect(analyzeName("ญ", 4, false)[0].role).toBe("กาลกิณี");
});
