import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    table: "users",
    rows: [
      { id: "u_001", email: "ada@example.com",     created_at: "2026-05-12T10:14:00Z", plan: "free",  country: "US" },
      { id: "u_002", email: "linus@example.com",   created_at: "2026-05-14T08:21:00Z", plan: "free",  country: "FI" },
      { id: "u_003", email: "grace@example.com",   created_at: "2026-05-18T16:45:00Z", plan: "basic", country: "UK" },
      { id: "u_004", email: "alan@example.com",    created_at: "2026-05-22T11:02:00Z", plan: "free",  country: "UK" },
      { id: "u_005", email: "barbara@example.com", created_at: "2026-05-30T14:19:00Z", plan: "free",  country: "US" },
      { id: "u_006", email: "donald@example.com",  created_at: "2026-06-02T09:51:00Z", plan: "pro",   country: "US" },
      { id: "u_007", email: "edsger@example.com",  created_at: "2026-06-09T12:33:00Z", plan: "free",  country: "NL" },
      { id: "u_008", email: "katherine@example.com",created_at: "2026-06-14T17:08:00Z", plan: "free", country: "US" },
    ],
    total: 248,
  });
}
