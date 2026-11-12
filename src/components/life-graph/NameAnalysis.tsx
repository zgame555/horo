import { Chip } from "@heroui/react";
import type { NameLetter, Role } from "../../lib/thaksa";

interface NameAnalysisProps {
  name: string;
  letters: NameLetter[];
}

const ROLE_MEANING: Record<Role, string> = {
  บริวาร: "คนรอบตัว ลูกน้อง ครอบครัว",
  อายุ: "สุขภาพและความเป็นอยู่",
  เดช: "อำนาจ ตำแหน่ง ความน่าเกรงขาม",
  ศรี: "โชคลาภ เสน่ห์ เงินทอง",
  มูละ: "หลักฐาน ทรัพย์สิน บ้านที่ดิน",
  อุตสาหะ: "ความขยันและการงาน",
  มนตรี: "ผู้ใหญ่อุปถัมภ์",
  กาลกิณี: "อักษรที่ตำราถือว่าไม่เป็นมงคล",
};

export function NameAnalysis({ name, letters }: NameAnalysisProps) {
  const kalakini = letters.filter((l) => l.role === "กาลกิณี");
  const roles = [...new Set(letters.map((l) => l.role))];

  return (
    <section className="flex flex-col gap-3" aria-labelledby="name-heading">
      <h2 id="name-heading" className="text-2xl font-bold">
        ทักษาของชื่อ “{name}”
      </h2>
      <p>
        {kalakini.length === 0
          ? "ชื่อนี้ไม่มีอักษรกาลกิณี"
          : `ชื่อนี้มีอักษรกาลกิณี ${kalakini.length} ตัว: ${kalakini.map((l) => l.char).join(" ")}`}
      </p>
      <ul className="flex flex-wrap gap-2">
        {letters.map((letter, i) => (
          <li
            key={`${letter.char}-${i}`}
            className="flex min-w-16 flex-col items-center gap-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          >
            <span className="text-xl font-semibold">{letter.char === "ั" || /[ิ-ูำ]/.test(letter.char) ? `◌${letter.char}` : letter.char}</span>
            <Chip color={letter.role === "กาลกิณี" ? "danger" : "default"} size="sm" variant="soft">
              {letter.role}
            </Chip>
          </li>
        ))}
      </ul>
      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {roles.map((role) => (
          <div key={role} className="flex gap-2">
            <dt className="font-semibold">{role}</dt>
            <dd className="text-muted">{ROLE_MEANING[role]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
