import { Chip } from "@heroui/react";
import type { GraphColumn } from "../../lib/lifeGraph";
import { ZONE_CHIP } from "./zone";

export interface OutlookItem {
  label: string;
  sublabel?: string;
  column: GraphColumn;
  isCurrent: boolean;
}

interface OutlookProps {
  headingId: string;
  heading: string;
  note: string;
  items: OutlookItem[];
}

export function Outlook({ headingId, heading, note, items }: OutlookProps) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-2xl font-bold">
        {heading}
      </h2>
      <p className="text-muted text-sm">{note}</p>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.label}
            aria-current={item.isCurrent ? "true" : undefined}
            className={`flex flex-col gap-1 rounded-xl border bg-white px-3 py-2 ${
              item.isCurrent ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-[var(--line)]"
            }`}
          >
            <span className="text-sm font-semibold">{item.label}</span>
            {item.sublabel && <span className="text-muted text-xs">{item.sublabel}</span>}
            <span className="text-sm">
              {item.column.house} · {item.column.value}
            </span>
            <Chip className="self-start" color={ZONE_CHIP[item.column.zone]} size="sm" variant="soft">
              {item.column.zone}
            </Chip>
          </li>
        ))}
      </ol>
    </section>
  );
}
