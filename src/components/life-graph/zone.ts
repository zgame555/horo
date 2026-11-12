import type { Zone } from "../../lib/lifeGraph";

export const ZONE_CHIP: Record<Zone, "success" | "warning" | "danger"> = {
  สวรรค์: "success",
  โลกมนุษย์: "warning",
  นรกภูมิ: "danger",
};

export const ZONE_ADVICE: Record<Zone, string> = {
  สวรรค์: "ช่วงส่งเสริม เหมาะเริ่มของใหม่และเปิดตัว",
  โลกมนุษย์: "ช่วงกลาง ๆ ได้ผลตามแรงที่ลง",
  นรกภูมิ: "ช่วงควรระวัง เน้นเก็บงานและไม่เสี่ยงเรื่องใหญ่",
};
