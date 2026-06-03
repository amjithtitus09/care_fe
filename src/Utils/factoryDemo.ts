/**
 * Converts a human-readable label into a URL-safe slug.
 * - Lowercases the input
 * - Trims leading and trailing whitespace
 * - Replaces non-alphanumeric sequences with a single hyphen
 * - Removes leading and trailing hyphens
 *
 * @param label - The input string to be slugified
 * @returns A URL-safe slug
 */
export function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphen
    .replace(/^-+|-+$/g, "");   // Remove leading/trailing hyphens
}

