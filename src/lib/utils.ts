
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// CORS headers for edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe Environment Variable function for serverless functions
export function getSafeEnv(key: string, fallback: string = ""): string {
  try {
    // Try Deno for edge functions
    if (typeof Deno !== "undefined" && Deno.env) {
      return Deno.env.get(key) ?? fallback;
    }
    // Fallback to process.env for node environments
    if (typeof process !== "undefined" && process.env) {
      return process.env[key as keyof typeof process.env] || fallback;
    }
    return fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${key}:`, err);
    return fallback;
  }
}
