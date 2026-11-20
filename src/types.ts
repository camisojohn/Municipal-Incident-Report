import { z } from "zod";

export const CATEGORIES = [
  "accident",
  "fire",
  "flood",
  "crime",
  "road_hazard",
  "outage",
  "other",
] as const;
export const SEVERITIES = ["low", "medium", "high"] as const;
export const STATUSES = ["pending", "reviewing", "taking_action", "resolved"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type Status = (typeof STATUSES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  accident: "Accident",
  fire: "Fire",
  flood: "Flood",
  crime: "Crime",
  road_hazard: "Road hazard",
  outage: "Outage",
  other: "Other",
};

export const STATUS_LABELS: Record<Status, string> = {
  pending: "Pending",
  reviewing: "Reviewing",
  taking_action: "Taking action",
  resolved: "Resolved",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  accident: "#e63946",
  fire: "#f77f00",
  flood: "#1d7bd8",
  crime: "#6a4c93",
  road_hazard: "#d4a017",
  outage: "#555555",
  other: "#2a9d8f",
};

// Used for sorting
export const SEVERITY_ORDER: Record<Severity, number> = { low: 1, medium: 2, high: 3 };
export const STATUS_ORDER: Record<Status, number> = {
  pending: 0,
  reviewing: 1,
  taking_action: 2,
  resolved: 3,
};

export type Position = { lat: number; lng: number };

// What a resident fills in. Date/time is NOT here: it is recorded automatically.
export const incidentSchema = z.object({
  title: z.string().trim().min(5, "At least 5 characters").max(100, "Max 100 characters"),
  description: z
    .string()
    .trim()
    .min(10, "At least 10 characters")
    .max(1000, "Max 1000 characters"),
  category: z.enum(CATEGORIES),
  severity: z.enum(SEVERITIES),
  lat: z.number(),
  lng: z.number(),
  image: z.string().optional(), // compressed data URL
});
export type IncidentInput = z.infer<typeof incidentSchema>;

export type Role = "user" | "admin";
export type User = { id: string; name: string; role: Role };

export type StatusUpdate = {
  status: Status;
  note?: string;
  at: string; // ISO date
  by: string; // who made the change
};

export type Incident = IncidentInput & {
  id: string;
  createdAt: string; // ISO date, set automatically
  authorId: string;
  authorName: string;
  status: Status;
  history: StatusUpdate[];
};
