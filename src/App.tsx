import { Button, Card, Chip, DateField, Description, FieldError, Form, I18nProvider, Label } from "@heroui/react";
import { type CalendarDate, GregorianCalendar, getLocalTimeZone, toCalendar, today } from "@internationalized/date";
import { type FormEvent, useState } from "react";
import { LifeGraphChart } from "./components/life-graph/LifeGraphChart";
import { type GraphColumn, type Zone, currentMonthColumn, lifeGraph, runningAgeColumn } from "./lib/lifeGraph";

const ZONE_CHIP: Record<Zone, "success" | "warning" | "danger"> = {
  สวรรค์: "success",
  โลกมนุษย์: "warning",
  นรกภูมิ: "danger",
};

const ZONE_ADVICE: Record<Zone, string> = {
  สวรรค์: "ช่วงส่งเสริม เหมาะเริ่มของใหม่และเปิดตัว",
  โลกมนุษย์: "ช่วงกลาง ๆ ได้ผลตามแรงที่ลง",
  นรกภูมิ: "ช่วงควรระวัง เน้นเก็บงานและไม่เสี่ยงเรื่องใหญ่",
};

interface Reading {
  graph: GraphColumn[];
  monthColumn: number;
  yearColumn: number;
  runningAge: number;
}

function buildReading(birth: CalendarDate): Reading {
  const now = today(getLocalTimeZone());
  const born = toCalendar(birth, new GregorianCalendar());
  const hadBirthday = now.month > born.month || (now.month === born.month && now.day >= born.day);
  const runningAge = now.year - born.year + (hadBirthday ? 1 : 0);
  return {
    graph: lifeGraph(born.year, born.month, born.day),
    monthColumn: currentMonthColumn(born.month, now.month),
    yearColumn: runningAgeColumn(Math.max(runningAge, 1)),
    runningAge,
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
  const [reading, setReading] = useState<Reading | null>(null);
  const maxDate = today(getLocalTimeZone());

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (birth) setReading(buildReading(birth));
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-5 pt-12 pb-20">
      <header className="flex flex-col gap-3">
        <p className="text-sm tracking-wide text-[var(--accent)]">กราฟชีวิต · Life graph</p>
        <h1 className="text-4xl font-bold sm:text-5xl">ดูจังหวะชีวิตของคุณเป็นกราฟ ไม่ใช่ข้อความยาว</h1>
        <p className="max-w-[60ch] text-lg">
          ใส่วันเกิด แล้วดูกราฟเลข 12 ตัวของคุณทันที พร้อมสถานะของเดือนนี้และปีนี้ คำนวณในเครื่องของคุณ
          ไม่ส่งวันเกิดไปที่ไหน
        </p>
      </header>

      <Form className="flex flex-wrap items-end gap-4" onSubmit={handleSubmit}>
        <I18nProvider locale="th-TH-u-ca-buddhist">
          <DateField
            isRequired
            className="w-64"
            name="birth"
            value={birth}
            maxValue={maxDate}
            onChange={setBirth}
          >
            <Label>วันเกิด (วัน/เดือน/ปี พ.ศ.)</Label>
            <DateField.Group>
              <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
            </DateField.Group>
            <Description>เช่น 15/4/2535</Description>
            <FieldError />
          </DateField>
        </I18nProvider>
        <Button type="submit" variant="primary">
          ดูกราฟชีวิต
        </Button>
      </Form>

      {reading && (
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
          <p className="text-muted text-sm">
            กราฟนี้เป็นความเชื่อส่วนบุคคลเชิงเปรียบเทียบ ไม่ใช่คำแนะนำการเงินหรือสุขภาพ คิดจากวันเกิดตามปฏิทินสากล
            คนที่เกิดก่อนพระอาทิตย์ขึ้นหรือช่วงต้นปีก่อนสงกรานต์ ผลอาจต่างจากตำราบางสำนัก
          </p>
        </section>
      )}
    </main>
  );
}
