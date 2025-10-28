import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(120, "Slug must be 120 characters or fewer")
  .regex(slugRegex, "Use lowercase letters, numbers, and hyphens only");

export const titleSchema = z
  .string()
  .min(1, "Title is required")
  .max(180, "Title must be 180 characters or fewer");

export function validateSlug(slug: string) {
  return slugSchema.safeParse(slug);
}

export function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
