import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    table: "users",
    rows: [
      { id: "u_001", email: "maya.patel@example.com",     created_at: "2026-05-12T10:14:00Z", plan: "free",  country: "US" },
      { id: "u_002", email: "sam.carter@example.com",   created_at: "2026-05-14T08:21:00Z", plan: "free",  country: "FI" },
      { id: "u_003", email: "priya.sharma@example.com",   created_at: "2026-05-18T16:45:00Z", plan: "basic", country: "UK" },
      { id: "u_004", email: "noah.brooks@example.com",    created_at: "2026-05-22T11:02:00Z", plan: "free",  country: "UK" },
      { id: "u_005", email: "zoe.martinez@example.com", created_at: "2026-05-30T14:19:00Z", plan: "free",  country: "US" },
      { id: "u_006", email: "aaron.chen@example.com",  created_at: "2026-06-02T09:51:00Z", plan: "pro",   country: "US" },
      { id: "u_007", email: "jordan.lee@example.com",  created_at: "2026-06-09T12:33:00Z", plan: "free",  country: "NL" },
      { id: "u_008", email: "riya.khan@example.com",created_at: "2026-06-14T17:08:00Z", plan: "free", country: "US" },
    ],
    total: 248,
  });
}
