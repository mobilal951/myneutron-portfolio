import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    events: [
      { eventName: "page_view",                   eventCount: 4280 },
      { eventName: "session_start",               eventCount: 1856 },
      { eventName: "first_visit",                 eventCount: 826  },
      { eventName: "scroll",                      eventCount: 712  },
      { eventName: "user_engagement",             eventCount: 642  },
      { eventName: "btn_Get_Started_free",        eventCount: 188  },
      { eventName: "btn_google_signin",           eventCount: 142  },
      { eventName: "btn_Sign_In",                 eventCount: 124  },
      { eventName: "btn_Header_Pricing",          eventCount: 96   },
      { eventName: "btn_Header_Register_Now",     eventCount: 84   },
      { eventName: "btn_start_for_free",          eventCount: 72   },
      { eventName: "btn_Buy_Medium",              eventCount: 48   },
      { eventName: "btn_Buy_Small",               eventCount: 41   },
      { eventName: "btn_Buy_Large",               eventCount: 22   },
      { eventName: "btn_Upgrade_Pro",             eventCount: 31   },
      { eventName: "btn_Upgrade_Basic",           eventCount: 27   },
      { eventName: "btn_Need_Credits",            eventCount: 18   },
      { eventName: "btn_Start_Project",           eventCount: 16   },
      { eventName: "btn_Header_Resources",        eventCount: 14   },
      { eventName: "btn_LaunchApp_Blogpage",      eventCount: 12   },
      { eventName: "btn_View_Articles",           eventCount: 8    },
      { eventName: "btn_Resources_Blogs",         eventCount: 7    },
      { eventName: "btn_Resources_FAQs",          eventCount: 6    },
      { eventName: "btn_Resources_Guidelines",    eventCount: 5    },
      { eventName: "btn_View_FAQs",               eventCount: 4    },
      { eventName: "btn_verification_code",       eventCount: 3    },
      { eventName: "btn_wallet_signin",           eventCount: 2    },
    ],
  });
}
