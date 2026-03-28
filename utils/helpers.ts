import { clsx, type ClassValue } from "clsx";

/** Tailwind class merge helper */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format bytes into human-readable size */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Format a date relative to now (e.g. "2 min ago") */
export function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

/** Truncate a string to a max length with ellipsis */
export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 1) + "…";
}

/** Generate a random soft color for document badges */
const DOC_COLORS = [
  "#7c3aed", // purple
  "#0d9488", // teal
  "#2563eb", // blue
  "#d97706", // amber
  "#db2777", // pink
  "#059669", // green
  "#dc2626", // red
  "#7c3aed", // purple again
];

let colorIndex = 0;
export function nextDocColor(): string {
  return DOC_COLORS[colorIndex++ % DOC_COLORS.length];
}

/** Generate a short title from the first user message */
export function generateSessionTitle(firstMessage: string): string {
  const clean = firstMessage.trim().replace(/[?!.]+$/, "");
  return clean.length > 40 ? clean.slice(0, 40) + "…" : clean;
}
