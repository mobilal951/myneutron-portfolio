import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ageGroups: [
      { ageGroup: "18-24", users: 142 },
      { ageGroup: "25-34", users: 386 },
      { ageGroup: "35-44", users: 281 },
      { ageGroup: "45-54", users: 168 },
      { ageGroup: "55-64", users: 87  },
      { ageGroup: "65+",   users: 36  },
    ],
    gender: [
      { gender: "male",   users: 744 },
      { gender: "female", users: 496 },
    ],
  });
}
