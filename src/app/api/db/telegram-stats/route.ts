import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const msgs = distribute(412, 30, 71);
  const subs = distribute(18, 30, 72);
  return NextResponse.json({
    subscribers: 142,
    activeChats: 38,
    messagesToday: 24,
    byDay: dates.map((date, i) => ({ date, messages: msgs[i], new_subscribers: subs[i] })),
  });
}
