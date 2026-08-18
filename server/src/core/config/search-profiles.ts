export const DEFAULT_SEARCH_KEYWORDS = [
  "software engineer",
  "frontend developer",
  "backend developer",
  "full stack developer",
  "react developer",
  "node.js developer",
  "python developer",
  "java developer",
  "data analyst",
  "data scientist",
  "devops engineer",
  "UI UX designer",
  "product manager",
  "business analyst",
  "digital marketing",
  "sales",
] as const;

export const DEFAULT_SEARCH_LOCATIONS = [
  "Delhi",
  "Noida",
  "Gurgaon",
  "Bangalore",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
] as const;

export const INGESTION_CONFIG = {
  DEFAULT_PROVIDER: "jooble",
  MAX_INGESTION_PAGES: 5,
  DEFAULT_RESULTS_PER_PAGE: 20,
} as const;
