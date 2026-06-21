import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    tables: [
      { name: "users",         rowCount: 248,  columns: [{ name: "id", type: "uuid" }, { name: "email", type: "text" }, { name: "created_at", type: "timestamptz" }, { name: "plan", type: "text" }, { name: "country", type: "text" }] },
      { name: "subscriptions", rowCount: 4,    columns: [{ name: "id", type: "uuid" }, { name: "user_id", type: "uuid" }, { name: "plan", type: "text" }, { name: "started_at", type: "timestamptz" }, { name: "status", type: "text" }] },
      { name: "profiles",      rowCount: 248,  columns: [{ name: "user_id", type: "uuid" }, { name: "display_name", type: "text" }, { name: "avatar_url", type: "text" }, { name: "bio", type: "text" }] },
      { name: "chat_messages", rowCount: 1820, columns: [{ name: "id", type: "uuid" }, { name: "user_id", type: "uuid" }, { name: "role", type: "text" }, { name: "content", type: "text" }, { name: "created_at", type: "timestamptz" }] },
      { name: "referrals",     rowCount: 38,   columns: [{ name: "referrer_id", type: "uuid" }, { name: "referee_email", type: "text" }, { name: "status", type: "text" }, { name: "created_at", type: "timestamptz" }] },
      { name: "seeds",         rowCount: 86,   columns: [{ name: "id", type: "uuid" }, { name: "user_id", type: "uuid" }, { name: "category", type: "text" }, { name: "content", type: "text" }, { name: "created_at", type: "timestamptz" }] },
    ],
  });
}
