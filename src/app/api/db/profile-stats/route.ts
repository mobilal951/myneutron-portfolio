import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    summary: {
      totalUsers: 248,
      completedProfiles: 144,
      incompleteProfiles: 104,
      completionRate: 58.1,
    },
    usageTypes: [
      { type: "Personal Knowledge Base", count: 96, percentage: 38.7 },
      { type: "Customer Support",        count: 64, percentage: 25.8 },
      { type: "Research Assistant",      count: 42, percentage: 16.9 },
      { type: "Internal Docs",           count: 28, percentage: 11.3 },
      { type: "Other",                   count: 18, percentage: 7.3  },
    ],
    fieldCompletion: {
      displayName: { filled: 232, percentage: 93.5 },
      avatarUrl:   { filled: 184, percentage: 74.2 },
      bio:         { filled: 142, percentage: 57.3 },
      profession:  { filled: 128, percentage: 51.6 },
      industry:    { filled: 112, percentage: 45.2 },
      country:     { filled: 196, percentage: 79.0 },
      gender:      { filled: 84,  percentage: 33.9 },
    },
    demographics: {
      professions: [
        { value: "Software Engineer",        count: 64 },
        { value: "Product Manager",          count: 38 },
        { value: "Marketing",                count: 32 },
        { value: "Founder / CEO",            count: 22 },
        { value: "Data Analyst",             count: 18 },
        { value: "Designer",                 count: 14 },
        { value: "Researcher",               count: 12 },
      ],
      industries: [
        { value: "Tech / SaaS",              count: 88 },
        { value: "Marketing & Media",        count: 42 },
        { value: "Finance",                  count: 28 },
        { value: "Education",                count: 24 },
        { value: "Healthcare",               count: 18 },
        { value: "E-commerce",               count: 16 },
        { value: "Consulting",               count: 12 },
      ],
      genders: [
        { value: "Male",                     count: 144 },
        { value: "Female",                   count: 78  },
        { value: "Non-binary",               count: 10  },
        { value: "Prefer not to say",        count: 16  },
      ],
      countries: [
        { value: "United States",            count: 84 },
        { value: "United Kingdom",           count: 32 },
        { value: "Pakistan",                 count: 24 },
        { value: "India",                    count: 22 },
        { value: "Germany",                  count: 14 },
        { value: "Canada",                   count: 12 },
        { value: "Australia",                count: 10 },
        { value: "United Arab Emirates",     count: 8  },
      ],
    },
  });
}
