import {
  Button, Card, Checkbox, Chip, DateField, Description, FieldError, Form, I18nProvider, Input, Label, TextField,
  TimeField,
} from "@heroui/react";
import {
  type CalendarDate, GregorianCalendar, type Time, getLocalTimeZone, toCalendar, today,
} from "@internationalized/date";
import { type FormEvent, useState } from "react";
import { DashaSection, type ScoredPeriod } from "./components/life-graph/DashaSection";
import { LifeGraphChart } from "./components/life-graph/LifeGraphChart";
import { NameAnalysis } from "./components/life-graph/NameAnalysis";
import { Outlook, type OutlookItem } from "./components/life-graph/Outlook";
import { ZONE_ADVICE, ZONE_CHIP } from "./components/life-graph/zone";
import { dashaPeriods, periodScore, planetStrengths } from "./lib/dasha";
import { siderealLongitudes } from "./lib/ephemeris";
import { type GraphColumn, currentMonthColumn, lifeGraph, runningAgeColumn, weekdayOf } from "./lib/lifeGraph";
import { type NameLetter, analyzeName } from "./lib/thaksa";

const TH_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const BE_OFFSET = 543;
const OUTLOOK_LENGTH = 12;
const WEDNESDAY = 4;
const MAX_NAME_LENGTH = 60;
const MAX_AGE = 90;
const NOON = 12;
// ponytail: birth time is read as Thailand time (UTC+7). Add a timezone picker for births abroad.
const THAI_UTC_OFFSET_HOURS = 7;

interface Reading {
  graph: GraphColumn[];
  monthColumn: number;
  yearColumn: number;
  runningAge: number;
  years: OutlookItem[];
  months: OutlookItem[];
  name: string;
  letters: NameLetter[];
  periods: ScoredPeriod[];
  birthMs: number;
  nowMs: number;
  isTimeAssumed: boolean;
}

function toGregorian(date: CalendarDate): CalendarDate {
  return toCalendar(date, new GregorianCalendar());
}

function buildReading(birth: CalendarDate, time: Time | null, name: string, isNight: boolean): Reading {
  const now = today(getLocalTimeZone());
  const born = toGregorian(birth);
  const graph = lifeGraph(born.year, born.month, born.day);
  const hadBirthday = now.month > born.month || (now.month === born.month && now.day >= born.day);
  const runningAge = Math.max(now.year - born.year + (hadBirthday ? 1 : 0), 1);
  const monthColumn = currentMonthColumn(born.month, now.month);

  const years = Array.from({ length: OUTLOOK_LENGTH }, (_, i): OutlookItem => {
    const age = runningAge + i;
    const startYear = born.year + age - 1 + BE_OFFSET;
    return {
      label: `อายุย่าง ${age}`,
      sublabel: `${TH_MONTHS[born.month - 1]} ${startYear} – ${startYear + 1}`,
      column: graph[runningAgeColumn(age)],
      isCurrent: i === 0,
    };
  });

  const months = Array.from({ length: OUTLOOK_LENGTH }, (_, i): OutlookItem => {
    const monthIndex = (now.month - 1 + i) % 12;
    const year = now.year + Math.floor((now.month - 1 + i) / 12) + BE_OFFSET;
    return {
      label: `${TH_MONTHS[monthIndex]} ${String(year).slice(-2)}`,
      column: graph[currentMonthColumn(born.month, monthIndex + 1)],
      isCurrent: i === 0,
    };
  });

  const birthMs = Date.UTC(
    born.year, born.month - 1, born.day, (time?.hour ?? NOON) - THAI_UTC_OFFSET_HOURS, time?.minute ?? 0,
  );
  const chart = siderealLongitudes(birthMs);
  const strengths = planetStrengths(chart);
  const periods = dashaPeriods(chart.Moon, birthMs, MAX_AGE).map(
    (p): ScoredPeriod => ({ ...p, score: periodScore(p.major, p.minor, strengths, chart) }),
  );

  return {
    graph, monthColumn, runningAge, years, months, name, periods, birthMs,
    nowMs: Date.now(),
    isTimeAssumed: time === null,
    yearColumn: runningAgeColumn(runningAge),
    letters: analyzeName(name, weekdayOf(born.year, born.month, born.day), isNight),
  };
}

interface StatusCardProps {
  title: string;
  column: GraphColumn;
}

function StatusCard({ title, column }: StatusCardProps) {
  return (
    <Card>
      <Card.Header>
        <Card.Description>{title}</Card.Description>
        <Card.Title className="flex flex-wrap items-center gap-2">
          ช่อง{column.house} · เลข {column.value}
          <Chip color={ZONE_CHIP[column.zone]} variant="soft">
            {column.zone}
          </Chip>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p>{ZONE_ADVICE[column.zone]}</p>
        <p className="text-muted text-sm">คู่สัมพันธ์: ช่อง{column.pair}</p>
      </Card.Content>
    </Card>
  );
}

export function App() {
  const [birth, setBirth] = useState<CalendarDate | null>(null);
  const [time, setTime] = useState<Time | null>(null);
  const [name, setName] = useState("");
  const [isNight, setIsNight] = useState(false);
  const [reading, setReading] = useState<Reading | null>(null);
  const maxDate = today(getLocalTimeZone());

  const born = birth ? toGregorian(birth) : null;
  const isWednesday = born !== null && weekdayOf(born.year, born.month, born.day) === WEDNESDAY;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (birth) setReading(buildReading(birth, time, name.trim(), isWednesday && isNight));
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-5 pt-12 pb-20">
      <header className="flex flex-col gap-3">
        <p className="text-sm tracking-wide text-[var(--accent)]">กราฟชีวิต · Life graph</p>
        <h1 className="text-4xl font-bold sm:text-5xl">ดูจังหวะชีวิตของคุณเป็นกราฟ ไม่ใช่ข้อความยาว</h1>
        <p className="max-w-[60ch] text-lg">
          ใส่วันเกิด แล้วดูกราฟเลข 12 ตัว กราฟชีวิต 0–90 ปี ดวงรายปี รายเดือน และทักษาของชื่อ คำนวณในเครื่องของคุณ
          ไม่ส่งข้อมูลไปที่ไหน
        </p>
      </header>

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-start gap-4">
          <I18nProvider locale="th-TH-u-ca-buddhist">
            <DateField isRequired className="w-64" name="birth" value={birth} maxValue={maxDate} onChange={setBirth}>
              <Label>วันเกิด (วัน/เดือน/ปี พ.ศ.)</Label>
              <DateField.Group>
                <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
              </DateField.Group>
              <Description>เช่น 15/4/2535</Description>
              <FieldError />
            </DateField>
          </I18nProvider>
          <TimeField className="w-40" hourCycle={24} name="time" value={time} onChange={setTime}>
            <Label>เวลาเกิด (ไม่บังคับ)</Label>
            <TimeField.Group>
              <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
            </TimeField.Group>
            <Description>เวลาประเทศไทย</Description>
          </TimeField>
          <TextField className="w-64" name="name" value={name} maxLength={MAX_NAME_LENGTH} onChange={setName}>
            <Label>ชื่อ (ไม่บังคับ)</Label>
            <Input placeholder="ชื่อจริงภาษาไทย" />
            <Description>ใช้ดูทักษาของชื่อ</Description>
          </TextField>
        </div>
        {isWednesday && (
          <Checkbox isSelected={isNight} name="night" onChange={setIsNight}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              เกิดวันพุธหลัง 18:00 น. (พุธกลางคืน)
            </Checkbox.Content>
          </Checkbox>
        )}
        <Button className="self-start" type="submit" variant="primary">
          ดูกราฟชีวิต
        </Button>
      </Form>

      {reading && (
        <>
          <section className="flex flex-col gap-5" aria-labelledby="result-heading">
            <h2 id="result-heading" className="text-2xl font-bold">
              กราฟชีวิตเลข 12 ตัวของคุณ
            </h2>
            <Card>
              <Card.Content>
                <LifeGraphChart graph={reading.graph} highlightColumn={reading.monthColumn} />
                <p className="text-muted text-sm">แถบสีม่วงคือเดือนนี้ จุดที่สูงคือด้านที่เด่นของชีวิต</p>
              </Card.Content>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatusCard title="เดือนนี้" column={reading.graph[reading.monthColumn]} />
              <StatusCard title={`ปีนี้ (อายุย่าง ${reading.runningAge})`} column={reading.graph[reading.yearColumn]} />
            </div>
          </section>

          <DashaSection
            periods={reading.periods}
            birth={reading.birthMs}
            now={reading.nowMs}
            isTimeAssumed={reading.isTimeAssumed}
          />
          <Outlook
            headingId="years-heading"
            heading="ดวงรายปี 12 ปีข้างหน้า"
            note="นับจากวันเกิดถึงวันเกิด อายุย่างแต่ละปีวนไปตกช่องหนึ่งของกราฟ"
            items={reading.years}
          />
          <Outlook
            headingId="months-heading"
            heading="ดวงรายเดือน 12 เดือนข้างหน้า"
            note="เดือนเกิดคือช่องแรกของกราฟ แล้ววนไปทีละเดือน"
            items={reading.months}
          />
          {reading.letters.length > 0 && <NameAnalysis name={reading.name} letters={reading.letters} />}

          <p className="text-muted text-sm">
            รายงานนี้เป็นความเชื่อส่วนบุคคลเชิงเปรียบเทียบ ไม่ใช่คำแนะนำการเงินหรือสุขภาพ คิดจากวันเกิดตามปฏิทินสากล
            คนที่เกิดก่อนพระอาทิตย์ขึ้นหรือช่วงต้นปีก่อนสงกรานต์ ผลอาจต่างจากตำราบางสำนัก
          </p>
        </>
      )}
    </main>
  );
}
