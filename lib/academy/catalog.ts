export const academyProgrammes = [
  {
    id: "prestige",
    name: "Prestige Course",
    type: "short_course",
    duration: "Programme duration set by the academy",
    mentorship: "Confirm with academy",
    historicalStudents: 2100,
    description: "The academy's most popular programme.",
  },
  {
    id: "five-weeks",
    name: "5 Weeks Course",
    type: "short_course",
    duration: "5 weeks",
    mentorship: "Course completion terms set by the academy",
    historicalStudents: 1020,
    description: "A structured five-week forex training programme.",
  },
  {
    id: "legacy-trader",
    name: "Legacy Trader Programme",
    type: "advanced_mentorship",
    duration: "Set by the academy",
    mentorship: "Advanced programme conducted by the company CEO",
    historicalStudents: 80,
    description: "A smaller, advanced programme led by the company CEO.",
  },
] as const;

export const studentLifecycle = [
  "prospect",
  "lead",
  "applied",
  "enrolled",
  "active",
  "completed",
  "alumni",
  "lifetime_mentorship",
  "returning",
] as const;
