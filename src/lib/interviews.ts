export const interviewTrackValues = ["FULLSTACK", "FRONTEND", "BACKEND", "DSA", "SYSTEM_DESIGN", "BEHAVIORAL"] as const;
export const experienceLevelValues = ["ENTRY", "MID", "SENIOR"] as const;

export const interviewTracks = [
  { value: "FULLSTACK", label: "Full-stack", description: "APIs, data, React, and architecture" },
  { value: "FRONTEND", label: "Frontend", description: "React, browser fundamentals, and UI systems" },
  { value: "BACKEND", label: "Backend", description: "APIs, databases, concurrency, and reliability" },
  { value: "DSA", label: "DSA", description: "Problem solving, complexity, and data structures" },
  { value: "SYSTEM_DESIGN", label: "System design", description: "Scale, trade-offs, and distributed systems" },
  { value: "BEHAVIORAL", label: "Behavioral", description: "Ownership, collaboration, and decision making" },
] as const;

export const experienceLevels = [
  { value: "ENTRY", label: "Entry level", description: "Intern and new graduate roles" },
  { value: "MID", label: "Mid level", description: "Engineers with 2 to 5 years of experience" },
  { value: "SENIOR", label: "Senior", description: "Technical leadership and architecture" },
] as const;

export type InterviewTrackValue = (typeof interviewTrackValues)[number];
export type ExperienceLevelValue = (typeof experienceLevelValues)[number];
export type InterviewModeValue = "AI" | "PEER";

export const questionBank: Record<InterviewTrackValue, string[]> = {
  FULLSTACK: [
    "Walk me through how you would design authentication for a Next.js application with a separate API service.",
    "A page is fast locally but slow in production. How would you isolate whether the bottleneck is the browser, API, or database?",
    "How would you keep a write to PostgreSQL and a realtime update consistent when either operation can fail?",
    "Explain a technical trade-off you made between shipping quickly and keeping the system maintainable.",
    "Design a notification feature that works across web and mobile clients without sending duplicates.",
  ],
  FRONTEND: [
    "Explain what happens from the moment a user clicks a React button until the updated UI appears.",
    "How would you diagnose and fix unnecessary rerenders in a large React screen?",
    "Design an accessible autocomplete that works with a keyboard and a screen reader.",
    "When would you choose server rendering over client rendering in Next.js?",
    "How would you prevent stale data when two browser tabs edit the same record?",
  ],
  BACKEND: [
    "Design an idempotent API endpoint for creating a payment or booking.",
    "How would you investigate a PostgreSQL query that became slow as the table grew?",
    "Explain how you would handle retries without processing the same event twice.",
    "What consistency guarantees would you choose for a collaborative application, and why?",
    "How would you protect a public API from abuse while keeping normal clients responsive?",
  ],
  DSA: [
    "Given a stream of numbers, how would you maintain the median after each insertion?",
    "Find the shortest path through a grid with blocked cells. Explain the algorithm and its complexity.",
    "How would you detect whether a linked list contains a cycle without extra memory?",
    "Design a least recently used cache with constant-time reads and writes.",
    "Given overlapping intervals, explain how you would merge them and analyze the complexity.",
  ],
  SYSTEM_DESIGN: [
    "Design a video interview platform that supports thousands of concurrent rooms.",
    "How would you design a URL shortener and prevent popular links from overloading the database?",
    "Design a chat service with message ordering, offline delivery, and multiple devices per user.",
    "How would you build a metrics pipeline that accepts millions of events per minute?",
    "Design a collaborative document editor and explain how clients resolve concurrent changes.",
  ],
  BEHAVIORAL: [
    "Tell me about a difficult bug you owned from discovery through resolution.",
    "Describe a time you disagreed with a technical decision. What did you do?",
    "Tell me about a project where the requirements changed after implementation started.",
    "Describe a time you improved a system outside your assigned work.",
    "Tell me about a mistake you made and how it changed the way you work.",
  ],
};

export function trackLabel(track: InterviewTrackValue) {
  return interviewTracks.find((item) => item.value === track)?.label ?? track;
}

export function levelLabel(level: ExperienceLevelValue) {
  return experienceLevels.find((item) => item.value === level)?.label ?? level;
}
