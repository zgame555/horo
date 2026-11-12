import { Chip } from "@heroui/react";
import type { DashaPeriod, PlanetKey } from "../../lib/dasha";

export interface ScoredPeriod extends DashaPeriod {
  score: number;
}

interface DashaSectionProps {
  periods: ScoredPeriod[];
  birth: number;
  now: number;
  isTimeAssumed: boolean;
}

const YEAR_MS = 365.25 * 86_400_000;
const MAX_AGE = 90;
const UPCOMING_COUNT = 6;
const GOOD_SCORE = 70;
const FAIR_SCORE = 55;
const WIDTH = 720;
const HEIGHT = 280;
const PAD = { top: 26, right: 12, bottom: 34, left: 34 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const PLANET_TH: Record<PlanetKey, string> = {
  Sun: "อาทิตย์", Moon: "จันทร์", Mars: "อังคาร", Mercury: "พุธ", Jupiter: "พฤหัส",
  Venus: "ศุกร์", Saturn: "เสาร์", Rahu: "ราหู", Ketu: "เกตุ",
};

const PLANET_THEME: Record<PlanetKey, string> = {
  Sun: "ตำแหน่ง ชื่อเสียง และผู้ใหญ่",
  Moon: "อารมณ์ ครอบครัว และการเปลี่ยนแปลง",
  Mars: "การลงมือทำ การแข่งขัน และความกล้า",
  Mercury: "การค้า การสื่อสาร และการเรียนรู้",
  Jupiter: "ความรู้ ผู้อุปถัมภ์ และการขยายตัว",
  Venus: "ความรัก ความสบาย และศิลปะ",
  Saturn: "ความรับผิดชอบ งานหนัก และการสะสมช้าแต่มั่นคง",
  Rahu: "ความทะเยอทะยาน ของใหม่ และต่างถิ่น",
  Ketu: "การปล่อยวางและเรื่องภายในใจ",
};

const scoreColor = (score: number): "success" | "warning" | "danger" =>
  score >= GOOD_SCORE ? "success" : score >= FAIR_SCORE ? "warning" : "danger";

function thaiDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${TH_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear() + 543}`;
}

export function DashaSection({ periods, birth, now, isTimeAssumed }: DashaSectionProps) {
  const age = (ms: number): number => (ms - birth) / YEAR_MS;
  const x = (years: number): number => PAD.left + (PLOT_W * years) / MAX_AGE;
  const y = (score: number): number => PAD.top + PLOT_H * (1 - score / 100);

  const path = periods
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(age(p.start))},${y(p.score)} L${x(age(p.end))},${y(p.score)}`)
    .join(" ");
  const majors = periods.reduce<{ major: PlanetKey; start: number; end: number }[]>((acc, p) => {
    const last = acc.at(-1);
    return last && last.major === p.major
      ? [...acc.slice(0, -1), { ...last, end: p.end }]
      : [...acc, { major: p.major, start: p.start, end: p.end }];
  }, []);
  const currentIndex = periods.findIndex((p) => p.start <= now && now < p.end);
  const upcoming = currentIndex >= 0 ? periods.slice(currentIndex, currentIndex + UPCOMING_COUNT) : [];
  const nowAge = age(now);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="dasha-heading">
      <h2 id="dasha-heading" className="text-2xl font-bold">
        กราฟชีวิตตามช่วงอายุ 0–90 ปี
      </h2>
      <p className="text-muted text-sm">
        แบ่งช่วงชีวิตตามวิมโษตรีทศา (ระบบช่วงชีวิตตามตำแหน่งดวงจันทร์ตอนเกิด) คะแนน 0–100
        มาจากกำลังของดาวเจ้าช่วงนั้น เป็นค่าเปรียบเทียบระหว่างช่วงของคุณเอง ไม่ใช่ค่าวัดได้
      </p>
      {isTimeAssumed && (
        <p className="text-sm text-[var(--zone-mid)]">
          ไม่ได้ใส่เวลาเกิด จึงใช้ 12:00 น. วันที่เริ่มและจบของแต่ละช่วงอาจคลาดได้หลายเดือน
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white p-3">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block w-full min-w-[600px]"
          role="img"
          aria-label="กราฟคะแนนช่วงชีวิตตั้งแต่อายุ 0 ถึง 90 ปี รายละเอียดช่วงข้างหน้าอยู่ในรายการด้านล่าง"
        >
          {majors.map((m, i) => (
            <g key={m.start}>
              <rect
                x={x(age(m.start))}
                y={PAD.top}
                width={x(age(m.end)) - x(age(m.start))}
                height={PLOT_H}
                fill="var(--accent)"
                opacity={i % 2 === 0 ? 0.07 : 0.02}
              />
              <text x={(x(age(m.start)) + x(age(m.end))) / 2} y={PAD.top - 8} textAnchor="middle" fontSize={12} fill="var(--foreground)">
                {PLANET_TH[m.major]}
              </text>
            </g>
          ))}
          {[0, 50, 100].map((score) => (
            <text key={score} x={PAD.left - 6} y={y(score) + 4} textAnchor="end" fontSize={11} fill="var(--foreground)" opacity={0.6}>
              {score}
            </text>
          ))}
          {[0, 15, 30, 45, 60, 75, 90].map((years) => (
            <text key={years} x={x(years)} y={HEIGHT - 12} textAnchor="middle" fontSize={11} fill="var(--foreground)" opacity={0.6}>
              {years}
            </text>
          ))}
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
          {nowAge >= 0 && nowAge <= MAX_AGE && (
            <g>
              <line x1={x(nowAge)} x2={x(nowAge)} y1={PAD.top} y2={PAD.top + PLOT_H} stroke="var(--zone-bad)" strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={x(nowAge) + 4} y={PAD.top + PLOT_H - 6} fontSize={11} fontWeight={600} fill="var(--zone-bad)">
                ตอนนี้
              </text>
            </g>
          )}
        </svg>
      </div>
      <ol className="flex flex-col gap-2">
        {upcoming.map((p, i) => (
          <li
            key={p.start}
            aria-current={i === 0 ? "true" : undefined}
            className={`grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 rounded-xl border bg-white px-4 py-3 ${
              i === 0 ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-[var(--line)]"
            }`}
          >
            <span className="font-semibold">
              {PLANET_TH[p.major]} / {PLANET_TH[p.minor]}
              {i === 0 && <span className="text-muted font-normal"> · ช่วงปัจจุบัน</span>}
            </span>
            <Chip color={scoreColor(p.score)} size="sm" variant="soft">
              {p.score}
            </Chip>
            <span className="text-muted col-span-2 text-sm">
              {thaiDate(p.start)} – {thaiDate(p.end)} · เด่นเรื่อง{PLANET_THEME[p.minor]}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
