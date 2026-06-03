/**
 * Converts a human-readable label into a URL-safe slug.
 * 
 * @param label - The input string to be slugified.
 * @returns A URL-safe slug string.
 */
export function slugifyLabel(label: string): string {
  return label
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

// Example usage:
// slugifyLabel("Hello World!"); // Output: "hello-world"
// slugifyLabel("  React + TypeScript  "); // Output: "react-typescript"
// slugifyLabel("care_fe@2023"); // Output: "care-fe-2023"
