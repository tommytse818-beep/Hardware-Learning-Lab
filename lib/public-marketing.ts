export const publicProduct = {
  name: "DrawerSense Mini",
  legacyName: "OpenGuard Mini",
  projectHref: "/projects/open-guard-mini",
  previewHref: "/courses/open-guard-mini/preview",
  status: "First project in development",
  tagline: "A drawer reminder. A whole engineering lesson.",
  qualification:
    "Concept hardware illustration. Physical qualification is required before school delivery.",
  sequence: ["Open", "Wait", "Remind", "Close / reset"],
  boundaries: [
    "No motor or automatic closing",
    "No app required",
    "No required microcontroller firmware",
    "Not a lock or certified security system",
  ],
} as const;

export const programmeStages = [
  {
    number: "01",
    title: "Electronic concepts",
    text: "Components, signals and logic. Predict what should happen.",
  },
  {
    number: "02",
    title: "Breadboard build / test",
    text: "Build in school. Measure. Troubleshoot with an instructor.",
  },
  {
    number: "03",
    title: "KiCad schematic & PCB design",
    text: "Capture the schematic, use SnapEDA symbols and footprints, then develop a two-layer PCB. Check imported parts against their datasheets.",
  },
] as const;

export const programmeDelivery = {
  weeks: 3,
  liveSessions: 6,
  schoolPracticals: 2,
  practicalMinutes: 150,
  plannedRecordings: 28,
  estimatedHours: "16–18",
  estimateNote: "Planning estimate, subject to beginner pilot and scheduling.",
} as const;

export const programmePackages = [
  {
    id: "pilot",
    name: "Pilot cohort",
    maxLearners: 12,
    priceHkd: 32000,
    seats: "Up to 12 learners",
    price: "HK$32,000",
    perLearner: "≈ HK$2,670 per learner at full capacity",
    badge: "Getting started",
    featured: false,
    summary: "A small cohort for an educator review, pilot or first school delivery.",
    features: [
      "6 bench pairs",
      "Instructor plus soldering support",
      "Written cohort outcome report",
    ],
  },
  {
    id: "class",
    name: "Class programme",
    maxLearners: 25,
    priceHkd: 52000,
    seats: "Up to 25 learners",
    price: "HK$52,000",
    perLearner: "HK$2,080 per learner at full capacity",
    badge: "Designed for one class",
    featured: true,
    summary: "One timetabled class with paired practical work and individual review.",
    features: [
      "Paired bench work",
      "Instructor plus subject teacher",
      "Teacher plans and marking rubric",
    ],
  },
  {
    id: "double",
    name: "Double cohort",
    maxLearners: 50,
    priceHkd: 94000,
    seats: "Up to 50 learners",
    price: "HK$94,000",
    perLearner: "HK$1,880 per learner at full capacity",
    badge: "At scale",
    featured: false,
    summary: "Two groups of 25 with staffing and reporting agreed for both groups.",
    features: [
      "Two groups of 25",
      "Two instructors plus school staff",
      "Per-class and combined reporting",
    ],
  },
] as const;

export type ComparisonCoverage = "included" | "prototype-listed" | "not-listed";

export const programmeComparison = {
  benchmarkDate: "11 September 2026",
  columns: ["Electronic concepts", "Breadboard build / test", "Custom PCB design"],
  offers: [
    {
      id: "hll",
      provider: "Hardware Learning Lab",
      offer: "Proposed school programme",
      coverage: ["included", "included", "included"] as ComparisonCoverage[],
      teaching: "6 live sessions for a school cohort",
      price: "HK$2,080 per learner at full 25-learner capacity",
      source: "Hardware Learning Lab proposal",
    },
    {
      id: "arduino",
      provider: "Arduino",
      offer: "CTC GO! Core",
      coverage: ["included", "included", "not-listed"] as ComparisonCoverage[],
      teaching: "Teacher-led classroom kit; training and resources supplied",
      price: "≈ HK$16,650 per classroom kit for up to 24 learners",
      source: "https://store.arduino.cc/products/arduino-ctc-go-core-module",
    },
    {
      id: "blueinno",
      provider: "Blueinno",
      offer: "Arduino for Invention",
      coverage: ["included", "prototype-listed", "not-listed"] as ComparisonCoverage[],
      teaching: "15 hours of centre-based live teaching",
      price: "HK$6,680 per learner per module",
      source: "https://blueinnotechnology.com/arduino-regular/",
    },
    {
      id: "futurekids",
      provider: "Futurekids",
      offer: "Arduino AIoT Trailblazer",
      coverage: ["included", "prototype-listed", "not-listed"] as ComparisonCoverage[],
      teaching: "12-hour holiday camp",
      price: "HK$4,620 per learner, plus HK$180 new-student registration",
      source: "https://www.futurekids.com.hk/Camp/Age13OrAbove/Arduino_Trailblazer",
    },
  ],
  qualification:
    "Published programme benchmarks; different ages, formats and price units. ‘Not listed’ is not ‘unavailable’. No like-for-like savings claim. HLL prices assume a full cohort.",
} as const;

export const publicTeam = [
  { id: "tommy-tse", name: "Tommy Tse", role: "Founder & Programme Lead" },
  { id: "kitty-wong", name: "Kitty Wong", role: "Marketing & Customer Service Lead" },
  {
    id: "edison-chan",
    name: "Edison Chan",
    role: "Web Integration Lead & AI Bot Developer",
  },
  { id: "shi-zheng-hang", name: "Zheng Hang Shi", role: "AI Bot Integration Lead" },
  { id: "jack-ho", name: "Jack Ho", role: "Web UI Developer" },
  { id: "shi-lin-han", name: "Yi Lin Shi", role: "Course Design Assistant" },
] as const;
